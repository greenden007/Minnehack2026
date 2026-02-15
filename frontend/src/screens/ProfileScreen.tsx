import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  NativeModules,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { RunAnywhere } from '@runanywhere/core';
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
import { useModelService } from '../services/ModelService';
import { ModelLoaderWidget, AudioVisualizer } from '../components';

const { NativeAudioModule } = NativeModules;

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
  const modelService = useModelService();
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [transcriptionHistory, setTranscriptionHistory] = useState<string[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingPathRef = useRef<string | null>(null);
  const audioLevelIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingStartRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (audioLevelIntervalRef.current) {
        clearInterval(audioLevelIntervalRef.current);
      }
      if (isRecording && NativeAudioModule) {
        NativeAudioModule.cancelRecording().catch(() => { });
      }
    };
  }, [isRecording]);

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
      navigation.goBack();
    } catch (error: any) {
    } finally {
      setSaving(false);
    }
  };

  const addContact = () => {
    const trimmed = newContact.trim();
    if (!trimmed) return;
    if (emergencyNums.length >= 3) {
      return;
    }
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

  const startRecording = async () => {
    try {
      // Check if native module is available
      if (!NativeAudioModule) {
        console.error('[STT] NativeAudioModule not available');
        Alert.alert('Error', 'Native audio module not available. Please rebuild the app.');
        return;
      }

      // Request microphone permission on Android
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs access to your microphone for speech recognition.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Microphone permission is required for speech recognition.');
          return;
        }
      }

      console.warn('[STT] Starting native recording...');
      const result = await NativeAudioModule.startRecording();

      recordingPathRef.current = result.path;
      recordingStartRef.current = Date.now();
      setIsRecording(true);
      setTranscription('');
      setRecordingDuration(0);

      // Poll for audio levels
      audioLevelIntervalRef.current = setInterval(async () => {
        try {
          const levelResult = await NativeAudioModule.getAudioLevel();
          setAudioLevel(levelResult.level || 0);
          setRecordingDuration(Date.now() - recordingStartRef.current);
        } catch (e) {
          // Ignore errors during polling
        }
      }, 100);

      console.warn('[STT] Recording started at:', result.path);
    } catch (error) {
      console.error('[STT] Recording error:', error);
      Alert.alert('Recording Error', `Failed to start recording: ${error}`);
    }
  };

  const stopRecordingAndTranscribe = async () => {
    try {
      // Clear audio level polling
      if (audioLevelIntervalRef.current) {
        clearInterval(audioLevelIntervalRef.current);
        audioLevelIntervalRef.current = null;
      }

      if (!NativeAudioModule) {
        throw new Error('NativeAudioModule not available');
      }

      console.warn('[STT] Stopping recording...');
      const result = await NativeAudioModule.stopRecording();
      setIsRecording(false);
      setAudioLevel(0);
      setIsTranscribing(true);

      // Get the base64 audio data directly from native module (bypasses RNFS sandbox issues)
      const audioBase64 = result.audioBase64;
      if (!audioBase64) {
        throw new Error('No audio data received from recording');
      }

      console.warn('[STT] Recording stopped, audio base64 length:', audioBase64.length, 'file size:', result.fileSize);

      if (result.fileSize < 1000) {
        throw new Error('Recording too short - please speak longer');
      }

      // Check if STT model is loaded
      const isModelLoaded = await RunAnywhere.isSTTModelLoaded();
      if (!isModelLoaded) {
        throw new Error('STT model not loaded. Please download and load the model first.');
      }

      // Transcribe using base64 audio data directly from native module
      console.warn('[STT] Starting transcription...');
      const transcribeResult = await RunAnywhere.transcribe(audioBase64, {
        sampleRate: 16000,
        language: 'en',
      });

      console.warn('[STT] Transcription result:', transcribeResult);

      if (transcribeResult.text) {
        setTranscription(transcribeResult.text);
        setTranscriptionHistory(prev => [transcribeResult.text, ...prev]);
        setFullInfo(transcribeResult.text)
      } else {
        setTranscription('(No speech detected)');
      }

      recordingPathRef.current = null;
      setIsTranscribing(false);
    } catch (error) {
      console.error('[STT] Transcription error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setTranscription(`Error: ${errorMessage}`);
      Alert.alert('Transcription Error', errorMessage);
      setIsTranscribing(false);
    }
  };

  if (!modelService.isSTTLoaded) {
    return (
      <ModelLoaderWidget
        title="STT Model Required"
        subtitle="Download and load the speech recognition model"
        icon="mic"
        accentColor={AppColors.accentViolet}
        isDownloading={modelService.isSTTDownloading}
        isLoading={modelService.isSTTLoading}
        progress={modelService.sttDownloadProgress}
        onLoad={modelService.downloadAndLoadSTT}
      />
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
                Brief description for first responders (example "Severe peanut
                allergy, carries EpiPen")
              </Text>
              <TextInput
                style={styles.input}
                placeholder="example Severe peanut allergy, Type 1 Diabetes..."
                placeholderTextColor={AppColors.textMuted}
                value={issueSummarization}
                onChangeText={setIssueSummarization}
                multiline
              />
            </View>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>Detailed Medical Info</Text>
                  <Text style={styles.sectionHint}>
                    Full details about conditions, medications, allergies,
                    treatment plans, etc.
                  </Text>
                </View>
                <Text style={styles.voiceButtonIcon}
                  onPress={isRecording ? stopRecordingAndTranscribe : startRecording}
                  disabled={isTranscribing}>
                  <Text>
                    {isRecording ? '⏹' : '🎤'}
                    {/*The forbidden emojis lol*/}
                  </Text>
                </Text>
              </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Include all relevant medical information: conditions, medications with dosages, allergies, blood type, treatment instructions etc..."
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

              {emergencyNums.length < 3 && (
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
              )}
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
                  <Text style={styles.saveText}>Save</Text>
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
    paddingVertical: 12,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
    minHeight: 48,
    marginTop: 8,
    justifyContent: 'center',
  },
  saveGradient: {
    paddingVertical: 2,
    alignItems: 'center',
    borderRadius: 12,
  },
  saveText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Cochin',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  voiceButton: {
    backgroundColor: AppColors.accentCyan,
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  voiceButtonIcon: {
    fontSize: 18,
  },
});
