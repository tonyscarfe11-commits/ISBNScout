import type { CapacitorConfig } from '@capacitor/cli';

// Configuration for different environments
const API_URLS = {
  development: 'http://localhost:5000',
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
    // Uses localhost in development, production URL when building for release
    url: apiUrl,
    cleartext: true, // Required for localhost connections
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
    }
  }
};

console.log(`[Capacitor] Environment: ${isDevelopment ? 'development' : 'production'}`);
console.log(`[Capacitor] API URL: ${apiUrl || 'embedded (same-origin)'}`);

export default config;
