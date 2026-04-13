import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { regulationsApi } from '@/api/endpoints/regulations';

export function useRegulations(params?: { trades?: string; states?: string }) {
  return useQuery({
    queryKey: ['regulations', params],
    queryFn: async () => {
      const response = await regulationsApi.getAll(params);
      return response.data;
    },
  });
}

export function useUserRegulations() {
  return useQuery({
    queryKey: ['user-regulations'],
    queryFn: async () => {
      const response = await regulationsApi.getUserRegulations();
      return response.data;
    },
  });
}

export function useSaveRegulations() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (regulationIds: string[]) =>
      regulationsApi.saveUserRegulations(regulationIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-regulations'] });
      queryClient.invalidateQueries({ queryKey: ['deadlines'] });
    },
  });
}
