import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.isbnscout.app',
  appName: 'ISBNScout',
  webDir: 'dist/public',
  server: {
    // Point to your backend API during development
    // Change this to your production API URL when deploying
    url: process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:5000',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      iosSplashResourceName: "Default"
    }
  }
};

export default config;
