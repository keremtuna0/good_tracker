import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, MAX_HOURS } from '../theme';
import { useAuth } from '../auth/AuthContext';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  if (!user) return null;

  const isStaff = user.role === 'staff';
  const initials =
    user.name.charAt(0).toUpperCase() + (user.name.match(/(\d)$/)?.[1] ?? '');

  const title = isStaff ? 'Staff Permissions' : 'Reservation Policy';
  const rules = isStaff
    ? [
        'Approve or reject reservation requests',
        'Add and update shared equipment',
        'View borrower identity for requests',
      ]
    : [
        `Max ${MAX_HOURS} consecutive hours per request`,
        'All requests require staff approval',
        'Borrower identities are hidden from peers',
      ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Profile</Text>

        <View style={styles.card}>
          <View style={styles.userRow}>
            <View style={[styles.avatar, { backgroundColor: isStaff ? colors.staffBg : colors.availableBg }]}>
              <Text style={[styles.avatarText, { color: isStaff ? colors.staffText : colors.availableText }]}>
                {initials}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.email}>{user.email}</Text>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: isStaff ? colors.staffBg : colors.availableBg },
                ]}
              >
                <Text style={[styles.badgeText, { color: isStaff ? colors.staffText : colors.availableText }]}>
                  {isStaff ? 'Staff' : 'Borrower'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{title}</Text>
          <View style={styles.divider} />
          {rules.map((r) => (
            <View key={r} style={styles.ruleRow}>
              <View style={[styles.dot,
                { backgroundColor: isStaff ? colors.staffText : colors.availableText },]}/>
              <Text style={styles.ruleText}>{r}</Text>
            </View>
          ))}
        </View>

        <Pressable style={styles.signOut} onPress={signOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>

        <Text style={styles.footer}>GoodTracker Android demo · v0.1</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingTop: 16 },
  heading: { fontSize: 26, fontWeight: '700', color: colors.text, marginBottom: 16 },
  card: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.card, padding: 16, marginBottom: 12,
  },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '700' },
  name: { fontSize: 17, fontWeight: '700', color: colors.text },
  email: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  badge: { alignSelf: 'flex-start', marginTop: 6, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 10 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.textMuted },
  ruleText: { fontSize: 13, color: colors.textSecondary, flex: 1 },
  signOut: {
    height: 52, borderRadius: radius.button, borderWidth: 1, borderColor: colors.borderStrong,
    backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', marginTop: 4,
  },
  signOutText: { fontSize: 15, fontWeight: '600', color: colors.text },
  footer: { textAlign: 'center', fontSize: 12, color: colors.textMuted, marginTop: 24 },
});