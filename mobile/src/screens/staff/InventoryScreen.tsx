import { ReactNode, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius } from '../../theme';
import { useData } from '../../data/DataContext';
import { Equipment, EquipmentStatus } from '../../types';
import { RootStackParams } from '../../navigation/types';
import MaintenanceConfirmSheet from '../../components/MaintenanceConfirmSheet';
import { bookingHour, hh, isoDate } from '../../utils/format';

const ALL_LABS = 'All Labs';
const STATUS_FILTERS = ['All', 'Available', 'Borrowed', 'Maintenance'] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

function Chip({ label, active, onPress, right }: { label: string; active: boolean; onPress: () => void; right?: ReactNode }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, { color: active ? '#fff' : colors.text }]}>{label}</Text>
      {right}
    </Pressable>
  );
}

export default function InventoryScreen() {
  const { equipment, reservations, busySlots, loading, error, refresh, saveEquipment } = useData();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const now = bookingHour();
  const today = isoDate();

  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [lab, setLab] = useState(ALL_LABS);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [labPickerOpen, setLabPickerOpen] = useState(false);
  const [pending, setPending] = useState<Equipment | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const labs = [ALL_LABS, ...Array.from(new Set(equipment.map((e) => e.lab)))];

  const busyNow = (e: Equipment) =>
    busySlots.find((r) => r.equipmentId === e.id && r.date === today && r.startHour <= now && r.endHour > now);

  const effective = (e: Equipment): EquipmentStatus =>
    e.status === 'maintenance' ? 'maintenance' : e.status === 'borrowed' || busyNow(e) ? 'borrowed' : 'available';

  const upcomingCount = (id: string) =>
    reservations.filter(
      (r) =>
        r.equipmentId === id &&
        (r.status === 'pending' || r.status === 'approved') &&
        (r.date > today || (r.date === today && r.endHour > now))
    ).length;

  const q = query.trim().toLowerCase();
  const results = equipment.filter((e) => {
    const textOk = q === '' || [e.name, e.id, e.category, e.lab, e.location].some((v) => v.toLowerCase().includes(q));
    const labOk = lab === ALL_LABS || e.lab === lab;
    const statusOk = statusFilter === 'All' || effective(e) === statusFilter.toLowerCase();
    return textOk && labOk && statusOk;
  });

  const apply = async (item: Equipment, status: EquipmentStatus, cancelled: number) => {
    setSaving(true);
    try {
      await saveEquipment({ ...item, status }, false);
      setToast(
        status === 'maintenance'
          ? `Set to Maintenance${cancelled > 0 ? ` · ${cancelled} ${cancelled === 1 ? 'booking' : 'bookings'} cancelled` : ''}`
          : 'Set to Available'
      );
    } catch (e) {
      setToast(e instanceof Error ? e.message : 'Could not update status.');
    } finally {
      setSaving(false);
      setPending(null);
    }
  };

  const requestStatus = (item: Equipment, next: 'available' | 'maintenance') => {
    if (saving || effective(item) === next) return;
    if (next === 'maintenance' && upcomingCount(item.id) > 0) {
      setPending(item);
      return;
    }
    void apply(item, next, 0);
  };

  const renderItem = ({ item }: { item: Equipment }) => {
    const st = effective(item);
    const busy = busyNow(item);
    return (
      <Pressable
        style={styles.card}
        accessibilityRole="button"
        onPress={() => navigation.navigate('EquipmentForm', { equipmentId: item.id })}
      >
        <Text style={styles.cardCode}>{item.id} · {item.category.toUpperCase()}</Text>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardMeta}>{item.lab} · {item.location}</Text>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status:</Text>
          {st === 'borrowed' ? (
            <>
              <View style={styles.borrowedBadge}>
                <Text style={styles.borrowedText}>Borrowed</Text>
              </View>
              <Text style={styles.activeText}>
                {busy ? `Active booking until ${hh(busy.endHour)}` : item.availableFrom ? `Free from ${item.availableFrom}` : 'Currently in use'}
              </Text>
            </>
          ) : (
            <View style={styles.pills}>
              <Pressable
                onPress={() => requestStatus(item, 'available')}
                style={[styles.pill, st === 'available' && styles.pillAvailable]}
              >
                <Text style={[styles.pillText, st === 'available' && { color: colors.extra.blue013D72 }]}>Available</Text>
              </Pressable>
              <Pressable
                onPress={() => requestStatus(item, 'maintenance')}
                style={[styles.pill, st === 'maintenance' && styles.pillMaint]}
              >
                <Text style={[styles.pillText, st === 'maintenance' && { color: colors.maintenanceText }]}>Maintenance</Text>
              </Pressable>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Inventory</Text>
          <Pressable style={styles.addBtn} onPress={() => navigation.navigate('EquipmentForm', {})} accessibilityRole="button">
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.addText}>Add Item</Text>
          </Pressable>
        </View>

        <View style={[styles.search, focused && { borderColor: colors.primary }]}>
          <Ionicons name="search-outline" size={18} color={focused ? colors.primary : colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search inventory by name or ID"
            placeholderTextColor={colors.textPlaceholder}
            autoCorrect={false}
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
        style={{ flexGrow: 0, flexShrink: 0 }}
        contentContainerStyle={styles.chips}
        keyboardShouldPersistTaps="handled"
      >
        <Chip
          label={lab}
          active={lab !== ALL_LABS}
          onPress={() => setLabPickerOpen(true)}
          right={<Ionicons name="chevron-down" size={14} color={lab !== ALL_LABS ? '#fff' : colors.textMuted} />}
        />
        {STATUS_FILTERS.map((s) => (
          <Chip key={s} label={s} active={statusFilter === s} onPress={() => setStatusFilter(s)} />
        ))}
      </ScrollView>

      <FlatList
        style={{ marginTop: 12 }}
        refreshing={loading}
        onRefresh={() => { void refresh(); }}
        ListHeaderComponent={
          error ? <Text accessibilityRole="alert" style={{ padding: 12, color: colors.danger }}>{error} Pull down to retry.</Text> : undefined
        }
        data={results}
        keyExtractor={(e) => e.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={<Text style={styles.empty}>No equipment matches your filters.</Text>}
      />

      {toast !== '' && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
          <Pressable onPress={() => setToast('')} hitSlop={12}>
            <Text style={styles.toastDismiss}>Dismiss</Text>
          </Pressable>
        </View>
      )}

      <MaintenanceConfirmSheet
        visible={!!pending}
        item={pending}
        bookingCount={pending ? upcomingCount(pending.id) : 0}
        busy={saving}
        onCancel={() => setPending(null)}
        onConfirm={() => pending && apply(pending, 'maintenance', upcomingCount(pending.id))}
      />

      <Modal transparent animationType="fade" visible={labPickerOpen} onRequestClose={() => setLabPickerOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setLabPickerOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Lab</Text>
            {labs.map((l) => (
              <Pressable key={l} style={styles.sheetRow} onPress={() => { setLab(l); setLabPickerOpen(false); }}>
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
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  title: { fontSize: 26, fontWeight: '700', color: colors.text },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4, height: 40, paddingHorizontal: 14,
    borderRadius: radius.button, backgroundColor: colors.primary,
  },
  addText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  search: {
    flexDirection: 'row', alignItems: 'center', gap: 10, height: 48, paddingHorizontal: 14,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.button,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.text, paddingVertical: 0 },
  chips: { paddingHorizontal: 20, paddingTop: 12, gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, height: 40, paddingHorizontal: 14,
    borderRadius: radius.chip, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.card,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '600' },
  list: { paddingHorizontal: 20, paddingBottom: 90, flexGrow: 1 },
  card: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.card, paddingHorizontal: 16, paddingVertical: 14,
  },
  cardCode: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, color: colors.textMuted },
  cardName: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 4 },
  cardMeta: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  statusRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap',
    marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border,
  },
  statusLabel: { fontSize: 12, color: colors.textSecondary },
  pills: { flexDirection: 'row', gap: 8, flex: 1, justifyContent: 'flex-end' },
  pill: {
    height: 32, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1,
    borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center',
  },
  pillAvailable: { backgroundColor: colors.extra.cyanC7F9FE, borderColor: colors.extra.blue7B91B0 },
  pillMaint: { backgroundColor: colors.maintenanceBg, borderColor: colors.maintenanceDot },
  pillText: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  borrowedBadge: { backgroundColor: colors.borrowedBg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  borrowedText: { fontSize: 12, fontWeight: '600', color: colors.borrowedText },
  activeText: { fontSize: 12, color: colors.textMuted, flex: 1, textAlign: 'right' },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40, fontSize: 14 },
  toast: {
    position: 'absolute', left: 20, right: 20, bottom: 12, minHeight: 44, borderRadius: radius.button,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, gap: 12,
  },
  toastText: { flex: 1, fontSize: 12, fontWeight: '600', color: colors.text },
  toastDismiss: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
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