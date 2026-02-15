import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppColors } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { login, signup } from '../services/api';
import { liveActivityService } from '../services/LiveActivityService';

type LoginScreenProps = {
    navigation: StackNavigationProp<RootStackParamList, 'Login'>;
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please fill in all required fields.');
            return;
        }

        if (isSignUp) {
            if (!username.trim() || !firstName.trim()) {
                Alert.alert('Error', 'Please fill in all required fields.');
                return;
            }
            if (password !== confirmPassword) {
                Alert.alert('Error', 'Passwords do not match.');
                return;
            }
        }

        setLoading(true);
        try {
            if (isSignUp) {
                await signup({
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    email: email.trim().toLowerCase(),
                    password,
                    username: username.trim(),
                });
            } else {
                await login({
                    email: email.trim().toLowerCase(),
                    password,
                });
            }

            // Start Live Activity after successful authentication
            try {
                const displayName = isSignUp ? `${firstName} ${lastName}`.trim() || username : username;
                await liveActivityService.startActivity(
                    displayName,
                    'Active',
                    'Emergency profile ready'
                );
            } catch (liveActivityError) {
                console.warn('Failed to start live activity:', liveActivityError);
            }

            navigation.replace('Home');

        } catch (error: any) {
            Alert.alert('Error', error.message || 'Something went wrong.');
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
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        <Text style={styles.appName}>Respondr</Text>
                        <Text style={styles.tagline}>Your emergency medical profile</Text>

                        <View style={styles.card}>
                            <View style={styles.tabRow}>
                                <TouchableOpacity
                                    style={[styles.tab, !isSignUp && styles.tabActive]}
                                    onPress={() => setIsSignUp(false)}
                                >
                                    <Text style={[styles.tabText, !isSignUp && styles.tabTextActive]}>
                                        Log In
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.tab, isSignUp && styles.tabActive]}
                                    onPress={() => setIsSignUp(true)}
                                >
                                    <Text style={[styles.tabText, isSignUp && styles.tabTextActive]}>
                                        Sign Up
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {isSignUp && (
                                <>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Username *"
                                        placeholderTextColor={AppColors.textMuted}
                                        value={username}
                                        onChangeText={setUsername}
                                        autoCapitalize="none"
                                    />
                                    <View style={styles.nameRow}>
                                        <TextInput
                                            style={[styles.input, styles.nameInput]}
                                            placeholder="First Name *"
                                            placeholderTextColor={AppColors.textMuted}
                                            value={firstName}
                                            onChangeText={setFirstName}
                                        />
                                        <TextInput
                                            style={[styles.input, styles.nameInput]}
                                            placeholder="Last Name"
                                            placeholderTextColor={AppColors.textMuted}
                                            value={lastName}
                                            onChangeText={setLastName}
                                        />
                                    </View>
                                </>
                            )}

                            <TextInput
                                style={styles.input}
                                placeholder="Email *"
                                placeholderTextColor={AppColors.textMuted}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Password *"
                                placeholderTextColor={AppColors.textMuted}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={false}
                            />
                            {isSignUp && (
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm Password *"
                                    placeholderTextColor={AppColors.textMuted}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={false}
                                />
                            )}

                            <TouchableOpacity
                                onPress={handleSubmit}
                                disabled={loading}
                                style={styles.submitButton}
                            >
                                <LinearGradient
                                    colors={[AppColors.accentCyan, AppColors.accentViolet]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.submitGradient}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.submitText}>
                                            {isSignUp ? 'Create Account' : 'Log In'}
                                        </Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
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
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    appName: {
        fontSize: 38,
        color: AppColors.textPrimary,
        fontWeight: 'bold',
        fontFamily: 'Georgia-Bold',
        marginBottom: 6,
    },
    tagline: {
        fontSize: 14,
        color: AppColors.textSecondary,
        marginBottom: 32,
    },
    card: {
        width: '100%',
        backgroundColor: AppColors.surfaceCard,
        borderRadius: 16,
        padding: 20,
    },
    tabRow: {
        flexDirection: 'row',
        backgroundColor: AppColors.primaryDark,
        borderRadius: 10,
        marginBottom: 20,
        padding: 3,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    tabActive: {
        backgroundColor: AppColors.surfaceElevated,
    },
    tabText: {
        color: AppColors.textMuted,
        fontSize: 15,
        fontWeight: '600',
    },
    tabTextActive: {
        color: AppColors.textPrimary,
    },
    input: {
        width: '100%',
        height: 48,
        backgroundColor: AppColors.surfaceElevated,
        borderRadius: 10,
        paddingHorizontal: 14,
        color: AppColors.textPrimary,
        fontSize: 15,
        marginBottom: 12,
    },
    nameRow: {
        flexDirection: 'row',
        gap: 10,
    },
    nameInput: {
        flex: 1,
    },
    submitButton: {
        width: '100%',
        marginTop: 6,
        borderRadius: 10,
        overflow: 'hidden',
        minHeight: 48,
    },
    submitGradient: {
        paddingVertical: 14,
        alignItems: 'center',
        borderRadius: 10,
    },
    submitText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: 'bold',
    },
});
