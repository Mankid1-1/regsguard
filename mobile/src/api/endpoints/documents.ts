import { apiClient } from '../client';
import type { Document, DocumentCategory, DocumentTemplate } from '@/shared/types';

export const documentsApi = {
  getAll: (params?: { category?: DocumentCategory }) =>
    apiClient.get<Document[]>('/api/documents', { params }),

  getById: (id: string) =>
    apiClient.get<Document>(`/api/documents/${id}`),

  create: (data: { templateSlug: string; title: string; clientId?: string; projectId?: string; data?: Record<string, string> }) =>
    apiClient.post<Document>('/api/documents', data),

  delete: (id: string) =>
    apiClient.delete(`/api/documents/${id}`),

  generatePdf: (id: string) =>
    apiClient.get(`/api/documents/${id}/pdf`, { responseType: 'arraybuffer' }),

  getTemplates: () =>
    apiClient.get<DocumentTemplate[]>('/api/documents/templates'),

  autofill: (templateSlug: string, clientId?: string, projectId?: string) =>
    apiClient.post<Record<string, string>>('/api/documents/autofill', { templateSlug, clientId, projectId }),
};
