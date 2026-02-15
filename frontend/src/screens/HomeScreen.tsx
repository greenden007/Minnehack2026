import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppColors } from '../theme';
import { useAuth } from '../services/AuthContext';
import { useModelService } from '../services/ModelService';
import * as Api from '../services/ApiService';
import { RootStackParamList } from '../navigation/types';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { logout } = useAuth();
  const modelService = useModelService();
  const [info, setInfo] = useState<Api.UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInfo();
  }, []);

  // Reload when screen comes back into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadInfo();
    });
    return unsubscribe;
  }, [navigation]);

  const loadInfo = async () => {
    try {
      const data = await Api.getInfo();
      setInfo(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[AppColors.primaryDark, '#0F1629', AppColors.primaryMid]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Text style={styles.logoIcon}>+</Text>
              </View>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>MedAlert</Text>
              <Text style={styles.subtitle}>Emergency Medical Info</Text>
            </View>
            <TouchableOpacity onPress={logout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>

          {/* Status Card */}
          <View style={styles.statusCard}>
            {loading ? (
              <ActivityIndicator color={AppColors.accentCyan} />
            ) : (
              <>
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Profile Status</Text>
                  <Text
                    style={[
                      styles.statusValue,
                      {
                        color: info?.issueSummarization
                          ? AppColors.safe
                          : AppColors.warning,
                      },
                    ]}
                  >
                    {info?.issueSummarization ? 'Configured' : 'Incomplete'}
                  </Text>
                </View>
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Doctor Verified</Text>
                  <Text
                    style={[
                      styles.statusValue,
                      {
                        color: info?.doctorApproved
                          ? AppColors.safe
                          : AppColors.textMuted,
                      },
                    ]}
                  >
                    {info?.doctorApproved ? 'Yes' : 'No'}
                  </Text>
                </View>
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>TTS Model</Text>
                  <Text
                    style={[
                      styles.statusValue,
                      {
                        color: modelService.isTTSLoaded
                          ? AppColors.safe
                          : AppColors.textMuted,
                      },
                    ]}
                  >
                    {modelService.isTTSLoaded ? 'Ready' : 'Not Loaded'}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* TTS Model Load */}
          {!modelService.isTTSLoaded && (
            <TouchableOpacity
              onPress={modelService.downloadAndLoadTTS}
              disabled={modelService.isTTSDownloading || modelService.isTTSLoading}
              style={styles.ttsButton}
            >
              <Text style={styles.ttsButtonText}>
                {modelService.isTTSDownloading
                  ? `Downloading TTS... ${Math.round(modelService.ttsDownloadProgress)}%`
                  : modelService.isTTSLoading
                  ? 'Loading TTS...'
                  : 'Download Voice Model (for emergency readout)'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Emergency Preview */}
          {info?.issueSummarization ? (
            <View style={styles.previewCard}>
              <Text style={styles.previewTitle}>Emergency Summary Preview</Text>
              <Text style={styles.previewText}>{info.issueSummarization}</Text>
            </View>
          ) : null}

          {/* Action Buttons */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Emergency')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[AppColors.emergency, AppColors.emergencyDark]}
              style={styles.emergencyButton}
            >
              <Text style={styles.emergencyButtonIcon}>!</Text>
              <Text style={styles.emergencyButtonText}>Emergency Mode</Text>
              <Text style={styles.emergencyButtonHint}>
                Preview what first responders see
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
            style={styles.profileButton}
          >
            <Text style={styles.profileButtonText}>Edit Medical Profile</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.primaryDark },
  gradient: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: 60 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: { marginRight: 16 },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: AppColors.emergency,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoIcon: { fontSize: 28, color: '#fff', fontWeight: '700' },
  headerText: { flex: 1 },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: AppColors.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: AppColors.textMuted,
    fontSize: 14,
  },

  statusCard: {
    padding: 20,
    backgroundColor: AppColors.surfaceCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppColors.textMuted + '1A',
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
  },

  ttsButton: {
    backgroundColor: AppColors.accentViolet + '30',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: AppColors.accentViolet + '60',
  },
  ttsButtonText: {
    color: AppColors.accentViolet,
    fontWeight: '600',
    fontSize: 14,
  },

  previewCard: {
    backgroundColor: AppColors.surfaceCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: AppColors.warning,
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.warning,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  previewText: {
    fontSize: 16,
    color: AppColors.textPrimary,
    lineHeight: 24,
  },

  emergencyButton: {
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 16,
  },
  emergencyButtonIcon: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
  },
  emergencyButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  emergencyButtonHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },

  profileButton: {
    backgroundColor: AppColors.surfaceElevated,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: AppColors.accentCyan + '40',
  },
  profileButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.accentCyan,
  },
});
