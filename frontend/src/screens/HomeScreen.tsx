import React
 from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppColors } from "../theme";
import { RootStackParamList } from "../navigation/types";

type HomeScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, "Home">;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[AppColors.primaryDark, "#0F1629", AppColors.primaryMid]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to Responders</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Profile")}
          >
            <Text style={styles.buttonText}>Go to Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { marginTop: 10 }]}
            onPress={() => navigation.navigate("LiveActivity")}
          >
            <Text style={styles.buttonText}>Live Activities</Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 30,
    borderRadius: 15,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    color: "#fff",
    marginBottom: 20,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: AppColors.accentCyan,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});