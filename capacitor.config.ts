import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.trndsky.lamha',
  appName: 'لمحة',
  webDir: 'dist',
  ios: {
    contentInset: 'always',
    preferredContentMode: 'mobile',
    backgroundColor: '#f2efe9',
    scheme: 'lamha',
    allowsLinkPreview: false,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 0,
      backgroundColor: '#1a5c45',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#2b8a68',
      overlaysWebView: true,
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
