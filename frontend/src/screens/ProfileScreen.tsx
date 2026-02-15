import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { AppColors } from '../theme';
import * as Api from '../services/ApiService';

export const ProfileScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [issueSummarization, setIssueSummarization] = useState('');
  const [fullInfo, setFullInfo] = useState('');
  const [doctorApproved, setDoctorApproved] = useState(false);
  const [allergies, setAllergies] = useState('');
  const [medications, setMedications] = useState('');
  const [conditions, setConditions] = useState('');

  const [emergencyNumbers, setEmergencyNumbers] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [info, numbers] = await Promise.all([
        Api.getInfo(),
        Api.getNumbers(),
      ]);
      setIssueSummarization(info.issueSummarization || '');
      setFullInfo(info.fullInfo || '');
      setDoctorApproved(info.doctorApproved || false);
      if (info.forms) {
        setAllergies(info.forms.allergies || '');
        setMedications(info.forms.medications || '');
        setConditions(info.forms.conditions || '');
      }
      setEmergencyNumbers(numbers.join(', '));
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const forms: Record<string, string> = {};
      if (allergies.trim()) forms.allergies = allergies.trim();
      if (medications.trim()) forms.medications = medications.trim();
      if (conditions.trim()) forms.conditions = conditions.trim();

      await Api.updateInfo({
        issueSummarization: issueSummarization.trim(),
        fullInfo: fullInfo.trim(),
        forms,
      });

      const nums = emergencyNumbers
        .split(',')
        .map(n => n.trim())
        .filter(Boolean);
      await Api.updateNumbers(nums);

      Alert.alert('Saved', 'Your profile has been updated');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppColors.accentCyan} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Doctor Approval Badge */}
        {doctorApproved && (
          <View style={styles.approvedBadge}>
            <Text style={styles.approvedText}>Doctor Verified</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Emergency Summary</Text>
        <Text style={styles.sectionHint}>
          Brief summary shown to first responders (will be read aloud)
        </Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="e.g. Severe peanut allergy, carries EpiPen. Type 1 diabetic."
          placeholderTextColor={AppColors.textMuted}
          value={issueSummarization}
          onChangeText={setIssueSummarization}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.sectionTitle}>Full Medical Information</Text>
        <Text style={styles.sectionHint}>
          Detailed info for medical professionals
        </Text>
        <TextInput
          style={[styles.input, styles.multilineLarge]}
          placeholder="Include full medical history, current treatments, doctor information..."
          placeholderTextColor={AppColors.textMuted}
          value={fullInfo}
          onChangeText={setFullInfo}
          multiline
          numberOfLines={6}
        />

        <Text style={styles.sectionTitle}>Medical Details</Text>

        <Text style={styles.label}>Allergies</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Peanuts, Penicillin, Latex"
          placeholderTextColor={AppColors.textMuted}
          value={allergies}
          onChangeText={setAllergies}
        />

        <Text style={styles.label}>Medications</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Insulin, Metformin, Lisinopril"
          placeholderTextColor={AppColors.textMuted}
          value={medications}
          onChangeText={setMedications}
        />

        <Text style={styles.label}>Conditions</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Type 1 Diabetes, Epilepsy, Asthma"
          placeholderTextColor={AppColors.textMuted}
          value={conditions}
          onChangeText={setConditions}
        />

        <Text style={styles.sectionTitle}>Emergency Contacts</Text>
        <TextInput
          style={styles.input}
          placeholder="Phone numbers, comma separated"
          placeholderTextColor={AppColors.textMuted}
          value={emergencyNumbers}
          onChangeText={setEmergencyNumbers}
          keyboardType="phone-pad"
        />

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
          style={styles.saveButton}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Profile</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.primaryDark,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: AppColors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 24,
    paddingBottom: 60,
  },
  approvedBadge: {
    backgroundColor: AppColors.safe + '20',
    borderWidth: 1,
    borderColor: AppColors.safe,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  approvedText: {
    color: AppColors.safe,
    fontWeight: '700',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginTop: 24,
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 12,
    color: AppColors.textMuted,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textSecondary,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: AppColors.surfaceCard,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: AppColors.textPrimary,
    borderWidth: 1,
    borderColor: AppColors.textMuted + '33',
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  multilineLarge: {
    minHeight: 140,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: AppColors.accentCyan,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
