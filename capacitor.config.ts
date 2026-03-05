import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.82a916c512ed4a21815c51a771dd7b5b',
  appName: 'لمحة',
  webDir: 'dist',
  server: {
    url: 'https://lamha.trndsky.com',
  },
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
