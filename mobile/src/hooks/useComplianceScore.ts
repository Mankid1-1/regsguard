import { useQuery } from '@tanstack/react-query';
import { complianceScoreApi } from '@/api/endpoints/complianceScore';
import { useOfflineStore } from '@/stores/offlineStore';

export function useComplianceScore() {
  const cacheScore = useOfflineStore((s) => s.cacheScore);
  const cachedScore = useOfflineStore((s) => s.cachedScore);
  const isOnline = useOfflineStore((s) => s.isOnline);

  return useQuery({
    queryKey: ['compliance-score'],
    queryFn: async () => {
      const response = await complianceScoreApi.get();
      await cacheScore(response.data);
      return response.data;
    },
    placeholderData: !isOnline && cachedScore ? cachedScore : undefined,
  });
}
