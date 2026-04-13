import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ceCreditsApi } from '@/api/endpoints/ceCredits';

export function useCECredits() {
  return useQuery({
    queryKey: ['ce-credits'],
    queryFn: async () => {
      const response = await ceCreditsApi.getAll();
      return response.data;
    },
  });
}

export function useCreateCECredit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ceCreditsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ce-credits'] });
    },
  });
}

export function useDeleteCECredit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ceCreditsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ce-credits'] });
    },
  });
}
