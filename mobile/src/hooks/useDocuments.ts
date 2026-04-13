import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '@/api/endpoints/documents';
import type { DocumentCategory } from '@/shared/types';

export function useDocuments(category?: DocumentCategory) {
  return useQuery({
    queryKey: ['documents', { category }],
    queryFn: async () => {
      const response = await documentsApi.getAll(category ? { category } : undefined);
      return response.data;
    },
  });
}

export function useDocumentTemplates() {
  return useQuery({
    queryKey: ['document-templates'],
    queryFn: async () => {
      const response = await documentsApi.getTemplates();
      return response.data;
    },
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { templateSlug: string; title: string; clientId?: string; projectId?: string; data?: Record<string, string> }) =>
      documentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}
