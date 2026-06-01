# Google Maps Setup Guide - Step by Step

## Current Status

Your app already has:
✅ GoogleMaps Flutter package (`google_maps_flutter: ^2.13.1`)
✅ Geolocator for location access (`geolocator: ^14.0.2`)
✅ Location permissions in AndroidManifest.xml
✅ Map widget in location_step.dart (Step 2)
✅ Current location capture with `_captureGps()` method
✅ Map tap to select location functionality
✅ Android build.gradle configured for API key

**What's missing:**
❌ Google Maps API Key in `local.properties`

## Step 1: Get Your Google Maps API Key

### Option A: Create a New Key in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Maps SDK for Android**:
   - Search for "Maps SDK for Android" in the APIs search bar
   - Click on it and enable it
4. Create an API key:
   - Go to Credentials
   - Click "Create Credentials" → "API Key"
   - Copy the API key

### Option B: Use Your Existing Key

If you already have a Maps API key from your project, use that.

## Step 2: Add API Key to local.properties

### Add to `android/local.properties`:

```properties
sdk.dir=/home/x/android-sdk
flutter.sdk=/home/x/flutter/flutter
flutter.buildMode=debug
flutter.versionName=1.0.0
flutter.versionCode=1
GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

Replace `YOUR_API_KEY_HERE` with your actual API key.

### Example:
```properties
GOOGLE_MAPS_API_KEY=AIzaSyDm6d-2ydEj6PxenSeJlzqUi2xQOYYrqPY
```

## Step 3: Verify Android Configuration

The files are already configured:

### ✅ AndroidManifest.xml
```xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="${GOOGLE_MAPS_API_KEY}" />
```

### ✅ android/app/build.gradle.kts
```kotlin
defaultConfig {
    // ... other config
    manifestPlaceholders["GOOGLE_MAPS_API_KEY"] = 
        project.findProperty("GOOGLE_MAPS_API_KEY") ?: ""
}
```

## Step 4: Test the Implementation

### Run the app:
```bash
cd /home/x/Documents/repo/codekeyboard/support-platform-app/app
flutter clean
flutter pub get
flutter run -d LE2101 --dart-define-from-file=.env
```

### Navigate to add school:
1. Login to the app
2. Tap "Add School" or navigate to `/sites/new`
3. Fill Step 1: School Details
4. Go to **Step 2: Location**
5. You should see:
   - Map showing current location
   - Latitude/Longitude fields
   - "Use current" button
   - Ability to tap map to select location

### Test Features:
- [ ] Map displays correctly
- [ ] "Use current" button gets location from GPS
- [ ] Can tap on map to select location
- [ ] Latitude/Longitude fields update when tapping map
- [ ] Current location marked with blue dot
- [ ] Can navigate to next step with location data

## Step 5: Handle Permissions

The app requests location permissions when:
1. User taps "Use current" button
2. App starts (silent permission check)

### Required permissions (already in AndroidManifest.xml):
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />
```

## How It Works

### When Step 2 (Location) Loads:
1. App automatically calls `_captureGps(silent: true)`
2. Tries to get current location
3. Map centers on current location if available
4. Marker shows on the selected/current location

### When User Taps "Use current" Button:
1. App requests location permission
2. Gets current position using Geolocator
3. Updates latitude/longitude text fields
4. Updates map to show new location
5. Map centers on the location

### When User Taps Map:
1. `onMapTap` callback triggers
2. Updates `_selectedLocation` with tapped coordinates
3. Updates latitude/longitude text fields
4. Marker moves to new location

## File Structure

```
lib/features/sites/presentation/
├── add_site_flow_screen.dart          # Main flow controller
├── add_site_flow/
│   ├── location_step.dart             # Step 2 UI
│   ├── form_fields.dart               # Reusable form fields
│   ├── shared_widgets.dart            # Shared components
│   └── models.dart                    # Data models
```

## Key Methods

### _captureGps() - Capture current location
```dart
Future<void> _captureGps({bool silent = false}) async
```

### _onMapTap() - Handle map tap
```dart
void _onMapTap(LatLng location)
```

### _onStateChanged() - Handle state dropdown change
```dart
void _onStateChanged(String? value)
```

### _onLgaChanged() - Handle LGA dropdown change
```dart
void _onLgaChanged(String? value)
```

## Troubleshooting

### Map doesn't show
**Problem**: Black/gray area instead of map
**Solution**: 
1. Check API key is correct
2. Verify `GOOGLE_MAPS_API_KEY` is in local.properties
3. Run `flutter clean` and rebuild
4. Check that Maps SDK for Android is enabled in Google Cloud

### "Getting current location..." shows forever
**Problem**: Location permission denied or GPS not responding
**Solution**:
1. Grant location permission when prompted
2. Ensure device GPS is enabled
3. Wait a few seconds (GPS takes time to lock)
4. Check logcat for errors: `flutter logs`

### Latitude/Longitude fields empty
**Problem**: Location not captured
**Solution**:
1. Tap "Use current" button to capture GPS
2. Or tap on the map to select a location
3. Manually enter coordinates if both fail

### Map toolbar buttons not working
**Features that are intentionally disabled**:
- Map toolbar (menu button)
- Zoom controls (separate buttons)
- These are disabled to keep UI clean

**Features that are enabled**:
- My location button (blue location icon)
- Pinch-to-zoom
- Pan/drag map
- Tap to select location

## What Happens Next

After user sets location in Step 2:
1. Latitude, Longitude saved
2. State, LGA, Ward, Community, Landmark stored
3. Data passed to next steps
4. All location data submitted with school record

## API Key Best Practices

1. **Use separate keys for different environments**:
   - Local development key (unrestricted)
   - Production key (with restrictions)

2. **Enable application restrictions**:
   - Go to API key in Google Cloud Console
   - Set "Application restrictions" to "Android apps"
   - Add your package name and SHA-1 fingerprint

3. **Get SHA-1 fingerprint** (optional but recommended):
   ```bash
   cd android
   ./gradlew signingReport
   ```

4. **Keep key secure**:
   - Don't commit to git (already in .gitignore)
   - Use local.properties (local only)
   - Never expose in frontend code

## Testing Checklist

- [ ] API key added to local.properties
- [ ] `flutter clean` run
- [ ] App runs without crashes
- [ ] Navigate to Add School → Step 2
- [ ] Map displays
- [ ] Can see current location marker
- [ ] "Use current" button works
- [ ] Can tap map to change location
- [ ] Latitude/longitude fields update
- [ ] Can proceed to next step

## Next Steps

1. **Get your API key** from Google Cloud Console
2. **Add to local.properties** with `GOOGLE_MAPS_API_KEY=...`
3. **Run and test** the location step
4. **Verify all features** work as expected

---

Need help? Check the [Google Maps Flutter Docs](https://developers.google.com/maps/flutter-package)
