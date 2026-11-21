import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';

export default function PlaceholderScreen({ title, note }: { title: string; note: string }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.box}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.note}>{note}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  box: { padding: 24, paddingTop: 16 },
  title: { fontSize: 26, fontWeight: '700', color: colors.text },
  note: { fontSize: 14, color: colors.textMuted, marginTop: 8 },
});