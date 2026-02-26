import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const isNative = Capacitor.isNativePlatform();
export const isIOS = Capacitor.getPlatform() === 'ios';

export const initNativeApp = async () => {
  if (!isNative) return;

  try {
    await StatusBar.setStyle({ style: Style.Light });
    if (isIOS) {
      await StatusBar.setOverlaysWebView({ overlay: true });
    }
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
};

export const hapticFeedback = async (style: 'light' | 'medium' | 'heavy' = 'light') => {
  if (!isNative) return;
  try {
    const map = { light: ImpactStyle.Light, medium: ImpactStyle.Medium, heavy: ImpactStyle.Heavy };
    await Haptics.impact({ style: map[style] });
  } catch (e) {}
};
