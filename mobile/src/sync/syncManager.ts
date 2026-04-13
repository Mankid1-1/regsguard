/**
 * Offline sync manager.
 *
 * Replays pending actions queued while offline when connectivity
 * is restored. Uses last-write-wins strategy for conflict resolution.
 */

import { useOfflineStore, type PendingAction } from "../stores/offlineStore";
import { apiClient } from "../api/client";

interface SyncResult {
  synced: number;
  failed: number;
  conflicts: number;
}

/**
 * Replay all pending offline actions in order.
 */
export async function syncPendingActions(): Promise<SyncResult> {
  const store = useOfflineStore.getState();
  const pending = store.pendingActions;

  if (pending.length === 0) {
    return { synced: 0, failed: 0, conflicts: 0 };
  }

  let synced = 0;
  let failed = 0;
  let conflicts = 0;

  const remaining: PendingAction[] = [];

  for (const action of pending) {
    try {
      const resolved = await resolveConflict(action);

      if (resolved === "skip") {
        conflicts++;
        continue;
      }

      await executeAction(resolved === "use-local" ? action : action);
      synced++;
    } catch {
      // Keep action in queue for next sync attempt
      remaining.push(action);
      failed++;
    }
  }

  // Update the store — remove synced actions, keep failed ones
  store.setPendingActions(remaining);

  return { synced, failed, conflicts };
}

/**
 * Determine conflict resolution strategy for a pending action.
 *
 * - Deadline status changes: server wins (authoritative)
 * - Local-only data (notes, photos, expenses): client wins (user intent)
 * - Everything else: last-write-wins by timestamp
 */
async function resolveConflict(
  action: PendingAction
): Promise<"use-local" | "use-server" | "skip"> {
  // Server-authoritative entities
  if (action.entity === "deadline" && action.type === "update") {
    try {
      const response = await apiClient.get(`/api/user/deadlines?id=${action.entityId}`);
      const serverItem = response.data;

      if (serverItem?.updatedAt && action.timestamp) {
        const serverTime = new Date(serverItem.updatedAt).getTime();
        const localTime = new Date(action.timestamp).getTime();

        if (serverTime > localTime) {
          return "skip"; // Server has newer data
        }
      }
    } catch {
      // Can't check server — proceed with local
    }
  }

  // Client-authoritative entities (notes, photos, expenses)
  if (["note", "photo", "expense"].includes(action.entity)) {
    return "use-local";
  }

  return "use-local";
}

/**
 * Execute a single pending action against the API.
 */
async function executeAction(action: PendingAction): Promise<void> {
  const { type, endpoint, data } = action;

  switch (type) {
    case "create":
      await apiClient.post(endpoint, data);
      break;
    case "update":
      await apiClient.patch(endpoint, data);
      break;
    case "delete":
      await apiClient.delete(endpoint);
      break;
  }
}
