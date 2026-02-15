import 'react-native-gesture-handler'; // Must be at the top!
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { StatusBar, ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// Note: react-native-screens is shimmed in index.js for iOS New Architecture compatibility
import { RunAnywhere, SDKEnvironment } from '@runanywhere/core';
import { ModelServiceProvider, registerDefaultModels } from './services/ModelService';
import { AppColors } from './theme';
import {
  HomeScreen,
  LoginScreen,
  ProfileScreen
} from './screens';
import { RootStackParamList } from './navigation/types';
import { getToken } from './services/api';

// Using JS-based stack navigator instead of native-stack
// to avoid react-native-screens setColor crash with New Architecture
const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    const init = async () => {
      // Check for existing auth token
      const token = await getToken();
      setInitialRoute(token ? 'Home' : 'Login');

      // Initialize SDK
      try {
        await RunAnywhere.initialize({
          environment: SDKEnvironment.Development,
        });

        const { LlamaCPP } = await import('@runanywhere/llamacpp');
        const { ONNX } = await import('@runanywhere/onnx');

        LlamaCPP.register();
        ONNX.register();

        await registerDefaultModels();

        console.log('RunAnywhere SDK initialized successfully');
      } catch (error) {
        console.error('Failed to initialize RunAnywhere SDK:', error);
      }
    };

    init();
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: AppColors.primaryDark }}>
        <ActivityIndicator size="large" color={AppColors.accentCyan} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ModelServiceProvider>
        <StatusBar barStyle="light-content" backgroundColor={AppColors.primaryDark} />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{
              headerShown: false,
              cardStyle: {
                backgroundColor: AppColors.primaryDark,
              },
              // iOS-like animations
              ...TransitionPresets.SlideFromRightIOS,
            }}
          >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </ModelServiceProvider>
    </GestureHandlerRootView>
  );
};

export default App;
