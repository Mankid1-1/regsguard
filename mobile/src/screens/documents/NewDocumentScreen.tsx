import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Card, Chip, useTheme } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { useDocumentTemplates, useCreateDocument } from '@/hooks/useDocuments';
import { useClients } from '@/hooks/useClients';
import { useProjects } from '@/hooks/useProjects';
import { documentsApi } from '@/api/endpoints/documents';
import type { DocumentStackParamList } from '@/navigation/types';
import type { DocumentTemplate } from '@/shared/types';

type Props = NativeStackScreenProps<DocumentStackParamList, 'NewDocument'>;

export function NewDocumentScreen({ navigation }: Props) {
  const theme = useTheme();
  const { show } = useToast();
  const { data: templates, isLoading } = useDocumentTemplates();
  const { data: clients } = useClients();
  const { data: projects } = useProjects();
  const createDoc = useCreateDocument();

  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [title, setTitle] = useState('');
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filteredTemplates = categoryFilter === 'ALL'
    ? templates
    : templates?.filter((t) => t.category === categoryFilter);

  const handleAutoFill = async () => {
    if (!selectedTemplate) return;
    try {
      const response = await documentsApi.autofill(selectedTemplate.slug);
      setFieldValues((prev) => ({ ...prev, ...response.data }));
      show('Fields auto-filled from profile');
    } catch {
      show('Auto-fill failed');
    }
  };

  const handleCreate = async () => {
    if (!selectedTemplate || !title) return;
    try {
      await createDoc.mutateAsync({
        templateSlug: selectedTemplate.slug,
        title,
        data: fieldValues,
      });
      show('Document created');
      navigation.goBack();
    } catch {
      show('Failed to create document');
    }
  };

  if (isLoading) return <Loading />;

  // Template selection view
  if (!selectedTemplate) {
    const categories = ['ALL', ...new Set(templates?.map((t) => t.category) ?? [])];
    return (
      <ScreenWrapper>
        <Text style={[styles.heading, { color: theme.colors.onSurface }]}>Choose a template</Text>

        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(c) => c}
          style={styles.filterRow}
          renderItem={({ item }) => (
            <Chip
              selected={categoryFilter === item}
              onPress={() => setCategoryFilter(item)}
              style={styles.filterChip}
              compact
            >
              {item === 'ALL' ? 'All' : item.replace('_', ' ')}
            </Chip>
          )}
        />

        <FlatList
          data={filteredTemplates}
          keyExtractor={(t) => t.slug}
          numColumns={2}
          columnWrapperStyle={styles.templateGrid}
          renderItem={({ item: tmpl }) => (
            <TouchableOpacity
              style={[styles.templateCard, { borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface }]}
              onPress={() => {
                setSelectedTemplate(tmpl);
                setTitle(tmpl.name);
              }}
            >
              <Badge label={tmpl.category} variant="outline" size="sm" />
              <Text style={[styles.templateName, { color: theme.colors.onSurface }]}>{tmpl.name}</Text>
              <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }} numberOfLines={2}>
                {tmpl.description}
              </Text>
            </TouchableOpacity>
          )}
        />
      </ScreenWrapper>
    );
  }

  // Form fill view
  const sections = [...new Set(selectedTemplate.fields.map((f) => f.section || 'Details'))];

  return (
    <ScreenWrapper>
      <Button mode="text" onPress={() => setSelectedTemplate(null)} icon="arrow-left" style={styles.backBtn}>
        Back to templates
      </Button>

      <Card style={styles.formCard}>
        <Card.Content>
          <TextInput
            mode="outlined"
            label="Document Title"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />
          <Button mode="outlined" onPress={handleAutoFill} icon="auto-fix" style={styles.autoFill}>
            Auto-Fill from Profile
          </Button>
        </Card.Content>
      </Card>

      {sections.map((section) => (
        <Card key={section} style={styles.formCard}>
          <Card.Title title={section} />
          <Card.Content>
            {selectedTemplate.fields
              .filter((f) => (f.section || 'Details') === section)
              .map((field) => (
                <TextInput
                  key={field.name}
                  mode="outlined"
                  label={`${field.label}${field.required ? ' *' : ''}`}
                  placeholder={field.placeholder}
                  value={fieldValues[field.name] || ''}
                  onChangeText={(v) => setFieldValues((prev) => ({ ...prev, [field.name]: v }))}
                  keyboardType={field.type === 'number' || field.type === 'currency' ? 'numeric' : field.type === 'email' ? 'email-address' : 'default'}
                  multiline={field.type === 'textarea'}
                  numberOfLines={field.type === 'textarea' ? 3 : 1}
                  style={styles.input}
                />
              ))}
          </Card.Content>
        </Card>
      ))}

      <View style={styles.actions}>
        <Button mode="outlined" onPress={() => navigation.goBack()}>Cancel</Button>
        <Button
          mode="contained"
          onPress={handleCreate}
          loading={createDoc.isPending}
          disabled={!title || createDoc.isPending}
        >
          Create & Save
        </Button>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  filterRow: { marginBottom: 12 },
  filterChip: { marginRight: 6 },
  templateGrid: { gap: 8 },
  templateCard: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 8 },
  templateName: { fontSize: 14, fontWeight: '600', marginVertical: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 8 },
  formCard: { marginBottom: 12 },
  input: { marginBottom: 8 },
  autoFill: { marginTop: 4 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 8, marginBottom: 24 },
});
