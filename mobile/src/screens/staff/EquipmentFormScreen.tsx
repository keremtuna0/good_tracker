import { useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, radius } from '../../theme';
import { useData } from '../../data/DataContext';
import { Equipment } from '../../types';
import { RootStackParams } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParams, 'EquipmentForm'>;

const DEFAULT_CATEGORIES = ['Adapters', 'Cables', 'Tools'];
const SEP = ' · ';

const parseLocation = (v: string) => {
  const i = v.indexOf('·');
  if (i === -1) return { lab: v.trim(), location: '' };
  return { lab: v.slice(0, i).trim(), location: v.slice(i + 1).trim() };
};

export default function EquipmentFormScreen({ navigation, route }: Props) {
  const { equipment, saveEquipment } = useData();
  const existing = equipment.find((e) => e.id === route.params?.equipmentId);
  const isEdit = !!existing;

  const categories = Array.from(new Set([...DEFAULT_CATEGORIES, ...equipment.map((e) => e.category)]));

  const [name, setName] = useState(existing?.name ?? '');
  const [category, setCategory] = useState(existing?.category ?? categories[0]);
  const [assetId, setAssetId] = useState(existing?.id ?? '');
  const [place, setPlace] = useState(existing ? `${existing.lab}${SEP}${existing.location}` : '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const idTrim = assetId.trim();
  const idTaken = !isEdit && idTrim !== '' && equipment.some((e) => e.id.toLowerCase() === idTrim.toLowerCase());
  const nameErr = submitted && name.trim() === '' ? 'Name is required' : '';
  const idErr = idTaken ? 'ID already exists' : submitted && idTrim === '' ? 'Asset ID is required' : '';
  const placeErr = submitted && parseLocation(place).lab === '' ? 'Location is required' : '';

  const onSave = async () => {
    if (saving) return;
    setSubmitted(true);
    setFormError('');
    if (name.trim() === '' || idTrim === '' || idTaken || parseLocation(place).lab === '') return;

    const { lab, location } = parseLocation(place);
    const item: Equipment = {
      id: idTrim,
      name: name.trim(),
      category,
      lab,
      location,
      description: description.trim(),
      status: existing?.status ?? 'available',
      availableFrom: existing?.availableFrom,
    };
    setSaving(true);
    try {
      await saveEquipment(item, !isEdit);
      navigation.goBack();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Could not save equipment.');
    } finally {
      setSaving(false);
    }
  };

  const onArchive = () => {
    // TODO: backend'de arşivleme endpoint'i hazır olunca burayı bağla.
    Alert.alert('Archive equipment?', 'Archiving is not connected to the server yet.');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <Pressable style={styles.back} onPress={() => navigation.goBack()} accessibilityLabel="Back" hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.topTitle}>{isEdit ? 'Edit Equipment' : 'Add Equipment'}</Text>
        <View style={styles.back} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Equipment name</Text>
          <TextInput
            style={[styles.input, !!nameErr && styles.inputError]}
            value={name}
            onChangeText={setName}
            placeholder="Logic Analyzer 8-Ch"
            placeholderTextColor={colors.textPlaceholder}
          />
          {!!nameErr && <Text style={styles.errorText}>{nameErr}</Text>}

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Category</Text>
              <Pressable style={[styles.input, styles.select]} onPress={() => setPickerOpen(true)}>
                <Text style={styles.selectText}>{category}</Text>
                <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
              </Pressable>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{isEdit ? 'Asset ID (locked)' : 'Asset ID'}</Text>
              {isEdit ? (
                <View style={[styles.input, styles.select, styles.locked]}>
                  <Text style={[styles.selectText, { color: colors.textMuted }]}>{assetId}</Text>
                  <Ionicons name="lock-closed-outline" size={16} color={colors.textMuted} />
                </View>
              ) : (
                <TextInput
                  style={[styles.input, !!idErr && styles.inputError]}
                  value={assetId}
                  onChangeText={setAssetId}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  placeholder="EQ-113"
                  placeholderTextColor={colors.textPlaceholder}
                />
              )}
              {!!idErr && <Text style={styles.errorText}>{idErr}</Text>}
            </View>
          </View>

          <Text style={styles.label}>Lab & shelf location</Text>
          <TextInput
            style={[styles.input, !!placeErr && styles.inputError]}
            value={place}
            onChangeText={setPlace}
            placeholder={`Electronics Lab${SEP}Shelf 3`}
            placeholderTextColor={colors.textPlaceholder}
          />
          {!!placeErr && <Text style={styles.errorText}>{placeErr}</Text>}

          <Text style={styles.label}>{isEdit ? 'Description' : 'Description (optional)'}</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
            placeholder="Short description"
            placeholderTextColor={colors.textPlaceholder}
          />

          {isEdit && (
            <Pressable style={styles.archive} onPress={onArchive} accessibilityRole="button">
              <View style={{ flex: 1 }}>
                <Text style={styles.archiveTitle}>Archive Equipment</Text>
                <Text style={styles.archiveText}>Hides item from catalog and cancels upcoming bookings. Requires confirmation.</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.extra.redEC2345} />
            </Pressable>
          )}

          {formError !== '' && <Text style={[styles.errorText, { marginTop: 12 }]}>{formError}</Text>}
        </ScrollView>

        <View style={styles.bottom}>
          <Pressable style={[styles.save, saving && { opacity: 0.6 }]} onPress={onSave} disabled={saving} accessibilityRole="button">
            <Text style={styles.saveText}>{saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Register Equipment'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <Modal transparent animationType="fade" visible={pickerOpen} onRequestClose={() => setPickerOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setPickerOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Category</Text>
            {categories.map((c) => (
              <Pressable key={c} style={styles.sheetRow} onPress={() => { setCategory(c); setPickerOpen(false); }}>
                <Text style={[styles.sheetText, c === category && { color: colors.primaryDark, fontWeight: '700' }]}>{c}</Text>
                {c === category && <Ionicons name="checkmark" size={20} color={colors.primary} />}
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
  topBar: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8 },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  content: { padding: 20, paddingTop: 8, paddingBottom: 24 },
  row: { flexDirection: 'row', gap: 12 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6, marginTop: 14 },
  input: {
    minHeight: 48, paddingHorizontal: 14, backgroundColor: colors.card, borderWidth: 1,
    borderColor: colors.borderStrong, borderRadius: radius.button, fontSize: 14, color: colors.text,
  },
  inputError: { borderColor: colors.extra.redEC2345, backgroundColor: colors.dangerBg },
  errorText: { fontSize: 12, color: colors.danger, marginTop: 4 },
  select: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectText: { fontSize: 14, color: colors.text },
  locked: { backgroundColor: colors.surface },
  multiline: { minHeight: 96, paddingTop: 12, lineHeight: 20 },
  archive: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 24, padding: 14,
    backgroundColor: colors.dangerBg, borderWidth: 1, borderColor: '#FECACA', borderRadius: radius.button,
  },
  archiveTitle: { fontSize: 13, fontWeight: '700', color: colors.dangerText },
  archiveText: { fontSize: 12, color: colors.dangerText, marginTop: 2 },
  bottom: { padding: 20, paddingTop: 12, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border },
  save: { height: 52, borderRadius: radius.button, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  saveText: { color: '#fff', fontSize: 15, fontWeight: '700' },
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