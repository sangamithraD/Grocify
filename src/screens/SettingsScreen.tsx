import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  ActivityIndicator,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import storage from '../utils/storage';
import { ItemContext } from '../context/ItemsContext';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { scheduleExpiryReminders, cancelAllScheduledNotifications } from '../services/notificationService';

export default function SettingsScreen() {
  const { clearAllItems, items, loading: itemsLoading } = useContext(ItemContext);
  const { colors, isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);

  // States for preferences
  const [expiryAlerts, setExpiryAlerts] = useState(true);
  const [alertDays, setAlertDays] = useState(3);
  const [dietaryPref, setDietaryPref] = useState('all');
  const [resetting, setResetting] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Load preferences on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedAlerts = await storage.getItem('pref_expiry_alerts');
        const storedDays = await storage.getItem('pref_alert_days');
        const storedDiet = await storage.getItem('pref_dietary');

        if (storedAlerts !== null) setExpiryAlerts(storedAlerts === 'true');
        if (storedDays !== null) setAlertDays(parseInt(storedDays, 10));
        if (storedDiet !== null) setDietaryPref(storedDiet);
      } catch (err) {
        console.error('Failed to load user preferences:', err);
      } finally {
        setLoadingSettings(false);
      }
    };
    loadSettings();
  }, []);

  const toggleExpiryAlerts = async (val: boolean) => {
    setExpiryAlerts(val);
    await storage.setItem('pref_expiry_alerts', val ? 'true' : 'false');
    if (val) {
      await scheduleExpiryReminders(items, alertDays);
    } else {
      await cancelAllScheduledNotifications();
    }
  };

  const selectAlertDays = async (days: number) => {
    setAlertDays(days);
    await storage.setItem('pref_alert_days', days.toString());
    if (expiryAlerts) {
      await scheduleExpiryReminders(items, days);
    }
  };

  const selectDietaryPref = async (pref: string) => {
    setDietaryPref(pref);
    await storage.setItem('pref_dietary', pref);
  };

  const executeClear = async () => {
    setResetting(true);
    try {
      await clearAllItems();
      Alert.alert('Success', 'All items have been removed from your pantry.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to clear pantry');
    } finally {
      setResetting(false);
    }
  };

  const handleClearPantry = () => {
    const confirmMessage = 'Are you sure you want to delete all items in your pantry? This action cannot be undone.';
    
    if (Platform.OS === 'web') {
      const confirmWipe = window.confirm(confirmMessage);
      if (confirmWipe) {
        executeClear();
      }
    } else {
      Alert.alert(
        'Clear Pantry Data',
        confirmMessage,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Clear Everything', style: 'destructive', onPress: executeClear }
        ]
      );
    }
  };

  const handleLogout = () => {
    const confirmMessage = 'Are you sure you want to log out?';
    
    if (Platform.OS === 'web') {
      const confirmExit = window.confirm(confirmMessage);
      if (confirmExit) {
        logout();
      }
    } else {
      Alert.alert(
        'Log Out',
        confirmMessage,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Log Out', style: 'destructive', onPress: logout }
        ]
      );
    }
  };

  if (loadingSettings) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const displayName = user?.email ? user.email.split('@')[0] : 'User';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* SECTION: Account */}
        <Text style={[styles.sectionHeader, { color: colors.primary, fontSize: 14, letterSpacing: 0.5 }]}>Account</Text>
        <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary, fontSize: 14 }]}>Username</Text>
            <Text style={[styles.infoValue, { color: colors.text, fontSize: 14 }]}>{displayName}</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary, fontSize: 14 }]}>Email</Text>
            <Text style={[styles.infoValue, { color: colors.text, fontSize: 14 }]}>{user?.email || 'N/A'}</Text>
          </View>
        </View>

        {/* SECTION: Preferences */}
        <Text style={[styles.sectionHeader, { color: colors.primary, fontSize: 14, letterSpacing: 0.5 }]}>Preferences</Text>
        <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Dark Mode Switch */}
          <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.settingTitle, { color: colors.text, fontSize: 14 }]}>Dark Mode Theme</Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: "#CBD5E1", true: colors.accent }}
              thumbColor={isDarkMode ? colors.primary : "#94A3B8"}
            />
          </View>

          {/* Expiry Notifications */}
          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <Text style={[styles.settingTitle, { color: colors.text, fontSize: 14 }]}>Expiry Notifications</Text>
            <Switch
              value={expiryAlerts}
              onValueChange={toggleExpiryAlerts}
              trackColor={{ false: "#CBD5E1", true: colors.accent }}
              thumbColor={expiryAlerts ? colors.primary : "#94A3B8"}
            />
          </View>
        </View>

        {/* Expiry Warning Threshold Selection */}
        {expiryAlerts && (
          <>
            <Text style={[styles.subSectionHeader, { color: colors.textSecondary, fontSize: 12, letterSpacing: 0.5 }]}>Expiry Warning Threshold</Text>
            <View style={styles.thresholdRow}>
              {[1, 3, 5, 7].map((days) => (
                <TouchableOpacity
                  key={days}
                  style={[
                    styles.thresholdChip,
                    { backgroundColor: colors.card, borderColor: colors.border, height: 40, justifyContent: 'center' },
                    alertDays === days && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                  onPress={() => selectAlertDays(days)}
                >
                  <Text style={[
                    styles.thresholdChipText,
                    { color: colors.textSecondary, fontSize: 12 },
                    alertDays === days && styles.thresholdChipTextActive
                  ]}>
                    {days} {days === 1 ? 'day' : 'days'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Recipe Suggestions Dietary filter */}
        <Text style={[styles.subSectionHeader, { color: colors.textSecondary, fontSize: 12, letterSpacing: 0.5 }]}>Recipe Suggestions</Text>
        <View style={styles.dietaryRow}>
          {[
            { id: 'all', label: 'All Recipes' },
            { id: 'vegetarian', label: 'Vegetarian' },
            { id: 'vegan', label: 'Vegan' }
          ].map((pref) => (
            <TouchableOpacity
              key={pref.id}
              style={[
                styles.dietaryChip,
                { backgroundColor: colors.card, borderColor: colors.border, height: 40, justifyContent: 'center' },
                dietaryPref === pref.id && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => selectDietaryPref(pref.id)}
            >
              <Text style={[
                styles.dietaryChipText,
                { color: colors.textSecondary, fontSize: 12 },
                dietaryPref === pref.id && styles.dietaryChipTextActive
              ]}>
                {pref.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SECTION: Application */}
        <Text style={[styles.sectionHeader, { color: colors.primary, fontSize: 14, letterSpacing: 0.5 }]}>Application</Text>
        <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border, paddingVertical: 14 }]}>
          <Text style={[styles.aboutTitle, { color: colors.text, fontSize: 15 }]}>About Grocify</Text>
          <Text style={[styles.aboutText, { color: colors.textSecondary, fontSize: 13 }]}>
            Grocify helps you track your pantry items, monitor expiration dates, and get zero-waste recipe recommendations to minimize household food waste.
          </Text>
          <Text style={[styles.versionText, { color: colors.textSecondary, fontSize: 12 }]}>Version 1.0.0</Text>
        </View>

        {/* SECTION: Account Actions */}
        <Text style={[styles.sectionHeader, { color: colors.primary, fontSize: 14, letterSpacing: 0.5 }]}>Account Actions</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.danger, borderWidth: 1, height: 48, justifyContent: 'center' }]} 
            onPress={handleClearPantry}
            disabled={resetting || itemsLoading}
          >
            {resetting ? (
              <ActivityIndicator color={colors.danger} size="small" />
            ) : (
              <Text style={[styles.actionBtnText, { color: colors.danger, fontSize: 14 }]}>Clear Pantry Data</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.textSecondary, borderWidth: 1, marginTop: 12, height: 48, justifyContent: 'center' }]} 
            onPress={handleLogout}
          >
            <Text style={[styles.actionBtnText, { color: colors.text, fontSize: 14 }]}>Log Out</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    padding: 24,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 18,
  },
  subSectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 12,
  },
  settingsCard: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  thresholdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  thresholdChip: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  thresholdChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  thresholdChipTextActive: {
    color: '#FFFFFF',
  },
  dietaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  dietaryChip: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  dietaryChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  dietaryChipTextActive: {
    color: '#FFFFFF',
  },
  languageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  languageChip: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  languageChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  languageChipTextActive: {
    color: '#FFFFFF',
  },
  aboutTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  aboutText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  versionText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  actionsContainer: {
    marginTop: 6,
  },
  actionBtn: {
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
