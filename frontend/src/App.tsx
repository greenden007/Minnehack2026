// import 'react-native-gesture-handler'; // Must be at the top!
// import React, { useEffect } from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
// import { StatusBar } from 'react-native';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// // Note: react-native-screens is shimmed in index.js for iOS New Architecture compatibility
// import { RunAnywhere, SDKEnvironment } from '@runanywhere/core';
// import { ModelServiceProvider, registerDefaultModels } from './services/ModelService';
// import { AppColors } from './theme';
// import {
//   HomeScreen,
//   LoginScreen,
//   ProfileScreen
// } from './screens';
// import { RootStackParamList } from './navigation/types';
//
// // Using JS-based stack navigator instead of native-stack
// // to avoid react-native-screens setColor crash with New Architecture
// const Stack = createStackNavigator<RootStackParamList>();
//
// const App: React.FC = () => {
//   useEffect(() => {
//     // Initialize SDK
//     const initializeSDK = async () => {
//       try {
//         // Initialize RunAnywhere SDK (Development mode doesn't require API key)
//         await RunAnywhere.initialize({
//           environment: SDKEnvironment.Development,
//         });
//
//         // Register backends (per docs: https://docs.runanywhere.ai/react-native/quick-start)
//         const { LlamaCPP } = await import('@runanywhere/llamacpp');
//         const { ONNX } = await import('@runanywhere/onnx');
//
//         LlamaCPP.register();
//         ONNX.register();
//
//         // Register default models
//         await registerDefaultModels();
//
//         console.log('RunAnywhere SDK initialized successfully');
//       } catch (error) {
//         console.error('Failed to initialize RunAnywhere SDK:', error);
//       }
//     };
//
//     initializeSDK();
//   }, []);
//
//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <ModelServiceProvider>
//         <StatusBar barStyle="light-content" backgroundColor={AppColors.primaryDark} />
//         <NavigationContainer>
//           <Stack.Navigator
//             initialRouteName="Login"
//             screenOptions={{
//               headerShown: false,
//               cardStyle: {
//                 backgroundColor: AppColors.primaryDark,
//               },
//               // iOS-like animations
//               ...TransitionPresets.SlideFromRightIOS,
//             }}
//           >
//             <Stack.Screen name="Login" component={LoginScreen} />
//             <Stack.Screen name="Home" component={HomeScreen} />
//             <Stack.Screen name="Profile" component={ProfileScreen} />
//           </Stack.Navigator>
//         </NavigationContainer>
//       </ModelServiceProvider>
//     </GestureHandlerRootView>
//   );
// };
//
// export default App;
import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  Button,
} from 'react-native';

import NativeLocalStorage from '../specs/NativeLocalStorage';

const EMPTY = '<empty>';

function App(): React.JSX.Element {
  const [value, setValue] = React.useState<string | null>(null);

  const [editingValue, setEditingValue] = React.useState<
    string | null
  >(null);

  React.useEffect(() => {
    const storedValue = NativeLocalStorage?.getItem('myKey');
    setValue(storedValue ?? '');
  }, []);


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text style={styles.text}>
        Current stored value is: {value ?? 'No Value'}
      </Text>
      <TextInput
        placeholder="Enter the text you want to store"
        style={styles.textInput}
        onChangeText={setEditingValue}
      />
      <Button title="Save" onPress={async () => {
        const newValue = NativeLocalStorage?.setItem('myKey');
        setValue(`${newValue}`)
      }} />
      <Button title="create" onPress={async () => {
        await NativeLocalStorage?.createActivity('myKey');
      }} />
      <Button title="update" onPress={async () => {
        await NativeLocalStorage?.updateActivity('myKey');
      }} />
      <Button title="delete" onPress={async () => {
        await NativeLocalStorage?.deleteActivity('myKey');
      }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  text: {
    margin: 10,
    fontSize: 20,
  },
  textInput: {
    margin: 10,
    height: 40,
    borderColor: 'black',
    borderWidth: 1,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 5,
  },
});

export default App;
