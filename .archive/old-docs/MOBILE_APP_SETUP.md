# ISBNScout Mobile App Setup Guide

## 📱 Overview

ISBNScout is now a **hybrid mobile app** powered by **Capacitor**! This means you can build native iOS and Android apps from your existing React web code.

### What's Installed

- ✅ **Capacitor Core** - Bridge between web and native
- ✅ **iOS Platform** - Native Xcode project in `/ios` folder
- ✅ **Android Platform** - Native Android Studio project in `/android` folder
- ✅ **Essential Plugins:**
  - `@capacitor/camera` - Native camera access
  - `@capacitor/preferences` - Local storage/preferences
  - `@capacitor/status-bar` - Status bar styling
  - `@capacitor/splash-screen` - Launch screen
  - `@capacitor/keyboard` - Keyboard handling
  - `@capacitor/haptics` - Vibration/haptic feedback

---

## 🚀 Quick Start

### Development Workflow

```bash
# 1. Start your backend server (required!)
npm run dev

# 2. Build your web app and sync to mobile
npm run mobile:build

# 3. Open iOS project in Xcode
npm run mobile:ios

# 4. OR Open Android project in Android Studio
npm run mobile:android
```

### Available Commands

| Command | Description |
|---------|-------------|
| `npm run mobile:build` | Build web app + sync to native projects |
| `npm run mobile:ios` | Build and open iOS in Xcode |
| `npm run mobile:android` | Build and open Android in Android Studio |
| `npm run mobile:sync` | Sync code to native projects (no build) |
| `npm run mobile:run:ios` | Build and run on iOS simulator/device |
| `npm run mobile:run:android` | Build and run on Android emulator/device |

---

## 🍎 iOS App Setup

### Prerequisites

- **macOS** (required for iOS development)
- **Xcode 14+** - Download from Mac App Store
- **CocoaPods** - Install with: `sudo gem install cocoapods`
- **iOS Simulator** or physical iPhone/iPad

### First Time Setup

1. **Install CocoaPods dependencies:**
   ```bash
   cd ios/App
   pod install
   cd ../..
   ```

2. **Open the project:**
   ```bash
   npm run mobile:ios
   ```
   This opens `ios/App/App.xcworkspace` in Xcode

3. **Configure Signing:**
   - In Xcode, select the App target
   - Go to "Signing & Capabilities"
   - Select your Team
   - Xcode will automatically create a provisioning profile

4. **Run the app:**
   - Select a simulator or device
   - Click the Play button or press `Cmd + R`

### App Configuration

Edit `ios/App/App/Info.plist` to customize:
- App name and display name
- Supported orientations
- Camera permissions description
- Privacy descriptions

---

## 🤖 Android App Setup

### Prerequisites

- **Android Studio** - Download from [developer.android.com](https://developer.android.com/studio)
- **Java JDK 17+**
- **Android SDK** (installed with Android Studio)
- **Android Emulator** or physical Android device

### First Time Setup

1. **Open the project:**
   ```bash
   npm run mobile:android
   ```
   This opens the `android` folder in Android Studio

2. **Sync Gradle:**
   - Android Studio will prompt you to sync Gradle files
   - Click "Sync Now"
   - Wait for dependencies to download

3. **Create an emulator (if needed):**
   - Tools → Device Manager → Create Device
   - Choose a device (e.g., Pixel 6)
   - Download a system image (e.g., Android 13)

4. **Run the app:**
   - Select your emulator or device
   - Click the Run button or press `Shift + F10`

### App Configuration

Edit `android/app/src/main/AndroidManifest.xml` to customize:
- App name
- Permissions (camera, internet, etc.)
- Supported orientations

Edit `android/app/build.gradle` to change:
- `versionCode` - Increment for each release
- `versionName` - User-facing version (e.g., "1.0.0")
- `minSdkVersion` - Minimum Android version (currently 22 = Android 5.1)
- `targetSdkVersion` - Target Android version (currently 34 = Android 14)

---

## 🔧 Configuration

### `capacitor.config.ts`

This is your main Capacitor configuration file:

```typescript
{
  appId: 'com.isbnscout.app',      // Unique bundle identifier
  appName: 'ISBNScout',             // App display name
  webDir: 'dist/public',            // Where your built web app lives
  server: {
    url: 'http://localhost:5000',   // Your backend API
    cleartext: true                 // Allow HTTP in development
  }
}
```

**Important:** Change `server.url` to your production API before releasing!

---

## 📦 App Icons & Splash Screens

### iOS Icons

1. Generate icon set (1024x1024 PNG)
2. Use a tool like [AppIcon.co](https://appicon.co/) to generate all sizes
3. Replace `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

### Android Icons

1. Generate adaptive icons
2. Replace in `android/app/src/main/res/`:
   - `mipmap-hdpi/`
   - `mipmap-mdpi/`
   - `mipmap-xhdpi/`
   - `mipmap-xxhdpi/`
   - `mipmap-xxxhdpi/`

### Splash Screens

- **iOS:** Edit `ios/App/App/Assets.xcassets/Splash.imageset/`
- **Android:** Edit `android/app/src/main/res/drawable/splash.png`

---

## 🔌 Using Native Features

### Example: Using Camera Plugin

```typescript
import { Camera, CameraResultType } from '@capacitor/camera';

const takePicture = async () => {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.Uri
  });

  const imageUrl = image.webPath;
  // Use the image...
};
```

### Example: Using Preferences (Storage)

```typescript
import { Preferences } from '@capacitor/preferences';

// Save data
await Preferences.set({
  key: 'user_settings',
  value: JSON.stringify({ theme: 'dark' })
});

// Load data
const { value } = await Preferences.get({ key: 'user_settings' });
const settings = JSON.parse(value);
```

### Example: Haptic Feedback

```typescript
import { Haptics, ImpactStyle } from '@capacitor/haptics';

// Light vibration on button press
await Haptics.impact({ style: ImpactStyle.Light });

// Medium vibration
await Haptics.impact({ style: ImpactStyle.Medium });
```

---

## 🌐 Backend API Connection

### Development

Your app connects to `http://localhost:5000` automatically in development mode (see `capacitor.config.ts`).

**Make sure your backend is running!**
```bash
npm run dev
```

### Production

Before releasing, update `capacitor.config.ts`:

```typescript
server: {
  url: undefined, // Remove dev server
  // OR point to your production API:
  // url: 'https://api.isbnscout.com',
}
```

Then rebuild:
```bash
npm run mobile:build
```

---

## 📲 Testing

### iOS Simulator
```bash
npm run mobile:run:ios
```

### Android Emulator
```bash
npm run mobile:run:android
```

### Physical Devices

**iOS:**
- Connect iPhone via USB
- Select it in Xcode
- Click Run

**Android:**
- Enable Developer Mode on device
- Enable USB Debugging
- Connect via USB
- Select device in Android Studio
- Click Run

---

## 🚢 Release Build

### iOS (App Store)

1. **Archive the app:**
   - In Xcode: Product → Archive
   - Wait for archive to complete

2. **Upload to App Store Connect:**
   - Window → Organizer
   - Select your archive
   - Click "Distribute App"
   - Follow the wizard

3. **Submit for Review:**
   - Go to [App Store Connect](https://appstoreconnect.apple.com/)
   - Fill in app information
   - Submit for review

### Android (Google Play)

1. **Generate signing key:**
   ```bash
   cd android
   keytool -genkey -v -keystore isbnscout.keystore -alias isbnscout -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Build release APK/AAB:**
   - In Android Studio: Build → Generate Signed Bundle / APK
   - Follow the wizard
   - Choose AAB (Android App Bundle) for Play Store

3. **Upload to Play Console:**
   - Go to [Google Play Console](https://play.google.com/console)
   - Create app listing
   - Upload AAB
   - Submit for review

---

## 🐛 Troubleshooting

### "Pod install failed" (iOS)
```bash
cd ios/App
pod install --repo-update
```

### "Unable to resolve module" errors
```bash
# Clean and rebuild
rm -rf node_modules dist
npm install
npm run mobile:build
```

### Android build fails
```bash
cd android
./gradlew clean
cd ..
npm run mobile:build
```

### App shows white screen
1. Check that backend is running (`npm run dev`)
2. Check `capacitor.config.ts` has correct `webDir`
3. Rebuild: `npm run mobile:build`

### Camera doesn't work
- **iOS:** Add camera permission to `Info.plist`
- **Android:** Add camera permission to `AndroidManifest.xml`

---

## 📚 Resources

- **Capacitor Docs:** https://capacitorjs.com/docs
- **iOS Development:** https://developer.apple.com/
- **Android Development:** https://developer.android.com/
- **Capacitor Plugins:** https://capacitorjs.com/docs/plugins

---

## ⚡ Next Steps

1. **Test on real devices** - Always test on actual iOS and Android devices
2. **Add custom splash screen** - Replace default splash screens
3. **Create app icons** - Design proper 1024x1024 icon
4. **Configure deep linking** - Allow opening from web links
5. **Add push notifications** - Keep users engaged
6. **Implement offline mode** - Work without internet
7. **Submit to stores!** - Get your app published

---

## 💡 Tips

- **Always test on real devices** before releasing
- **Use `npx cap sync` after changing web code** to update native apps
- **Keep backend running** during development
- **Check console logs** in Xcode/Android Studio for native errors
- **Update plugins regularly**: `npm update @capacitor/*`

---

**Your app is ready to go mobile!** 🎉

Build, test, and ship your iOS and Android apps to the world!
