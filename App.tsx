// Main App Entry Point
import "react-native-get-random-values";
import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import {
  databaseService,
  seedPPLWorkouts,
  restoreDeletedSets,
} from "./src/services";
import { useSettings } from "./src/hooks/useState";

// Screens
import WorkoutsScreen from "./src/screens/WorkoutsScreen";
import WorkoutDetailScreen from "./src/screens/WorkoutDetailScreen";
import DayExercisesScreen from "./src/screens/DayExercisesScreen";
import AddExerciseScreen from "./src/screens/AddExerciseScreen";
import ProgressScreen from "./src/screens/ProgressScreen";
import AICoachScreen from "./src/screens/AICoachScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function WorkoutsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="WorkoutsList"
        component={WorkoutsScreen}
        options={{ title: "Workouts" }}
      />
      <Stack.Screen
        name="DayExercises"
        component={DayExercisesScreen}
        options={{ title: "Day Exercises" }}
      />
      <Stack.Screen
        name="WorkoutDetail"
        component={WorkoutDetailScreen}
        options={{ title: "Workout" }}
      />
      <Stack.Screen
        name="AddExercise"
        component={AddExerciseScreen}
        options={{ title: "Add Exercise" }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { settings } = useSettings();

  useEffect(() => {
    const initApp = async () => {
      try {
        await databaseService.init();
        console.log("Database initialized");

        // Seed PPL workouts with exercises from Hisham Elmargoushy program
        await seedPPLWorkouts();

        // Restore any accidentally deleted sets
        await restoreDeletedSets();
      } catch (error) {
        console.error("Failed to initialize database:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6b00" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style={settings.darkMode ? "light" : "dark"} />
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: "#ff6b00",
            tabBarInactiveTintColor: "#666",
            headerStyle: {
              backgroundColor: settings.darkMode ? "#1a1a1a" : "#fff",
            },
            tabBarStyle: {
              backgroundColor: settings.darkMode ? "#1a1a1a" : "#fff",
              borderTopColor: settings.darkMode ? "#333" : "#eee",
            },
          }}
        >
          <Tab.Screen
            name="Workouts"
            component={WorkoutsStack}
            options={{
              title: "Workouts",
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <TabIcon name="barbell" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Progress"
            component={ProgressScreen}
            options={{
              title: "Progress",
              tabBarIcon: ({ color, size }) => (
                <TabIcon name="chart" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="AICoach"
            component={AICoachScreen}
            options={{
              title: "AI Coach",
              tabBarIcon: ({ color, size }) => (
                <TabIcon name="brain" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              title: "Settings",
              tabBarIcon: ({ color, size }) => (
                <TabIcon name="settings" color={color} size={size} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

// Simple Tab Icon component
function TabIcon({
  name,
  color,
  size,
}: {
  name: string;
  color: string;
  size: number;
}) {
  const icons: Record<string, string> = {
    barbell: "🏋️",
    chart: "📊",
    brain: "🧠",
    settings: "⚙️",
  };

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: size - 4 }}>{icons[name] || "📱"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
