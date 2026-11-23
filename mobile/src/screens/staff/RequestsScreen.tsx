import { useEffect, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius } from '../../theme';
import { useAuth } from '../../auth/AuthContext';
import { overlaps, useData } from '../../data/DataContext';
import { users } from '../../data/sampleData';
import { Reservation } from '../../types';
import { duration, formatDate, formatRange, initials } from '../../utils/format';

const REASONS = [
  'Lab exam / class session',
  'Equipment under maintenance',
  'Slot given to another request',
  'Other',
];

export default function RequestsScreen() {
  const { user } = useAuth();
  const { equipment, reservations, approveRequest, rejectRequest, restore } = useData();
  const [tab, setTab] = useState<'pending' | 'handled'>('pending');
  const [rejecting, setRejecting] = useState<Reservation | null>(null);
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState('');
  const [toast, setToast] = useState<{ text: string; snapshot: Reservation[] } | null>(null);

  const staffName = user?.name ?? 'Staff';
  const pending = reservations.filter((r) => r.status === 'pending');
  const handled = reservations.filter((r) => r.status === 'approved' || r.status === 'rejected');
  const person = (id: string) => users.find((u) => u.id === id);
  const item = (id: string) => equipment.find((e) => e.id === id);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const overlapInfo = (r: Reservation) => {
    const other = pending.find((o) => o.id !== r.id && overlaps(o, r));
    if (!other) return null;
    const from = Math.max(r.startHour, other.startHour);
    const to = Math.min(r.endHour, other.endHour);
    return `Overlaps with ${person(other.userId)?.name ?? 'another user'}'s request (${formatRange(from, to)})`;
  };

  const onApprove = (r: Reservation) => {
    const snapshot = approveRequest(r.id, staffName);
    setToast({ text: 'Request approved', snapshot });
  };

  const openReject = (r: Reservation) => {
    setRejecting(r);
    setReason(REASONS[0]);
    setDetails('');
  };

  const confirmReject = () => {
    if (!rejecting) return;
    const snapshot = rejectRequest(rejecting.id, staffName, reason, details);
    setRejecting(null);
    setToast({ text: 'Request rejected', snapshot });
  };

  const onUndo = () => {
    if (toast) restore(toast.snapshot);
    setToast(null);
  };

  const renderPending = ({ item: r }: { item: Reservation }) => {
    const p = person(r.userId);
    const eq = item(r.equipmentId);
    const warn = overlapInfo(r);
    return (
      <View style={[styles.card, warn && styles.cardWarn]}>
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(p?.name ?? '?')}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{p?.name}</Text>
            <Text style={styles.userEmail}>{p?.email}</Text>
          </View>
          <Text style={styles.ago}>{r.requestedAgo}</Text>
        </View>
        <View style={styles.divider} />
        <Text style={styles.eqName}>{eq?.name}</Text>
        <Text style={styles.meta}>{eq?.category} · {eq?.lab}</Text>
        <Text style={styles.slot}>
          {formatDate(r.date)} · {formatRange(r.startHour, r.endHour)} ({duration(r.startHour, r.endHour)})
        </Text>
        {warn && (
          <View style={styles.warnBox}>
            <Text style={styles.warnTitle}>{warn}</Text>
            <Text style={styles.warnText}>Approving this automatically declines the conflicting request.</Text>
          </View>
        )}
        <View style={styles.actions}>
          <Pressable style={[styles.btn, styles.reject]} onPress={() => openReject(r)}>
            <Text style={styles.btnText}>Reject</Text>
          </Pressable>
          <Pressable style={[styles.btn, styles.approve]} onPress={() => onApprove(r)}>
            <Text style={styles.btnText}>Approve</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderHandled = ({ item: r }: { item: Reservation }) => {
    const p = person(r.userId);
    const eq = item(r.equipmentId);
    const approved = r.status === 'approved';
    return (
      <View style={styles.card}>
        <View style={styles.titleRow}>
          <Text style={[styles.eqName, { flex: 1 }]}>{eq?.name}</Text>
          <View style={[styles.badge, { backgroundColor: approved ? colors.availableBg : colors.dangerBg }]}>
            <Text style={[styles.badgeText, { color: approved ? colors.availableText : colors.dangerText }]}>
              {approved ? 'Approved' : 'Rejected'}
            </Text>
          </View>
        </View>
        <Text style={styles.meta}>
          {p?.name} · {formatDate(r.date)} · {formatRange(r.startHour, r.endHour)}
        </Text>
        {!approved && r.note && (
          <View style={styles.noteBox}>
            <Text style={styles.noteTitle}>{r.note}</Text>
            {r.noteDetails ? <Text style={styles.noteText}>{r.noteDetails}</Text> : null}
          </View>
        )}
        <Text style={styles.handledBy}>
          {approved ? 'Approved' : 'Rejected'} by {r.handledBy} · {r.handledAt}
        </Text>
      </View>
    );
  };

  const list = tab === 'pending' ? pending : handled;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Requests</Text>
        <View style={styles.staffBadge}>
          <Text style={styles.staffBadgeText}>Staff</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        {(['pending', 'handled'] as const).map((t) => {
          const active = tab === t;
          const count = t === 'pending' ? pending.length : handled.length;
          return (
            <Pressable key={t} style={[styles.tab, active && styles.tabActive]} onPress={() => setTab(t)}>
              <Text style={[styles.tabText, active && { color: colors.primaryDark }]}>
                {t === 'pending' ? 'Pending' : 'Handled'} ({count})
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={list}
        keyExtractor={(r) => r.id}
        renderItem={tab === 'pending' ? renderPending : renderHandled}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          <Text style={styles.empty}>{tab === 'pending' ? 'No pending requests.' : 'Nothing handled yet.'}</Text>
        }
      />

      {toast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast.text}</Text>
          <Pressable onPress={onUndo} hitSlop={12}>
            <Text style={styles.undo}>Undo</Text>
          </Pressable>
        </View>
      )}

      <Modal transparent animationType="fade" statusBarTranslucent visible={!!rejecting} onRequestClose={() => setRejecting(null)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.sheetTitle}>Reject this request?</Text>
              {rejecting && (
                <Text style={styles.sheetSub}>
                  {person(rejecting.userId)?.name} · {item(rejecting.equipmentId)?.name} ·{' '}
                  {formatDate(rejecting.date)}, {formatRange(rejecting.startHour, rejecting.endHour)}
                </Text>
              )}

              <Text style={styles.label}>Reason</Text>
              {REASONS.map((r) => (
                <Pressable key={r} style={styles.reasonRow} onPress={() => setReason(r)}>
                  <View style={[styles.radio, reason === r && styles.radioOn]}>
                    {reason === r && <View style={styles.radioDot} />}
                  </View>
                  <Text style={styles.reasonText}>{r}</Text>
                </Pressable>
              ))}

              <Text style={styles.label}>Details (optional)</Text>
              <TextInput
                style={styles.input}
                value={details}
                onChangeText={setDetails}
                maxLength={200}
                multiline
                placeholder="Add a short explanation"
                placeholderTextColor={colors.textPlaceholder}
              />
              <Text style={styles.counter}>{details.length} / 200</Text>
              <Text style={styles.hint}>This message is shown to the borrower.</Text>

              <Pressable style={[styles.btn, styles.reject, { marginTop: 16 }]} onPress={confirmReject}>
                <Text style={styles.btnText}>Reject Request</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.cancel]} onPress={() => setRejecting(null)}>
                <Text style={[styles.btnText, { color: colors.text }]}>Cancel</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16 },
  title: { fontSize: 26, fontWeight: '700', color: colors.text },
  staffBadge: { backgroundColor: colors.staffBg, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  staffBadgeText: { color: colors.staffText, fontSize: 12, fontWeight: '700' },
  tabs: {
    flexDirection: 'row', marginHorizontal: 20, marginTop: 14, padding: 4, gap: 4,
    backgroundColor: colors.maintenanceBg, borderRadius: radius.button,
  },
  tab: { flex: 1, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 9 },
  tabActive: { backgroundColor: colors.card },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  list: { padding: 20, paddingBottom: 90 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40, fontSize: 14 },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: 14 },
  cardWarn: { borderColor: colors.borrowedDot, borderWidth: 1.5 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.availableBg, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 12, fontWeight: '700', color: colors.availableText },
  userName: { fontSize: 14, fontWeight: '700', color: colors.text },
  userEmail: { fontSize: 12, color: colors.textSecondary },
  ago: { fontSize: 12, color: colors.textMuted },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  eqName: { fontSize: 15, fontWeight: '700', color: colors.text },
  meta: { fontSize: 13, color: colors.textSecondary, marginTop: 3 },
  slot: { fontSize: 13, fontWeight: '700', color: colors.text, marginTop: 8, backgroundColor: colors.surface, padding: 8, borderRadius: 8 },
  warnBox: { backgroundColor: colors.warningBg, borderWidth: 1, borderColor: colors.warningBorder, borderRadius: 8, padding: 10, marginTop: 10 },
  warnTitle: { fontSize: 12, fontWeight: '700', color: colors.warningText },
  warnText: { fontSize: 12, color: colors.warningText, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  btn: { flex: 1, height: 46, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  reject: { backgroundColor: colors.danger },
  approve: { backgroundColor: colors.primary },
  cancel: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderStrong, marginTop: 10 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  noteBox: { backgroundColor: colors.dangerSoftBg, borderRadius: 8, padding: 10, marginTop: 10 },
  noteTitle: { fontSize: 12, fontWeight: '700', color: colors.dangerText },
  noteText: { fontSize: 12, color: colors.dangerText, marginTop: 2 },
  handledBy: { fontSize: 12, color: colors.textMuted, marginTop: 10 },
  toast: {
    position: 'absolute', left: 20, right: 20, bottom: 16, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', backgroundColor: colors.extra.navy1E293B, borderRadius: radius.button,
    paddingHorizontal: 16, height: 52,
  },
  toastText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  undo: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '90%' },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  sheetSub: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginTop: 16, marginBottom: 6 },
  reasonRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  reasonText: { fontSize: 14, color: colors.text, flex: 1 },
  input: {
    minHeight: 80, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.button,
    padding: 12, fontSize: 14, color: colors.text, textAlignVertical: 'top',
  },
  counter: { textAlign: 'right', fontSize: 12, color: colors.textMuted, marginTop: 4 },
  hint: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});