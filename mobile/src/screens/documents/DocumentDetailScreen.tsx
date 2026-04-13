import React, { useState } from 'react';
import { View, StyleSheet, Share, Alert } from 'react-native';
import { Text, Button, Card, Divider, useTheme } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { documentsApi } from '@/api/endpoints/documents';
import { formatDate } from '@/shared/utils/dates';
import type { DocumentStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<DocumentStackParamList, 'DocumentDetail'>;

export function DocumentDetailScreen({ route }: Props) {
  const theme = useTheme();
  const { show } = useToast();
  const { documentId } = route.params;
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const { data: doc, isLoading } = useQuery({
    queryKey: ['document', documentId],
    queryFn: async () => {
      const response = await documentsApi.getById(documentId);
      return response.data;
    },
  });

  const handleGeneratePdf = async () => {
    setGeneratingPdf(true);
    try {
      await documentsApi.generatePdf(documentId);
      show('PDF generated successfully');
    } catch {
      show('Failed to generate PDF');
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (isLoading) return <Loading />;
  if (!doc) return <Loading message="Document not found" />;

  return (
    <ScreenWrapper>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>{doc.title}</Text>
            <Badge label={doc.status} variant={doc.status === 'SIGNED' || doc.status === 'FILED' ? 'success' : 'default'} />
          </View>
          <Badge label={doc.category} variant="outline" />

          <Divider style={styles.divider} />

          <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Template</Text>
          <Text style={{ color: theme.colors.onSurface, marginBottom: 8 }}>{doc.templateSlug}</Text>

          {doc.client && (
            <>
              <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Client</Text>
              <Text style={{ color: theme.colors.onSurface, marginBottom: 8 }}>
                {doc.client.companyName || doc.client.name}
              </Text>
            </>
          )}

          {doc.project && (
            <>
              <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Project</Text>
              <Text style={{ color: theme.colors.onSurface, marginBottom: 8 }}>{doc.project.name}</Text>
            </>
          )}

          <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Created</Text>
          <Text style={{ color: theme.colors.onSurface, marginBottom: 8 }}>
            {formatDate(new Date(doc.createdAt))}
          </Text>
        </Card.Content>
      </Card>

      {/* Document Data */}
      {doc.data && Object.keys(doc.data).length > 0 && (
        <Card style={styles.card}>
          <Card.Title title="Document Fields" />
          <Card.Content>
            {Object.entries(doc.data).map(([key, value]) => (
              <View key={key} style={styles.fieldRow}>
                <Text style={[styles.fieldKey, { color: theme.colors.onSurfaceVariant }]}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                </Text>
                <Text style={{ color: theme.colors.onSurface }}>{value || '-'}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Signatures */}
      {doc.signatures && doc.signatures.length > 0 && (
        <Card style={styles.card}>
          <Card.Title title="Signatures" />
          <Card.Content>
            {doc.signatures.map((sig) => (
              <View key={sig.id} style={styles.sigRow}>
                <Text style={{ color: theme.colors.onSurface }}>{sig.signerName}</Text>
                <Badge label={sig.status} variant={sig.status === 'SIGNED' ? 'success' : sig.status === 'DECLINED' ? 'danger' : 'warning'} />
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      <View style={styles.actions}>
        <Button mode="contained" onPress={handleGeneratePdf} loading={generatingPdf} icon="file-pdf-box">
          Generate PDF
        </Button>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', flex: 1, marginRight: 8 },
  divider: { marginVertical: 12 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  fieldRow: { marginBottom: 8 },
  fieldKey: { fontSize: 12, marginBottom: 2 },
  sigRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  actions: { marginTop: 8, marginBottom: 24, gap: 8 },
});
