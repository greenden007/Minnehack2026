import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, NativeModules } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { AppColors } from '../theme';

const { LiveActivityModule } = NativeModules;

type LiveActivityScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'LiveActivity'>;
};

let activityId: string | null = null;

export const LiveActivityScreen: React.FC<LiveActivityScreenProps> = ({ navigation }) => {
  const handleStartActivity = async () => {
    try {
      activityId = await LiveActivityModule.startActivity('Downloading Model', '0%');
      console.log('Started activity with ID:', activityId);

      if (activityId) {
        let progress = 0;
        const interval = setInterval(async () => {
          progress += 10;
          if (progress <= 100) {
            await LiveActivityModule.updateActivity(activityId, `Downloading Model`, `${progress}%`);
          } else {
            clearInterval(interval);
            console.log('Download simulation finished.');
          }
        }, 1000);
      }
    } catch (e) {
      console.error('Error starting live activity:', e);
      Alert.alert('Error', 'Could not start live activity. Make sure you are on iOS 16.1+ and have the native module set up.');
    }
  };

  const handleStopActivity = async () => {
    if (activityId) {
      try {
        await LiveActivityModule.stopActivity(activityId);
        activityId = null;
      } catch (e) {
        console.error('Error stopping live activity:', e);
        Alert.alert('Error', 'Could not stop live activity.');
      }
    } else {
      Alert.alert('No active activity to stop.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live Activities</Text>
      <Text style={styles.subtitle}>
        Simulates a model download progress on the lock screen.
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleStartActivity}>
        <Text style={styles.buttonText}>Start Download Activity</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={handleStopActivity}>
        <Text style={styles.buttonText}>Stop Activity</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.primaryDark,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 15,
  },
  button: {
    backgroundColor: AppColors.accentCyan,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginVertical: 10,
    minWidth: 250,
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: AppColors.accentViolet,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
