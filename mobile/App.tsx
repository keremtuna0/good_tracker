import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/auth/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import { colors, radius } from './src/theme';

function Root() {
  const { user, signOut } = useAuth();
  if (!user) return <LoginScreen />;

  // Geçici ekran: sonraki adımlarda yerini gerçek ekranlar alacak
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.box}>
        <Text style={styles.title}>Signed in</Text>
        <Text style={styles.text}>{user.name} · {user.role}</Text>
        <Pressable style={styles.button} onPress={signOut}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Root />
        <StatusBar style="dark" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  box: { padding: 24, paddingTop: 80 },
  title: { fontSize: 24, fontWeight: '700', color: colors.primary },
  text: { fontSize: 15, color: colors.text, marginTop: 8, marginBottom: 24 },
  button: {
    height: 48, borderRadius: radius.button, borderWidth: 1, borderColor: colors.borderStrong,
    alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card,
  },
  buttonText: { fontSize: 15, fontWeight: '600', color: colors.text },
});