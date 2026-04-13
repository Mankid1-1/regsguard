import { useQuery } from '@tanstack/react-query';
import { deadlinesApi } from '@/api/endpoints/deadlines';
import { useOfflineStore } from '@/stores/offlineStore';
import type { DeadlineStatus } from '@/shared/types';

export function useDeadlines(params?: { status?: DeadlineStatus; days?: number }) {
  const cacheDeadlines = useOfflineStore((s) => s.cacheDeadlines);
  const cachedDeadlines = useOfflineStore((s) => s.cachedDeadlines);
  const isOnline = useOfflineStore((s) => s.isOnline);

  return useQuery({
    queryKey: ['deadlines', params],
    queryFn: async () => {
      const response = await deadlinesApi.getAll(params);
      await cacheDeadlines(response.data.deadlines);
      return response.data;
    },
    placeholderData: !isOnline && cachedDeadlines.length > 0
      ? { deadlines: cachedDeadlines, total: cachedDeadlines.length, params: { days: params?.days ?? 90 } }
      : undefined,
  });
}
