import { useState } from 'react';
import {
  KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';
import { useAuth } from '../auth/AuthContext';

const DEMO = [
  { label: 'Borrower', sub: 'Student / User', email: 'borrower@demo.test', password: 'demo1234' },
  { label: 'Staff', sub: 'Lab Admin', email: 'staff@demo.test', password: 'demo1234' },
];

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState(DEMO[0].email);
  const [password, setPassword] = useState(DEMO[0].password);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const onSignIn = () => {
    if (!signIn(email, password)) setError('Incorrect e-mail or password.');
  };

  const pickDemo = (d: (typeof DEMO)[number]) => {
    setEmail(d.email);
    setPassword(d.password);
    setError('');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.logo}>
            <Ionicons name="cube-outline" size={34} color="#fff" />
          </View>
          <Text style={styles.title}>Welcome to GoodTracker</Text>
          <Text style={styles.subtitle}>Sign in to reserve</Text>

          <Text style={styles.label}>E-mail</Text>
          <View style={styles.field}>
            <Ionicons name="mail-outline" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={(t) => { setEmail(t); setError(''); }}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor={colors.textPlaceholder}
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.field}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={(t) => { setPassword(t); setError(''); }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              placeholder="Password"
              placeholderTextColor={colors.textPlaceholder}
            />
            <Pressable
              onPress={() => setShowPassword((s) => !s)}
              hitSlop={12}
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            >
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          {error !== '' && <Text style={styles.error}>{error}</Text>}

          <Pressable style={styles.button} onPress={onSignIn}>
            <Text style={styles.buttonText}>Sign In</Text>
          </Pressable>

          <View style={styles.demoHeader}>
            <View style={styles.line} />
            <Text style={styles.demoTitle}>DEMO ACCOUNTS</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.demoRow}>
            {DEMO.map((d) => {
              const active = email === d.email;
              return (
                <Pressable
                  key={d.label}
                  style={[styles.demoCard, active && styles.demoCardActive]}
                  onPress={() => pickDemo(d)}
                >
                  <View style={styles.demoTop}>
                    <Text style={[styles.demoLabel, active && { color: colors.primaryDark }]}>{d.label}</Text>
                    <View style={[styles.dot, active && { backgroundColor: colors.primary }]} />
                  </View>
                  <Text style={styles.demoSub}>{d.sub}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.footer}>Android demo · Sample accounts only</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 24, paddingTop: 48 },
  logo: {
    width: 56, height: 56, borderRadius: 16, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 4, marginBottom: 32 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 },
  field: {
    flexDirection: 'row', alignItems: 'center', gap: 10, height: 48,
    paddingHorizontal: 14, marginBottom: 16, backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.button,
  },
  input: { flex: 1, fontSize: 15, color: colors.text },
  error: { color: colors.danger, fontSize: 13, marginBottom: 12 },
  button: {
    height: 52, borderRadius: radius.button, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginTop: 4,
  },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  demoHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 40, marginBottom: 12 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  demoTitle: { fontSize: 11, fontWeight: '600', letterSpacing: 1, color: colors.textMuted },
  demoRow: { flexDirection: 'row', gap: 10 },
  demoCard: {
    flex: 1, padding: 12, minHeight: 56, backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.button,
  },
  demoCardActive: { borderColor: colors.primary, backgroundColor: colors.availableBg },
  demoTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  demoLabel: { fontSize: 14, fontWeight: '600', color: colors.text },
  demoSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.borderStrong },
  footer: { textAlign: 'center', fontSize: 12, color: colors.textMuted, marginTop: 16 },
});