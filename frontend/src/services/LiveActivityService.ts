import { NativeModules, Platform } from 'react-native';

export interface LiveActivityService {
    startActivity(patientName: string, status: string, issueSummary: string): Promise<void>;
    updateActivity(status: string, issueSummary: string): Promise<void>;
    endActivity(): Promise<void>;
}

export const liveActivityService: LiveActivityService = {
    startActivity: async (patientName: string, status: string, issueSummary: string): Promise<void> => {
        console.log('Platform.OS', Platform.OS);
        console.log('NativeModules keys contains LiveActivityManager?', Object.keys(NativeModules).includes('LiveActivityManager'));
        console.log('NativeModules.LiveActivityManager', NativeModules.LiveActivityManager);
        if (Platform.OS !== 'ios') {
            console.warn(`Live Activity is only available on iOS (Platform.OS=${Platform.OS})`);
            return;
        }
        const LiveActivityManager = NativeModules.LiveActivityManager;
        if (!LiveActivityManager) {
            const err = new Error('LiveActivityManager native module is not registered (NativeModules.LiveActivityManager is undefined).');
            console.error(err.message);
            throw err;
        }
        try {
            await LiveActivityManager.startActivity(patientName, status, issueSummary);
        } catch (error) {
            console.error('Failed to start live activity:', error);
            throw error;
        }
    },

    updateActivity: async (status: string, issueSummary: string): Promise<void> => {
        if (Platform.OS !== 'ios') {
            console.warn(`Live Activity is only available on iOS (Platform.OS=${Platform.OS})`);
            return;
        }
        const LiveActivityManager = NativeModules.LiveActivityManager;
        if (!LiveActivityManager) {
            const err = new Error('LiveActivityManager native module is not registered (NativeModules.LiveActivityManager is undefined).');
            console.error(err.message);
            throw err;
        }
        try {
            await LiveActivityManager.updateActivity(status, issueSummary);
        } catch (error) {
            console.error('Failed to update live activity:', error);
            throw error;
        }
    },

    endActivity: async (): Promise<void> => {
        if (Platform.OS !== 'ios') {
            console.warn(`Live Activity is only available on iOS (Platform.OS=${Platform.OS})`);
            return;
        }
        const LiveActivityManager = NativeModules.LiveActivityManager;
        if (!LiveActivityManager) {
            const err = new Error('LiveActivityManager native module is not registered (NativeModules.LiveActivityManager is undefined).');
            console.error(err.message);
            throw err;
        }
        try {
            await LiveActivityManager.endActivity();
        } catch (error) {
            console.error('Failed to end live activity:', error);
            throw error;
        }
    }
};
