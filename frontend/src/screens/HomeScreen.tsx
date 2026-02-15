import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { AppColors } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { getPatientInfo, getEmergencyContacts, PatientInfo, logout } from '../services/api';

type HomeScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [info, setInfo] = useState<PatientInfo | null>(null);
  const [emergencyNums, setEmergencyNums] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [patientInfo, contacts] = await Promise.all([
        getPatientInfo(),
        getEmergencyContacts(),
      ]);
      setInfo(patientInfo);
      setEmergencyNums(contacts.emergencyContactNums);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchData();
    }, [fetchData]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
    navigation.replace('Login');
  };

  const hasProfile = info && (info.issueSummarization || info.fullInfo);

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
          <Text style={styles.headerTitle}>Respondr</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={AppColors.accentCyan} />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={AppColors.accentCyan}
              />
            }
          >
            <View style={styles.notificationCard}>
              <View style={styles.notificationHeader}>
                <View style={styles.notificationDot} />
                <Text style={styles.notificationLabel}>
                  EMERGENCY NOTIFICATION PREVIEW
                </Text>
              </View>
              <Text style={styles.notificationHint}>
                This is what first responders will see
              </Text>

              {hasProfile ? (
                <View style={styles.notificationBody}>
                  {info.issueSummarization ? (
                    <View style={styles.summarySection}>
                      <View style={styles.summaryHeader}>
                        <Text style={styles.summaryLabel}>CONDITION SUMMARY</Text>
                        <TouchableOpacity
                          style={styles.ttsButton}
                          onPress={() => {/* rohanldinio will take care */}}
                        >
                          <Text style={styles.ttsButtonIcon}>🔊</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.summaryText}>
                        {info.issueSummarization}
                      </Text>
                    </View>
                  ) : null}

                  {info.fullInfo ? (
                    <View style={styles.fullInfoSection}>
                      <Text style={styles.fullInfoLabel}>DETAILED INFO</Text>
                      <Text style={styles.fullInfoText}>{info.fullInfo}</Text>
                    </View>
                  ) : null}

                  {info.doctorApproved && (
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedText}>
                        Doctor Verified
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>No Medical Info Yet</Text>
                  <Text style={styles.emptySubtext}>
                    Set up your profile so first responders can help you in an
                    emergency.
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Emergency Contacts</Text>
              {emergencyNums.length > 0 ? (
                emergencyNums.map((num, idx) => (
                  <View key={idx} style={styles.contactRow}>
                    <Text style={styles.contactIcon}>Phone</Text>
                    <Text style={styles.contactNumber}>{num}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.cardSubtext}>
                  No emergency contacts added yet.
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <LinearGradient
                colors={[AppColors.accentCyan, AppColors.accentViolet]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.editGradient}
              >
                <Text style={styles.editButtonText}>
                  {'Profile'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        )}
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
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: AppColors.textPrimary,
    fontFamily: 'Georgia-Bold',
  },
  logoutText: {
    color: AppColors.textSecondary,
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  notificationCard: {
    backgroundColor: AppColors.surfaceCard,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AppColors.error,
    marginRight: 8,
  },
  notificationLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: AppColors.error,
    letterSpacing: 1,
  },
  notificationHint: {
    fontSize: 12,
    color: AppColors.textMuted,
    marginBottom: 14,
    marginLeft: 16,
  },
  notificationBody: {
    gap: 12,
  },
  summarySection: {
    backgroundColor: AppColors.surfaceElevated,
    borderRadius: 10,
    padding: 14,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: AppColors.accentCyan,
    letterSpacing: 1,
  },
  summaryText: {
    fontSize: 16,
    color: AppColors.textPrimary,
    lineHeight: 22,
  },
  fullInfoSection: {
    backgroundColor: AppColors.surfaceElevated,
    borderRadius: 10,
    padding: 14,
  },
  fullInfoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: AppColors.accentViolet,
    letterSpacing: 1,
    marginBottom: 6,
  },
  fullInfoText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    lineHeight: 20,
  },
  verifiedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.success,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 13,
    color: AppColors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  card: {
    backgroundColor: AppColors.surfaceCard,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 10,
  },
  cardSubtext: {
    fontSize: 13,
    color: AppColors.textMuted,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surfaceElevated,
    borderRadius: 8,
    padding: 12,
    marginBottom: 6,
  },
  contactIcon: {
    fontSize: 12,
    color: AppColors.accentCyan,
    fontWeight: '600',
    marginRight: 10,
  },
  contactNumber: {
    fontSize: 15,
    color: AppColors.textPrimary,
  },
  editButton: {
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 48,
    width: '100%',
  },
  editGradient: {
    paddingVertical: 2,
    alignItems: 'center',
    borderRadius: 12,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Cochin',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  ttsButton: {
    backgroundColor: AppColors.accentCyan,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ttsButtonIcon: {
    fontSize: 16,
  },
});
