# Google Maps Implementation - Quick Reference

## What's Already Implemented ✅

### Map Display (Step 2 - Location)
- GoogleMap widget showing current location
- Marker at selected location
- My location button (blue dot icon)
- Pan and zoom capabilities
- Tap to select location functionality

### Location Capture Features
1. **Automatic on Load**
   - App tries to get current location when Step 2 opens
   - Shows location on map with marker

2. **"Use Current" Button**
   - Requests location permission if needed
   - Gets current GPS location
   - Updates latitude/longitude fields
   - Centers map on location

3. **Tap Map to Select**
   - User can tap anywhere on map
   - Marker moves to tapped location
   - Latitude/longitude auto-fill

4. **Manual Entry**
   - Users can manually enter coordinates
   - Useful if GPS fails or location inaccurate

### UI Components
- State dropdown (Select Nigerian state)
- LGA dropdown (Select Local Government Area)
- Ward text field
- Community text field
- Landmark text field (optional)
- Latitude field (auto-filled)
- Longitude field (auto-filled)

### Permissions Handling
- Automatic permission request
- Graceful fallback if denied
- Already configured in AndroidManifest.xml

## What You Need to Do 🎯

### 1. Add Google Maps API Key
File: `android/local.properties`

```properties
GOOGLE_MAPS_API_KEY=YOUR_KEY_HERE
```

### 2. Enable Maps SDK for Android
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Search for "Maps SDK for Android"
4. Click Enable

### 3. Test the App
```bash
cd /home/x/Documents/repo/codekeyboard/support-platform-app/app
flutter clean
flutter pub get
flutter run -d LE2101 --dart-define-from-file=.env
```

## File Locations 📁

### Core Implementation
```
lib/features/sites/presentation/
├── add_site_flow_screen.dart
│   └── _captureGps() method
│   └── _onMapTap() method
├── add_site_flow/
│   └── location_step.dart (Step 2 UI)
```

### Android Configuration
```
android/
├── app/
│   ├── build.gradle.kts (API key placeholder)
│   └── src/main/AndroidManifest.xml (API key meta-data)
├── local.properties (API key value)
└── build.gradle.kts (Secrets plugin)
```

## Code Examples 📝

### Capture GPS Location
```dart
// Automatic on page load
Future<void>.microtask(() => _captureGps(silent: true));

// User button tap
onCaptureGps: _captureGps,  // in LocationStep widget
```

### Handle Map Tap
```dart
void _onMapTap(LatLng location) {
  setState(() {
    _selectedLocation = location;
    _lat.text = location.latitude.toStringAsFixed(6);
    _lng.text = location.longitude.toStringAsFixed(6);
  });
}
```

### Map Widget Configuration
```dart
GoogleMap(
  initialCameraPosition: CameraPosition(
    target: currentLocation,
    zoom: 16,
  ),
  markers: {
    Marker(
      markerId: const MarkerId('current-school-location'),
      position: currentLocation,
    ),
  },
  myLocationEnabled: true,
  myLocationButtonEnabled: true,
  mapToolbarEnabled: false,
  zoomControlsEnabled: false,
  onTap: onMapTap,
)
```

## User Flow 🔄

```
Step 1: School Details
    ↓
Step 2: Location ⭐
    ├─ App loads and gets current location
    ├─ Map shows current location with marker
    ├─ User can:
    │  ├─ Tap "Use current" to update location
    │  ├─ Tap map to select location
    │  └─ Manually enter coordinates
    ├─ Select State, LGA, Ward, Community, Landmark
    └─ Tap "Next" to continue
    ↓
Step 3: Photo Documentation
    ...
```

## Testing Steps 🧪

### 1. Run App
```bash
flutter run -d LE2101 --dart-define-from-file=.env
```

### 2. Navigate to Add School
- Home screen → Add School button
- Or direct: `/sites/new`

### 3. Fill Step 1
- Enter school name
- Select school type
- Enter operator details

### 4. Go to Step 2 (Location)
- Verify map displays
- Verify current location marker shows
- Verify state dropdown works

### 5. Test Location Features
- [ ] Tap "Use current" button → Gets GPS location
- [ ] Tap map → Marker moves, coords update
- [ ] Select state/LGA → Fields populate
- [ ] Enter ward/community → Fields accept input
- [ ] View latitude/longitude → Values populate

### 6. Submit Step 2
- Verify all required fields filled
- Proceed to Step 3

## Dependencies ✅

All already in pubspec.yaml:
```yaml
google_maps_flutter: ^2.13.1
geolocator: ^14.0.2
go_router: ^16.2.5
flutter_riverpod: ^2.6.1
```

## Permissions ✅

Already in AndroidManifest.xml:
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />
```

## Common Issues & Fixes 🔧

| Issue | Fix |
|-------|-----|
| Map shows blank/gray | Add API key to local.properties |
| "Getting location..." forever | Check location permission granted |
| Coordinates not updating | Try tapping "Use current" or map |
| App crashes on Step 2 | Check API key format is correct |
| Permission dialog not showing | Restart app, check if already granted |

## Quick Start Checklist ⚡

- [ ] Get Google Maps API key
- [ ] Add key to `android/local.properties`
- [ ] Run `flutter clean`
- [ ] Run `flutter pub get`
- [ ] Run app: `flutter run -d LE2101`
- [ ] Test Step 2: Location feature
- [ ] Verify map displays
- [ ] Verify location capture works
- [ ] Verify form submission works

## Documentation 📖

- Full guide: [GOOGLE_MAPS_SETUP.md](GOOGLE_MAPS_SETUP.md)
- Google Maps Flutter: [Docs](https://developers.google.com/maps/flutter-package)
- Geolocator package: [Pub.dev](https://pub.dev/packages/geolocator)

---

**Everything is ready!** Just add your API key and test. ✨
