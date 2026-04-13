import { create } from 'zustand';
import { storage } from '@/utils/storage';
import type { UserDeadline, ComplianceScore } from '@/shared/types';

export interface PendingAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  entityId?: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: unknown;
  timestamp: string;
  createdAt: string;
}

interface SyncResult {
  synced: number;
  failed: number;
  conflicts: number;
}

interface OfflineState {
  isOnline: boolean;
  cachedDeadlines: UserDeadline[];
  cachedScore: ComplianceScore | null;
  pendingActions: PendingAction[];
  lastSyncedAt: string | null;
  isSyncing: boolean;
  lastSyncResult: SyncResult | null;
  setOnline: (isOnline: boolean) => void;
  cacheDeadlines: (deadlines: UserDeadline[]) => Promise<void>;
  cacheScore: (score: ComplianceScore) => Promise<void>;
  addPendingAction: (action: Omit<PendingAction, 'id' | 'createdAt'>) => Promise<void>;
  setPendingActions: (actions: PendingAction[]) => void;
  clearPendingActions: () => Promise<void>;
  sync: () => Promise<SyncResult>;
  hydrate: () => Promise<void>;
}

export const useOfflineStore = create<OfflineState>((set, get) => ({
  isOnline: true,
  cachedDeadlines: [],
  cachedScore: null,
  pendingActions: [],
  lastSyncedAt: null,
  isSyncing: false,
  lastSyncResult: null,

  setOnline: (isOnline) => set({ isOnline }),

  cacheDeadlines: async (deadlines) => {
    await storage.set('cached_deadlines', deadlines);
    set({ cachedDeadlines: deadlines, lastSyncedAt: new Date().toISOString() });
  },

  cacheScore: async (score) => {
    await storage.set('cached_score', score);
    set({ cachedScore: score });
  },

  addPendingAction: async (action) => {
    const pending = get().pendingActions;
    const newAction: PendingAction = {
      ...action,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...pending, newAction];
    await storage.set('pending_actions', updated);
    set({ pendingActions: updated });
  },

  setPendingActions: (actions) => {
    storage.set('pending_actions', actions);
    set({ pendingActions: actions });
  },

  clearPendingActions: async () => {
    await storage.remove('pending_actions');
    set({ pendingActions: [] });
  },

  sync: async () => {
    const state = get();
    if (state.isSyncing || !state.isOnline || state.pendingActions.length === 0) {
      return { synced: 0, failed: 0, conflicts: 0 };
    }

    set({ isSyncing: true });

    try {
      // Dynamic import to avoid circular dependency
      const { syncPendingActions } = await import('../sync/syncManager');
      const result = await syncPendingActions();
      set({
        isSyncing: false,
        lastSyncedAt: new Date().toISOString(),
        lastSyncResult: result,
      });
      return result;
    } catch {
      set({ isSyncing: false });
      return { synced: 0, failed: 0, conflicts: 0 };
    }
  },

  hydrate: async () => {
    const deadlines = (await storage.get<UserDeadline[]>('cached_deadlines')) ?? [];
    const score = await storage.get<ComplianceScore>('cached_score');
    const pending = (await storage.get<PendingAction[]>('pending_actions')) ?? [];
    set({ cachedDeadlines: deadlines, cachedScore: score, pendingActions: pending });
  },
}));
