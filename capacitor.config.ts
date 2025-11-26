import type { CapacitorConfig } from '@capacitor/cli';

// Configuration for different environments
const API_URLS = {
  development: 'https://70247a06-ebd1-4d47-b5e6-831ef7fb6443-00-25qnnfdl6zsb9.janeway.replit.dev',
  production: undefined, // Set this to your Railway/Fly.io URL when deploying
  // production: 'https://isbnscout-production.up.railway.app',
};

// Detect environment
const isDevelopment = process.env.NODE_ENV !== 'production';
const apiUrl = isDevelopment ? API_URLS.development : API_URLS.production;

const config: CapacitorConfig = {
  appId: 'com.isbnscout.app',
  appName: 'ISBNScout',
  webDir: 'dist/public',
  server: {
    // Uses Replit URL for development, production URL when building for release
    url: apiUrl,
    cleartext: false, // Use HTTPS for Replit
    androidScheme: 'https', // Use HTTPS scheme for Android
    iosScheme: 'https', // Use HTTPS scheme for iOS
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      backgroundColor: "#f8fafc",
      androidSplashResourceName: "splash",
      iosSplashResourceName: "Default",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small"
    },
    BarcodeScanner: {
      // Native barcode scanner configuration
      cameraDirection: "back",
      scanInstructions: "Position the barcode within the frame",
    },
    CapacitorHttp: {
      enabled: true, // Enable CapacitorHttp for better cookie handling
    },
    CapacitorCookies: {
      enabled: true, // Enable cookie support
    }
  }
};

console.log(`[Capacitor] Environment: ${isDevelopment ? 'development' : 'production'}`);
console.log(`[Capacitor] API URL: ${apiUrl || 'embedded (same-origin)'}`);

export default config;
