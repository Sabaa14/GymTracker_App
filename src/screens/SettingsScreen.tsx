// Settings Screen - App preferences
import React from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSettings } from "../hooks/useState";
import { useTheme } from "../hooks/useTheme";
import { settingsService } from "../services";

export default function SettingsScreen() {
  const theme = useTheme();
  const { settings, updateSetting } = useSettings();

  const handleResetSettings = () => {
    Alert.alert(
      "Reset Settings",
      "Are you sure you want to reset all settings to default?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: resetSettings },
      ],
    );
  };

  const resetSettings = async () => {
    await settingsService.resetSettings();
    Alert.alert("Settings Reset", "All settings have been reset to defaults.");
  };

  const SettingRow = ({
    title,
    subtitle,
    value,
    onChange,
    type = "switch",
  }: any) => (
    <View
      style={[
        styles.settingRow,
        { backgroundColor: theme.surface, borderBottomColor: theme.border },
      ]}
    >
      <View style={styles.settingInfo}>
        <Text style={[styles.settingTitle, { color: theme.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[styles.settingSubtitle, { color: theme.textSecondary }]}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {type === "switch" ? (
        <Switch
          value={value}
          onValueChange={onChange}
          trackColor={{ false: theme.border, true: "#ff6b00" }}
          thumbColor={value ? "#fff" : theme.background}
        />
      ) : (
        <TouchableOpacity style={styles.touchArea}>
          <Text style={[styles.settingValue, { color: theme.textSecondary }]}>
            {value}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* App Preferences */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.textSecondary, backgroundColor: theme.background },
            ]}
          >
            Workout Preferences
          </Text>

          <SettingRow
            title="Default Rest Time"
            subtitle="Seconds between sets"
            value={`${settings.defaultRestTime}s`}
            onChange={(value: any) => updateSetting("defaultRestTime", value)}
            type="input"
          />

          <SettingRow
            title="Enable Vibration"
            subtitle="Haptic feedback for actions"
            value={settings.enableVibration}
            onChange={(value: any) => updateSetting("enableVibration", value)}
          />

          <SettingRow
            title="Enable Sound"
            subtitle="Audio feedback for set completion"
            value={settings.enableSound}
            onChange={(value: any) => updateSetting("enableSound", value)}
          />
        </View>

        {/* Appearance */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.textSecondary, backgroundColor: theme.background },
            ]}
          >
            Appearance
          </Text>

          <SettingRow
            title="Dark Mode"
            subtitle="Switch to dark theme"
            value={settings.darkMode}
            onChange={(value: any) => updateSetting("darkMode", value)}
          />
        </View>

        {/* Notifications */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.textSecondary, backgroundColor: theme.background },
            ]}
          >
            Notifications
          </Text>

          <SettingRow
            title="Enable Notifications"
            subtitle="Workout reminders and tips"
            value={settings.notificationsEnabled}
            onChange={(value: any) =>
              updateSetting("notificationsEnabled", value)
            }
          />
        </View>

        {/* About */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.textSecondary, backgroundColor: theme.background },
            ]}
          >
            About
          </Text>

          <View style={[styles.aboutCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.appName, { color: theme.text }]}>
              GymCheckerRN
            </Text>
            <Text style={[styles.appVersion, { color: theme.textSecondary }]}>
              Version 1.0.0
            </Text>
            <Text
              style={[styles.appDescription, { color: theme.textSecondary }]}
            >
              Your personal offline fitness tracker with AI-powered insights.
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetSettings}
          >
            <Text style={styles.resetButtonText}>Reset All Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Made with ❤️ for fitness enthusiasts
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 32, paddingTop: 0 },

  section: {
    marginHorizontal: 16,
    marginTop: 0,
    borderRadius: 12,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    padding: 16,
    paddingBottom: 8,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  settingInfo: { flex: 1 },
  settingTitle: { fontSize: 16, fontWeight: "500" },
  settingSubtitle: { fontSize: 13, marginTop: 2 },
  settingValue: { padding: 4 },
  touchArea: { padding: 4 },
  aboutCard: { padding: 20, alignItems: "center" },
  appName: { fontSize: 20, fontWeight: "bold", marginBottom: 4 },
  appVersion: { fontSize: 14, marginBottom: 8 },
  appDescription: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  resetButton: { padding: 16, alignItems: "center" },
  resetButtonText: { color: "#f44336", fontWeight: "600" },
  footer: { alignItems: "center", padding: 24 },
  footerText: { fontSize: 14, textAlign: "center" },
});
