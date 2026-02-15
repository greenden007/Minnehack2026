import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { AppColors } from '../theme';
import { RootStackParamList } from '../navigation/types';
import {
  getPatientInfo,
  updatePatientInfo,
  getEmergencyContacts,
  updateEmergencyContacts,
} from '../services/api';

type ProfileScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Profile'>;
};

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [issueSummarization, setIssueSummarization] = useState('');
  const [fullInfo, setFullInfo] = useState('');
  const [emergencyNums, setEmergencyNums] = useState<string[]>([]);
  const [newContact, setNewContact] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [doctorApproved, setDoctorApproved] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          const [info, contacts] = await Promise.all([
            getPatientInfo(),
            getEmergencyContacts(),
          ]);
          setIssueSummarization(info.issueSummarization || '');
          setFullInfo(info.fullInfo || '');
          setDoctorApproved(info.doctorApproved);
          setEmergencyNums(contacts.emergencyContactNums || []);
        } catch (error) {
          console.error('Failed to load profile:', error);
        } finally {
          setLoading(false);
        }
      };
      setLoading(true);
      load();
    }, []),
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        updatePatientInfo({
          issueSummarization: issueSummarization.trim(),
          fullInfo: fullInfo.trim(),
        }),
        updateEmergencyContacts(emergencyNums),
      ]);
      Alert.alert('Saved', 'Your medical profile has been updated.');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const addContact = () => {
    const trimmed = newContact.trim();
    if (!trimmed) return;
    setEmergencyNums((prev) => [...prev, trimmed]);
    setNewContact('');
  };

  const removeContact = (index: number) => {
    setEmergencyNums((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={[AppColors.primaryDark, '#0F1629', AppColors.primaryMid]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, { justifyContent: 'center', alignItems: 'center' }]}
        >
          <ActivityIndicator size="large" color={AppColors.accentCyan} />
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[AppColors.primaryDark, '#0F1629', AppColors.primaryMid]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Medical Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {doctorApproved && (
              <View style={styles.verifiedBanner}>
                <Text style={styles.verifiedBannerText}>
                  Doctor Verified Profile
                </Text>
              </View>
            )}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Condition Summary</Text>
              <Text style={styles.sectionHint}>
                Brief description for first responders (e.g. "Severe peanut
                allergy, carries EpiPen")
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Severe peanut allergy, Type 1 Diabetes..."
                placeholderTextColor={AppColors.textMuted}
                value={issueSummarization}
                onChangeText={setIssueSummarization}
                multiline
              />
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Detailed Medical Info</Text>
              <Text style={styles.sectionHint}>
                Full details about conditions, medications, allergies,
                treatment plans, etc.
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Include all relevant medical information: conditions, medications with dosages, allergies, blood type, treatment instructions..."
                placeholderTextColor={AppColors.textMuted}
                value={fullInfo}
                onChangeText={setFullInfo}
                multiline
                textAlignVertical="top"
              />
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Emergency Contacts</Text>
              <Text style={styles.sectionHint}>
                Phone numbers to call in an emergency
              </Text>

              {emergencyNums.map((num, idx) => (
                <View key={idx} style={styles.contactRow}>
                  <Text style={styles.contactNumber}>{num}</Text>
                  <TouchableOpacity onPress={() => removeContact(idx)}>
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <View style={styles.addContactRow}>
                <TextInput
                  style={[styles.input, styles.contactInput]}
                  placeholder="Phone number"
                  placeholderTextColor={AppColors.textMuted}
                  value={newContact}
                  onChangeText={setNewContact}
                  keyboardType="phone-pad"
                />
                <TouchableOpacity style={styles.addButton} onPress={addContact}>
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={styles.saveButton}
            >
              <LinearGradient
                colors={[AppColors.accentCyan, AppColors.accentViolet]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveGradient}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveText}>Save Profile</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
  },
  backText: {
    color: AppColors.accentCyan,
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.textPrimary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  verifiedBanner: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  verifiedBannerText: {
    color: AppColors.success,
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    backgroundColor: AppColors.surfaceCard,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 12,
    color: AppColors.textMuted,
    marginBottom: 12,
    lineHeight: 16,
  },
  input: {
    backgroundColor: AppColors.surfaceElevated,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: AppColors.textPrimary,
    fontSize: 15,
    minHeight: 48,
  },
  textArea: {
    minHeight: 120,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: AppColors.surfaceElevated,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  contactNumber: {
    fontSize: 15,
    color: AppColors.textPrimary,
  },
  removeText: {
    color: AppColors.error,
    fontSize: 13,
    fontWeight: '600',
  },
  addContactRow: {
    flexDirection: 'row',
    gap: 8,
  },
  contactInput: {
    flex: 1,
    marginBottom: 0,
  },
  addButton: {
    backgroundColor: AppColors.accentCyan,
    borderRadius: 10,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 4,
  },
  saveGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  saveText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});
