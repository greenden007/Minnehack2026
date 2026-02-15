import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ActivityIndicator,
  ScrollView,
  NativeModules,
} from 'react-native';
import RNFS from 'react-native-fs';
import { RunAnywhere } from '@runanywhere/core';
import { AppColors } from '../theme';
import { useModelService } from '../services/ModelService';
import { ModelLoaderWidget } from '../components';
import * as Api from '../services/ApiService';

const { NativeAudioModule } = NativeModules;

export const EmergencyScreen: React.FC = () => {
  const modelService = useModelService();
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<Api.UserInfo | null>(null);
  const [numbers, setNumbers] = useState<string[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    loadEmergencyData();
  }, []);

  const loadEmergencyData = async () => {
    setLoading(true);
    try {
      const [infoData, numsData] = await Promise.all([
        Api.getInfo(),
        Api.getNumbers(),
      ]);
      setInfo(infoData);
      setNumbers(numsData);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmEmergency = () => {
    setConfirmed(true);
    Linking.openURL('tel:911').catch(() => {});
    if (modelService.isTTSLoaded && info?.issueSummarization) {
      speakSummary(info.issueSummarization);
    }
  };

  const speakSummary = async (text: string) => {
    setIsSpeaking(true);
    try {
      const result = await RunAnywhere.synthesize(text, {
        voice: 'default',
        rate: 0.9,
        pitch: 1.0,
        volume: 1.0,
      });

      const tempPath = await RunAnywhere.Audio.createWavFromPCMFloat32(
        result.audio,
        result.sampleRate || 22050,
      );

      if (NativeAudioModule) {
        await NativeAudioModule.playAudio(tempPath);
        setTimeout(() => {
          setIsSpeaking(false);
          RNFS.unlink(tempPath).catch(() => {});
        }, (result.duration + 0.5) * 1000);
      } else {
        setIsSpeaking(false);
      }
    } catch {
      setIsSpeaking(false);
    }
  };

  if (!confirmed) {
    return (
      <View style={styles.confirmContainer}>
        <View style={styles.confirmContent}>
          <View style={styles.warningIcon}>
            <Text style={styles.warningIconText}>!</Text>
          </View>
          <Text style={styles.confirmTitle}>Emergency Access</Text>
          <Text style={styles.confirmSubtitle}>
            This will display the patient's medical information and call 911.
          </Text>
          <Text style={styles.confirmQuestion}>Is this an emergency?</Text>

          <TouchableOpacity
            onPress={handleConfirmEmergency}
            activeOpacity={0.8}
            style={styles.emergencyButton}
          >
            <Text style={styles.emergencyButtonText}>YES - THIS IS AN EMERGENCY</Text>
          </TouchableOpacity>

          <Text style={styles.privacyNote}>
            Patient privacy is protected. Only confirm in a real emergency.
          </Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  // Emergency info display - high contrast, easy to read
  return (
    <ScrollView style={styles.infoContainer} contentContainerStyle={styles.infoContent}>
      <View style={styles.emergencyHeader}>
        <Text style={styles.emergencyHeaderText}>MEDICAL ALERT</Text>
      </View>

      {info?.issueSummarization ? (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>CONDITION SUMMARY</Text>
          <Text style={styles.summaryText}>{info.issueSummarization}</Text>
        </View>
      ) : null}
      {modelService.isTTSLoaded && info?.issueSummarization ? (
        <TouchableOpacity
          onPress={() => speakSummary(info.issueSummarization)}
          disabled={isSpeaking}
          style={styles.speakButton}
        >
          <Text style={styles.speakButtonText}>
            {isSpeaking ? 'Speaking...' : 'Read Aloud'}
          </Text>
        </TouchableOpacity>
      ) : !modelService.isTTSLoaded ? (
        <ModelLoaderWidget
          title="TTS Voice"
          subtitle="Load to read info aloud"
          icon="volume"
          accentColor={AppColors.accentPink}
          isDownloading={modelService.isTTSDownloading}
          isLoading={modelService.isTTSLoading}
          progress={modelService.ttsDownloadProgress}
          onLoad={modelService.downloadAndLoadTTS}
        />
      ) : null}
      {info?.forms && Object.keys(info.forms).length > 0 && (
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>MEDICAL DETAILS</Text>
          {Object.entries(info.forms).map(([key, value]) => (
            <View key={key} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{key.toUpperCase()}</Text>
              <Text style={styles.detailValue}>{value}</Text>
            </View>
          ))}
        </View>
      )}
      {info?.fullInfo ? (
        <View style={styles.fullInfoCard}>
          <Text style={styles.detailsTitle}>FULL INFORMATION</Text>
          <Text style={styles.fullInfoText}>{info.fullInfo}</Text>
        </View>
      ) : null}
      {numbers.length > 0 && (
        <View style={styles.contactsCard}>
          <Text style={styles.detailsTitle}>EMERGENCY CONTACTS</Text>
          {numbers.map((num, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => Linking.openURL(`tel:${num}`)}
              style={styles.contactRow}
            >
              <Text style={styles.contactNumber}>{num}</Text>
              <Text style={styles.callText}>CALL</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {info?.doctorApproved && (
        <View style={styles.doctorBadge}>
          <Text style={styles.doctorBadgeText}>Doctor Verified Information</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  confirmContainer: {
    flex: 1,
    backgroundColor: AppColors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  confirmContent: {
    alignItems: 'center',
    maxWidth: 360,
  },
  warningIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: AppColors.emergency,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  warningIconText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
  },
  confirmTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 12,
  },
  confirmSubtitle: {
    fontSize: 16,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  confirmQuestion: {
    fontSize: 22,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 24,
  },
  emergencyButton: {
    backgroundColor: AppColors.emergency,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  emergencyButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
  },
  privacyNote: {
    fontSize: 12,
    color: AppColors.textMuted,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: AppColors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },

  infoContainer: {
    flex: 1,
    backgroundColor: '#1A0000',
  },
  infoContent: {
    padding: 20,
    paddingBottom: 60,
  },
  emergencyHeader: {
    backgroundColor: AppColors.emergency,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  emergencyHeaderText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
  },

  // Summary
  summaryCard: {
    backgroundColor: '#2A0000',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: AppColors.emergency,
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.emergency,
    letterSpacing: 1,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    lineHeight: 32,
  },

  // Speak button
  speakButton: {
    backgroundColor: AppColors.accentViolet,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  speakButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },

  // Details
  detailsCard: {
    backgroundColor: '#1C1C1C',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.warning,
    letterSpacing: 1,
    marginBottom: 16,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: AppColors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '500',
  },

  // Full info
  fullInfoCard: {
    backgroundColor: '#1C1C1C',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  fullInfoText: {
    fontSize: 16,
    color: '#E5E5E5',
    lineHeight: 24,
  },

  // Contacts
  contactsCard: {
    backgroundColor: '#1C1C1C',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  contactNumber: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '500',
  },
  callText: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.safe,
  },

  // Doctor badge
  doctorBadge: {
    backgroundColor: AppColors.safe + '20',
    borderWidth: 1,
    borderColor: AppColors.safe,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  doctorBadgeText: {
    color: AppColors.safe,
    fontWeight: '700',
    fontSize: 14,
  },
});
