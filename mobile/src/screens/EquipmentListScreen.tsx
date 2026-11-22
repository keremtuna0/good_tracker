import { ReactNode, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';
import { equipment } from '../data/sampleData';
import { Equipment } from '../types';
import StatusBadge from '../components/StatusBadge';

const ALL_LABS = 'All Labs';
const ALL = 'All';
const labs = [ALL_LABS, ...Array.from(new Set(equipment.map((e) => e.lab)))];
const categories = [ALL, ...Array.from(new Set(equipment.map((e) => e.category)))];

function availabilityLine(e: Equipment) {
  if (e.status === 'available') return { text: 'Ready to book', color: colors.primaryDark };
  if (e.status === 'borrowed')
    return { text: e.availableFrom ? `Free from ${e.availableFrom}` : 'Currently borrowed', color: colors.borrowedText };
  return { text: 'Temporarily out of service', color: colors.textSecondary };
}

function Chip({ label, active, onPress, left, right }: {
  label: string; active: boolean; onPress: () => void; left?: ReactNode; right?: ReactNode;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={[styles.chip, active && styles.chipActive]}>
      {left}
      <Text style={[styles.chipText, { color: active ? '#fff' : colors.text }]}>{label}</Text>
      {right}
    </Pressable>
  );
}

export default function EquipmentListScreen() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [lab, setLab] = useState(ALL_LABS);
  const [category, setCategory] = useState(ALL);
  const [labPickerOpen, setLabPickerOpen] = useState(false);

  const filtersActive = query.trim() !== '' || availableOnly || lab !== ALL_LABS || category !== ALL;

  const matches = (e: Equipment, onlyAvailable: boolean) => {
    const q = query.trim().toLowerCase();
    const textOk = q === '' || [e.name, e.id, e.category, e.lab].some((v) => v.toLowerCase().includes(q));
    return (
      textOk &&
      (lab === ALL_LABS || e.lab === lab) &&
      (category === ALL || e.category === category) &&
      (!onlyAvailable || e.status === 'available')
    );
  };

  const results = equipment.filter((e) => matches(e, availableOnly));
  const resultsIfAllStatuses = equipment.filter((e) => matches(e, false)).length;

  const clearAll = () => {
    setQuery('');
    setAvailableOnly(false);
    setLab(ALL_LABS);
    setCategory(ALL);
  };

  const renderEmpty = () => {
    const turnOffAvailable = availableOnly && resultsIfAllStatuses > 0;
    const q = query.trim();
    return (
      <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          <Ionicons name="search-outline" size={24} color={colors.text} />
        </View>
        <Text style={styles.emptyTitle}>
          {turnOffAvailable ? 'No available items match' : 'No items match your search'}
        </Text>
        <Text style={styles.emptyText}>
          {turnOffAvailable
            ? `No available items match${q ? ` "${q}"` : ''}${lab !== ALL_LABS ? ` in ${lab}` : ''}. Try turning off Available now.`
            : 'No equipment was found with the current filters. Reset filters to browse all items.'}
        </Text>
        <Pressable
          style={styles.emptyButton}
          onPress={turnOffAvailable ? () => setAvailableOnly(false) : clearAll}
        >
          <Text style={styles.emptyButtonText}>
            {turnOffAvailable ? 'Show unavailable too' : 'Clear filters'}
          </Text>
        </Pressable>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Find Equipment</Text>

        <View style={[styles.search, focused && styles.searchFocused]}>
          <Ionicons name="search-outline" size={18} color={focused ? colors.primary : colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search cable, adapter, tool"
            placeholderTextColor={colors.textPlaceholder}
            autoCorrect={false}
            returnKeyType="search"
          />
          {query !== '' && (
            <Pressable onPress={() => setQuery('')} hitSlop={12} accessibilityLabel="Clear search">
              <Ionicons name="close" size={20} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={styles.chips}
        keyboardShouldPersistTaps="handled"
      >
        <Chip
          label="Available now"
          active={availableOnly}
          onPress={() => setAvailableOnly((v) => !v)}
          left={
            availableOnly ? (
              <Ionicons name="checkmark" size={16} color="#fff" />
            ) : (
              <View style={styles.greenDot} />
            )
          }
        />
        <Chip
          label={lab}
          active={lab !== ALL_LABS}
          onPress={() => setLabPickerOpen(true)}
          left={<Ionicons name="location-outline" size={16} color={lab !== ALL_LABS ? '#fff' : colors.primary} />}
          right={<Ionicons name="chevron-down" size={16} color={lab !== ALL_LABS ? '#fff' : colors.textMuted} />}
        />
        {categories.map((c) => (
          <Chip key={c} label={c} active={category === c} onPress={() => setCategory(c)} />
        ))}
      </ScrollView>

      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {results.length} {results.length === 1 ? 'result' : 'results'}
        </Text>
        {filtersActive && (
          <Pressable onPress={clearAll} hitSlop={12}>
            <Text style={styles.clear}>Clear</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={results}
        keyExtractor={(e) => e.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={renderEmpty}
        renderItem={({ item }) => {
          const line = availabilityLine(item);
          return (
            <Pressable
              style={styles.card}
              accessibilityRole="button"
              onPress={() => {
                // Sonraki adım: detay ekranına git
              }}
            >
              <View style={styles.cardTop}>
                <Text style={styles.cardName}>{item.name}</Text>
                <StatusBadge status={item.status} />
              </View>
              <Text style={styles.cardMeta}>{item.category} · {item.lab}</Text>
              <View style={styles.cardBottom}>
                <Text style={[styles.cardLine, { color: line.color }]}>{line.text}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </View>
            </Pressable>
          );
        }}
      />

      <Modal transparent animationType="fade" visible={labPickerOpen} onRequestClose={() => setLabPickerOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setLabPickerOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Lab</Text>
            {labs.map((l) => (
              <Pressable
                key={l}
                style={styles.sheetRow}
                onPress={() => { setLab(l); setLabPickerOpen(false); }}
              >
                <Text style={[styles.sheetText, l === lab && { color: colors.primaryDark, fontWeight: '700' }]}>{l}</Text>
                {l === lab && <Ionicons name="checkmark" size={20} color={colors.primary} />}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 16 },
  title: { fontSize: 26, fontWeight: '700', color: colors.text, marginBottom: 14 },
  search: {
    flexDirection: 'row', alignItems: 'center', gap: 10, height: 48, paddingHorizontal: 14,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.button,
  },
  searchFocused: { borderColor: colors.primary },
  searchInput: { flex: 1, fontSize: 14, color: colors.text, paddingVertical: 0 },
  chips: { paddingHorizontal: 20, paddingTop: 12, gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, height: 44, paddingHorizontal: 16,
    borderRadius: radius.chip, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.card,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 14, fontWeight: '600' },
  greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  summary: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 10,
  },
  summaryText: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  clear: { fontSize: 13, fontWeight: '700', color: colors.primary },
  list: { paddingHorizontal: 20, paddingBottom: 24, flexGrow: 1 },
  card: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.card, paddingHorizontal: 16, paddingVertical: 14,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  cardName: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.text, lineHeight: 20 },
  cardMeta: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  cardBottom: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border,
  },
  cardLine: { fontSize: 13, fontWeight: '600' },
  empty: {
    flex: 1, minHeight: 320, alignItems: 'center', justifyContent: 'center', padding: 24,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card,
  },
  emptyIcon: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text, textAlign: 'center' },
  emptyText: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 6, lineHeight: 19 },
  emptyButton: {
    height: 44, paddingHorizontal: 22, borderRadius: radius.button, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginTop: 18,
  },
  emptyButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 28,
  },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 8 },
  sheetRow: {
    minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  sheetText: { fontSize: 15, color: colors.text },
});