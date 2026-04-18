import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Server-Sent Events endpoint for real-time notification updates.
 *
 * Sends an unread count immediately on connect, then polls every
 * 10 seconds for changes. Auto-closes after 5 minutes; the client
 * is expected to reconnect (EventSource does this automatically).
 */
export async function GET(request: Request) {
  const user = await getDbUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = user.id;
  let lastCount = -1;
  let closed = false;
  let interval: ReturnType<typeof setInterval> | null = null;
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      function safeEnqueue(chunk: Uint8Array): boolean {
        if (closed) return false;
        try {
          controller.enqueue(chunk);
          return true;
        } catch {
          // Controller was closed between our check and the enqueue.
          closed = true;
          return false;
        }
      }

      function send(eventName: string, data: unknown): boolean {
        return safeEnqueue(
          encoder.encode(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      }

      function cleanup() {
        if (closed) return;
        closed = true;
        if (interval) clearInterval(interval);
        if (timeout) clearTimeout(timeout);
        try {
          controller.close();
        } catch {
          // Already closed by the runtime — fine.
        }
      }

      // Bail if client already disconnected before we started.
      request.signal.addEventListener("abort", cleanup);

      try {
        const initialCount = await prisma.notification.count({
          where: { userId, read: false },
        });
        lastCount = initialCount;
        if (!send("unread", { count: initialCount })) {
          cleanup();
          return;
        }
      } catch {
        cleanup();
        return;
      }

      interval = setInterval(async () => {
        if (closed) return;
        try {
          const count = await prisma.notification.count({
            where: { userId, read: false },
          });
          if (count !== lastCount) {
            lastCount = count;
            if (!send("unread", { count })) {
              cleanup();
              return;
            }
          }
          if (!safeEnqueue(encoder.encode(": heartbeat\n\n"))) {
            cleanup();
          }
        } catch {
          cleanup();
        }
      }, 10_000);

      // Auto-close after 5 minutes; client EventSource will reconnect.
      timeout = setTimeout(cleanup, 5 * 60 * 1000);
    },

    cancel() {
      closed = true;
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      // Tell Cloudflare not to buffer or cache the streaming response.
      "X-Accel-Buffering": "no",
    },
  });
}
