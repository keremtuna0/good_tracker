import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, radius, MAX_HOURS } from '../theme';
import { useAuth } from '../auth/AuthContext';
import { useData } from '../data/DataContext';
import { ApiError } from '../api/client';
import { RootStackParams } from '../navigation/types';
import StatusBadge from '../components/StatusBadge';
import { dayNumber, duration, formatDate, formatRange, bookingHour, isoDate, monthYear, shortDay } from '../utils/format';

const FIRST_HOUR = 9;
const END_HOUR = 17;
const HOURS = Array.from({ length: END_HOUR - FIRST_HOUR }, (_, i) => FIRST_HOUR + i);
const DAYS_AHEAD = 5;

type Props = NativeStackScreenProps<RootStackParams, 'EquipmentDetail'>;
type SlotState = 'free' | 'selected' | 'booked' | 'requested' | 'past' | 'limit';

const LIMIT_MSG = `Max ${MAX_HOURS} consecutive hours reached. Deselect the first or last slot to pick another.`;

export default function EquipmentDetailScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const { equipment, reservations, busySlots, addReservation, refresh, error } = useData();
  const item = equipment.find((e) => e.id === route.params.equipmentId);

  const dates = useMemo(() => Array.from({ length: DAYS_AHEAD }, (_, i) => isoDate(i)), []);
  const [date, setDate] = useState(dates[0]);
  const [sel, setSel] = useState<{ start: number; end: number } | null>(null);
  const [notice, setNotice] = useState('');
  const [conflict, setConflict] = useState<{ date: string; startHour: number; endHour: number } | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!item || !user) return null;

  const today = dates[0];
  const currentHour = bookingHour();
  const dayReservations = reservations.filter((r) => r.equipmentId === item.id && r.date === date);
  const covers = (r: { startHour: number; endHour: number }, h: number) => r.startHour <= h && h < r.endHour;
  const atLimit = sel !== null && sel.end - sel.start >= MAX_HOURS;
  const shownNotice = error || notice || (atLimit ? LIMIT_MSG : '');
  const bookable = item.status !== 'maintenance';

  const slotState = (h: number): SlotState => {
    if (date === today && h <= currentHour) return 'past';
    if (busySlots.some(r => r.equipmentId === item.id && r.date === date && covers(r, h))) return 'booked';
    if (dayReservations.some((r) => r.status === 'pending' && r.userId === user.id && covers(r, h))) return 'requested';
    if (sel && h >= sel.start && h < sel.end) return 'selected';
    if (atLimit && sel && (h === sel.end || h === sel.start - 1)) return 'limit';
    return 'free';
  };

  const onSlot = (h: number) => {
    const state = slotState(h);
    if (state === 'booked' || state === 'requested' || state === 'past' || state === 'limit') return;
    setNotice('');
    if (!sel) {
      setSel({ start: h, end: h + 1 });
      return;
    }
    if (state === 'selected') {
      if (sel.end - sel.start === 1) setSel(null);
      else if (h === sel.start) setSel({ start: sel.start + 1, end: sel.end });
      else if (h === sel.end - 1) setSel({ start: sel.start, end: sel.end - 1 });
      else setSel({ start: h, end: h + 1 });
      return;
    }
    if (h === sel.end) setSel({ start: sel.start, end: sel.end + 1 });
    else if (h === sel.start - 1) setSel({ start: sel.start - 1, end: sel.end });
    else {
      setSel({ start: h, end: h + 1 });
      setNotice('Slots must be consecutive. Your selection was restarted.');
    }
  };

  const pickDate = (d: string) => {
    setDate(d);
    setSel(null);
    setNotice('');
  };

  const onRequest = async () => {
    if (!sel || submitting) return;
    setSubmitting(true); setNotice('');
    try {
      await addReservation({ equipmentId: item.id, date, startHour: sel.start, endHour: sel.end });
      setSent(true); setSel(null);
    } catch (e) {
      if (e instanceof ApiError && e.code === 'SLOT_CONFLICT') {
        setConflict({ date, startHour: sel.start, endHour: sel.end });
      } else setNotice(e instanceof Error ? e.message : 'Could not send request.');
      await refresh();
    } finally { setSubmitting(false); }
  };

  const renderSlot = (h: number) => {
    const state = slotState(h);
    const label = formatRange(h, h + 1).replace(' – ', ' – ');
    const disabled = state === 'booked' || state === 'requested' || state === 'past' || state === 'limit';
    const tag =
      state === 'booked' ? 'Booked' :
      state === 'requested' ? 'Requested' :
      state === 'past' ? 'Past' :
      state === 'limit' ? `Max ${MAX_HOURS}h` : null;
    return (
      <Pressable
        key={h}
        onPress={() => onSlot(h)}
        disabled={state === 'booked' || state === 'requested' || state === 'past'}
        accessibilityRole="button"
        accessibilityState={{ selected: state === 'selected', disabled }}
        style={[
          styles.slot,
          state === 'selected' && styles.slotSelected,
          state === 'booked' && styles.slotBooked,
          state === 'requested' && styles.slotRequested,
          (state === 'past' || state === 'limit') && styles.slotPast,
        ]}
      >
        <Text
          style={[
            styles.slotText,
            state === 'selected' && { color: '#fff' },
            state === 'booked' && { textDecorationLine: 'line-through', color: colors.textSecondary },
            state === 'requested' && { color: colors.warningText },
            (state === 'past' || state === 'limit') && { color: colors.textMuted },
          ]}
        >
          {label}
        </Text>
        {state === 'selected' && <Ionicons name="checkmark" size={18} color="#fff" />}
        {state === 'free' && <View style={styles.freeDot} />}
        {tag && (
          <Text style={[styles.tag, state === 'requested' && { color: colors.warningText }]}>{tag}</Text>
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <Pressable style={styles.back} onPress={() => navigation.goBack()} accessibilityLabel="Back" hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.topTitle}>Equipment Details</Text>
        <View style={styles.back} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <Text style={styles.category}>{item.category.toUpperCase()} · {item.id}</Text>
            <StatusBadge status={item.status} />
          </View>
          <Text style={styles.name}>{item.name}</Text>
          <View style={styles.divider} />
          <View style={styles.locRow}>
            <Ionicons name="location-outline" size={18} color={colors.primary} />
            <Text style={styles.loc}>{item.lab} · {item.location}</Text>
          </View>
          <Text style={styles.desc}>{item.description}</Text>
        </View>

        {!bookable ? (
          <View style={styles.maintenance}>
            <Text style={styles.maintTitle}>Not available for booking</Text>
            <Text style={styles.maintText}>This item is under maintenance. Please choose another item.</Text>
          </View>
        ) : (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.section}>Select date</Text>
              <Text style={styles.sectionRight}>{monthYear(date)}</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dates}>
              {dates.map((d) => {
                const active = d === date;
                return (
                  <Pressable key={d} onPress={() => pickDate(d)} style={[styles.dateChip, active && styles.dateChipActive]}>
                    <Text style={[styles.dateTop, active && { color: '#fff' }]}>{d === today ? 'Today' : shortDay(d)}</Text>
                    <Text style={[styles.dateNum, active && { color: '#fff' }]}>{dayNumber(d)}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.sectionRow}>
              <Text style={styles.section}>Select time slot</Text>
              <View style={styles.legend}>
                <View style={styles.legendItem}><View style={[styles.swatch, { backgroundColor: colors.card, borderColor: colors.borderStrong, borderWidth: 1 }]} /><Text style={styles.legendText}>Free</Text></View>
                <View style={styles.legendItem}><View style={[styles.swatch, { backgroundColor: colors.primary }]} /><Text style={styles.legendText}>Selected</Text></View>
                <View style={styles.legendItem}><View style={[styles.swatch, { backgroundColor: colors.maintenanceBg }]} /><Text style={styles.legendText}>Booked</Text></View>
              </View>
            </View>
            <Text style={styles.rule}>Consecutive slots only · Max {MAX_HOURS} hours per request</Text>

            <View style={styles.grid}>{HOURS.map(renderSlot)}</View>

            {shownNotice !== '' && (
              <View style={styles.warn}>
                <Ionicons name="alert-circle-outline" size={18} color={colors.warningText} />
                <Text style={styles.warnText}>{shownNotice}</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {bookable && (
        <View style={styles.bottom}>
          <View style={styles.summary}>
            <Text style={styles.summaryLabel}>Selected window</Text>
            <Text style={styles.summaryValue}>
              {sel ? `${formatDate(date)} · ${formatRange(sel.start, sel.end)} (${duration(sel.start, sel.end)})` : 'None'}
            </Text>
          </View>
          <Pressable
            style={[styles.request, !sel && styles.requestOff]}
            onPress={onRequest}
              disabled={!sel || submitting || !!error}
            accessibilityRole="button"
          >
            <Text style={styles.requestText}>{submitting ? 'Sending...' : 'Request Reservation'}</Text>
          </Pressable>
          <Text style={styles.hint}>Your request is sent to staff for approval.</Text>
        </View>
      )}

      <Modal transparent animationType="fade" statusBarTranslucent visible={!!conflict} onRequestClose={() => setConflict(null)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHead}>
              <View style={styles.iconBox}><Ionicons name="warning-outline" size={22} color={colors.danger} /></View>
              <Text style={styles.sheetTitle}>Time Slot No Longer Available</Text>
            </View>
            <Text style={styles.sheetText}>
              An approved reservation overlaps your selected time. Please choose another slot.
            </Text>
            {conflict && (
              <View style={styles.conflictBox}>
                <View style={styles.conflictTop}>
                  <Text style={styles.conflictLabel}>REQUESTED SCHEDULE</Text>
                  <View style={styles.bookedBadge}><Text style={styles.bookedText}>Booked</Text></View>
                </View>
                <Text style={styles.conflictValue}>{formatDate(conflict.date)} · {formatRange(conflict.startHour, conflict.endHour)}</Text>
                <Text style={styles.conflictNote}>Other slots on this day may still be free.</Text>
              </View>
            )}
            <Pressable style={styles.primary} onPress={() => { setConflict(null); setSel(null); }}>
              <Text style={styles.primaryText}>Choose Another Time Slot</Text>
            </Pressable>
            <Pressable style={styles.secondary} onPress={() => { setConflict(null); navigation.goBack(); }}>
              <Text style={styles.secondaryText}>Back to Equipment List</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal transparent animationType="fade" statusBarTranslucent visible={sent} onRequestClose={() => setSent(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHead}>
              <View style={[styles.iconBox, { backgroundColor: colors.availableBg }]}>
                <Ionicons name="checkmark" size={22} color={colors.availableText} />
              </View>
              <Text style={styles.sheetTitle}>Request sent</Text>
            </View>
            <Text style={styles.sheetText}>
              Your request for {item.name} is waiting for staff approval.
            </Text>
            <Pressable style={styles.primary} onPress={() => { setSent(false); navigation.goBack(); }}>
              <Text style={styles.primaryText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  topBar: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8 },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  content: { padding: 20, paddingTop: 4, paddingBottom: 24 },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: 16 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  category: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, color: colors.textSecondary },
  name: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 8 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loc: { fontSize: 14, fontWeight: '500', color: colors.text },
  desc: { fontSize: 13, lineHeight: 19, color: colors.textSecondary, marginTop: 8 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 },
  section: { fontSize: 14, fontWeight: '700', color: colors.text },
  sectionRight: { fontSize: 12, color: colors.textSecondary },
  dates: { gap: 8, paddingTop: 8 },
  dateChip: {
    width: 72, height: 64, borderRadius: radius.button, borderWidth: 1, borderColor: colors.borderStrong,
    backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', gap: 2,
  },
  dateChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dateTop: { fontSize: 12, color: colors.textSecondary },
  dateNum: { fontSize: 18, fontWeight: '700', color: colors.text },
  legend: { flexDirection: 'row', gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  swatch: { width: 12, height: 12, borderRadius: 3 },
  legendText: { fontSize: 12, color: colors.textSecondary },
  rule: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8, marginTop: 10 },
  slot: {
    width: '48.5%', height: 48, borderRadius: radius.button, borderWidth: 1, borderColor: colors.borderStrong,
    backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14,
  },
  slotSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  slotBooked: { backgroundColor: colors.surface, borderColor: colors.border },
  slotRequested: { backgroundColor: colors.warningBg, borderColor: colors.warningBorder },
  slotPast: { backgroundColor: colors.bg, borderColor: colors.border, borderStyle: 'dashed' },
  slotText: { fontSize: 14, fontWeight: '500', color: colors.text },
  freeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  tag: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },
  warn: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginTop: 12, padding: 12,
    backgroundColor: colors.warningBg, borderWidth: 1, borderColor: colors.warningBorder, borderRadius: radius.button,
  },
  warnText: { flex: 1, fontSize: 12, lineHeight: 17, color: colors.warningText },
  maintenance: { marginTop: 18, padding: 16, backgroundColor: colors.maintenanceBg, borderRadius: radius.card },
  maintTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  maintText: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  bottom: { backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  summary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  summaryLabel: { fontSize: 13, color: colors.textSecondary },
  summaryValue: { flex: 1, textAlign: 'right', fontSize: 13, fontWeight: '700', color: colors.text },
  request: { height: 52, borderRadius: radius.button, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  requestOff: { backgroundColor: colors.borderStrong },
  requestText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  hint: { textAlign: 'center', fontSize: 12, color: colors.textSecondary, marginTop: 8 },
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 28 },
  sheetHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: colors.dangerBg, alignItems: 'center', justifyContent: 'center' },
  sheetTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: colors.text },
  sheetText: { fontSize: 13, lineHeight: 19, color: colors.textSecondary, marginTop: 10 },
  conflictBox: { marginTop: 14, padding: 12, borderRadius: radius.button, backgroundColor: colors.dangerBg },
  conflictTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  conflictLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, color: colors.dangerText },
  bookedBadge: { backgroundColor: colors.card, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  bookedText: { fontSize: 11, fontWeight: '700', color: colors.dangerText },
  conflictValue: { fontSize: 14, fontWeight: '700', color: colors.dangerText, marginTop: 6 },
  conflictNote: { fontSize: 12, color: colors.dangerText, marginTop: 4 },
  primary: { height: 50, borderRadius: radius.button, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 18 },
  primaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  secondary: {
    height: 50, borderRadius: radius.button, borderWidth: 1, borderColor: colors.borderStrong,
    alignItems: 'center', justifyContent: 'center', marginTop: 10, backgroundColor: colors.card,
  },
  secondaryText: { color: colors.text, fontSize: 15, fontWeight: '600' },
});
