import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { PushNotifications } from '@capacitor/push-notifications';

export const isNative = Capacitor.isNativePlatform();
export const isIOS = Capacitor.getPlatform() === 'ios';

export const initNativeApp = async () => {
  if (!isNative) return;

  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setOverlaysWebView({ overlay: true });
  } catch (e) {
    console.log('StatusBar not available');
  }

  try {
    Keyboard.addListener('keyboardWillShow', () => {
      document.body.classList.add('keyboard-open');
    });
    Keyboard.addListener('keyboardWillHide', () => {
      document.body.classList.remove('keyboard-open');
    });
  } catch (e) {
    console.log('Keyboard plugin not available');
  }

  // Initialize Push Notifications
  await initPushNotifications();
};

const initPushNotifications = async () => {
  try {
    // Request permission
    const permResult = await PushNotifications.requestPermissions();
    if (permResult.receive !== 'granted') {
      console.log('Push notification permission not granted');
      return;
    }

    // Register with APNs / FCM
    await PushNotifications.register();

    // Listen for successful registration (get FCM token)
    PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success, token:', token.value);
      // Token can be stored in your database if needed for targeted notifications
    });

    // Listen for registration errors
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error:', error);
    });

    // Listen for incoming notifications while app is in foreground
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received:', notification);
    });

    // Listen for notification tap (when user taps notification)
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('Push notification action:', action);
    });
  } catch (e) {
    console.log('Push notifications not available:', e);
  }
};

export const hapticFeedback = async (style: 'light' | 'medium' | 'heavy' = 'light') => {
  if (!isNative) return;
  try {
    const map = { light: ImpactStyle.Light, medium: ImpactStyle.Medium, heavy: ImpactStyle.Heavy };
    await Haptics.impact({ style: map[style] });
  } catch (e) {}
};
