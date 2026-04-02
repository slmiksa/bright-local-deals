import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from '@/integrations/supabase/client';

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

const upsertDeviceToken = async (token: string) => {
  const platform = Capacitor.getPlatform(); // 'ios' | 'android'
  const city = localStorage.getItem('lamha_selected_city') || null;
  const regionId = localStorage.getItem('lamha_region_id') || null;

  try {
    const payload = {
      token,
      platform,
      city,
      region_id: regionId,
    };

    const { data: existingRows, error: lookupError } = await supabase
      .from('device_tokens')
      .select('id')
      .eq('token', token)
      .limit(1);

    if (lookupError) throw lookupError;

    const { error } = existingRows && existingRows.length > 0
      ? await supabase.from('device_tokens').update(payload).eq('token', token)
      : await supabase.from('device_tokens').insert(payload);

    if (error) throw error;
  } catch (e) {
    console.log('Failed to upsert device token:', e);
  }
};

/** Update city/region for an existing stored token */
export const updateDeviceTokenLocation = async (city: string | null, regionId: string | null) => {
  if (!isNative) return;
  const storedToken = localStorage.getItem('lamha_fcm_token');
  if (!storedToken) return;

  try {
    await supabase
      .from('device_tokens')
      .update({ city, region_id: regionId })
      .eq('token', storedToken);
  } catch (e) {
    console.log('Failed to update device token location:', e);
  }
};

const initPushNotifications = async () => {
  try {
    const permResult = await PushNotifications.requestPermissions();
    if (permResult.receive !== 'granted') {
      console.log('Push notification permission not granted');
      return;
    }

    await PushNotifications.register();

    PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success, token:', token.value);
      // Store token locally for location updates
      localStorage.setItem('lamha_fcm_token', token.value);
      // Upsert to database with current city/region
      upsertDeviceToken(token.value);
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error:', error);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received:', notification);
    });

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
