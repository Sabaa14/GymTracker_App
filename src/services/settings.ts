// Settings Service - AsyncStorage for simple settings
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings } from '../types';

const SETTINGS_KEY = '@gymtracker_settings';

const defaultSettings: AppSettings = {
  defaultRestTime: 90,
  enableVibration: true,
  enableSound: true,
  darkMode: false,
  notificationsEnabled: false
};

class SettingsService {
  async getSettings(): Promise<AppSettings> {
    try {
      const jsonValue = await AsyncStorage.getItem(SETTINGS_KEY);
      if (jsonValue) {
        return { ...defaultSettings, ...JSON.parse(jsonValue) };
      }
      return defaultSettings;
    } catch (error) {
      console.error('Error loading settings:', error);
      return defaultSettings;
    }
  }

  async saveSettings(settings: Partial<AppSettings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const newSettings = { ...currentSettings, ...settings };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  async updateDefaultRestTime(time: number): Promise<void> {
    await this.saveSettings({ defaultRestTime: time });
  }

  async toggleVibration(enabled: boolean): Promise<void> {
    await this.saveSettings({ enableVibration: enabled });
  }

  async toggleSound(enabled: boolean): Promise<void> {
    await this.saveSettings({ enableSound: enabled });
  }

  async toggleDarkMode(enabled: boolean): Promise<void> {
    await this.saveSettings({ darkMode: enabled });
  }

  async toggleNotifications(enabled: boolean): Promise<void> {
    await this.saveSettings({ notificationsEnabled: enabled });
  }

  async resetSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  }
}

export const settingsService = new SettingsService();
export default settingsService;