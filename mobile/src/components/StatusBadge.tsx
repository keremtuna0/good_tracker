import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { EquipmentStatus } from '../types';

const MAP = {
  available: { label: 'Available', bg: colors.extra.cyanC7F9FE, fg: colors.extra.blue013D72 },
  borrowed: { label: 'Accepted', bg: colors.availableBg, fg: colors.availableText },
  maintenance: { label: 'Maintenance', bg: colors.maintenanceBg, fg: colors.maintenanceText },
};

export default function StatusBadge({ status }: { status: EquipmentStatus }) {
  const s = MAP[status];
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.text, { color: s.fg }]}>{s.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  text: { fontSize: 12, fontWeight: '600' },
});