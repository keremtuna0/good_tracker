import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { EquipmentStatus } from '../types';

const MAP = {
  available: { label: 'Available', bg: colors.availableBg, fg: colors.availableText, dot: colors.availableDot },
  borrowed: { label: 'Borrowed', bg: colors.borrowedBg, fg: colors.borrowedText, dot: colors.borrowedDot },
  maintenance: { label: 'Maintenance', bg: colors.maintenanceBg, fg: colors.maintenanceText, dot: colors.maintenanceDot },
};

export default function StatusBadge({ status }: { status: EquipmentStatus }) {
  const s = MAP[status];
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <View style={[styles.dot, { backgroundColor: s.dot }]} />
      <Text style={[styles.text, { color: s.fg }]}>{s.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 12, fontWeight: '600' },
});