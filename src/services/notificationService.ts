import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are handled when the app is active
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Configure Android Notification Channel
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'Grocify Expiry Reminders',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#10B981',
    sound: 'default',
  }).catch((err) => console.warn('Could not set notification channel:', err));
}

export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return false;
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  } catch (err) {
    console.warn('Error requesting notifications permissions:', err);
    return false;
  }
};

export const cancelAllScheduledNotifications = async () => {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (err) {
    console.warn('Failed to cancel notifications:', err);
  }
};

export const scheduleExpiryReminders = async (items: any[], thresholdDays: number) => {
  if (Platform.OS === 'web') return;

  try {
    // 1. Cancel previous notifications to prevent duplicate stacking
    await cancelAllScheduledNotifications();

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('Skipping notification scheduling: Permissions not granted');
      return;
    }

    const now = new Date().getTime();

    // Determine interval milestones (e.g. 5 days -> [5, 3, 1], 3 days -> [3, 1], 1 day -> [1])
    const defaultMilestones = [5, 3, 1];
    const intervalsToSchedule = Array.from(
      new Set([thresholdDays, ...defaultMilestones.filter(d => d <= thresholdDays)])
    ).sort((a, b) => b - a);

    // 2. Schedule reminders for items that have not yet expired
    for (const item of items) {
      for (const offsetDays of intervalsToSchedule) {
        const expiry = new Date(item.expiryDate);
        // Set reminder time to 9:00 AM on the target milestone date
        expiry.setHours(9, 0, 0, 0);

        const triggerTime = expiry.getTime() - (offsetDays * 24 * 60 * 60 * 1000);

        // Only schedule if the trigger time is in the future
        if (triggerTime > now) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Grocify Expiry Reminder',
              body: `"${item.productName}" will expire in ${offsetDays} ${offsetDays === 1 ? 'day' : 'days'} (${item.expiryDate}). Plan to use it soon!`,
              sound: true,
              data: { itemId: item.id, offsetDays },
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: new Date(triggerTime),
            },
          });
        }
      }
    }
    console.log(`Successfully scheduled multi-interval notifications (${intervalsToSchedule.join(', ')} days before expiry) for ${items.length} items`);
  } catch (error) {
    console.error('Failed to schedule alerts:', error);
  }
};

