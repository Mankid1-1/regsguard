import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Server-Sent Events endpoint for real-time notification updates.
 *
 * Sends an unread count immediately on connect, then polls
 * every 10 seconds for changes (much cheaper than client polling
 * since it's a single long-lived connection).
 *
 * Falls back gracefully — clients that can't use SSE should
 * poll the regular notifications endpoint.
 */
export async function GET() {
  const user = await getDbUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = user.id;
  let lastCount = -1;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      function send(eventName: string, data: unknown) {
        controller.enqueue(
          encoder.encode(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      }

      // Send initial unread count
      const initialCount = await prisma.notification.count({
        where: { userId, read: false },
      });
      lastCount = initialCount;
      send("unread", { count: initialCount });

      // Poll for changes every 10 seconds
      const interval = setInterval(async () => {
        try {
          const count = await prisma.notification.count({
            where: { userId, read: false },
          });

          // Only send if count changed
          if (count !== lastCount) {
            lastCount = count;
            send("unread", { count });
          }

          // Send heartbeat to keep connection alive
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          // Client may have disconnected
          clearInterval(interval);
          controller.close();
        }
      }, 10_000);

      // Cleanup on abort
      const cleanup = () => {
        clearInterval(interval);
        try {
          controller.close();
        } catch {
          // Already closed
        }
      };

      // Auto-close after 5 minutes to prevent zombie connections
      setTimeout(cleanup, 5 * 60 * 1000);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
