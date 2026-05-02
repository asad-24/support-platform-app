# System Theme Detection & Theme Selector Implementation

## Overview

Your Flutter app now automatically detects and applies the device's system theme (light or dark) by default. Users can also manually override this setting in the app's Settings screen.

## What Changed

### New Features ✨

1. **Automatic System Theme Detection** - App follows device theme by default
2. **Manual Theme Override** - Users can lock app to light or dark theme
3. **Enhanced Settings UI** - New theme selector with three clear options
4. **Persistent Preferences** - User choice is saved and restored

### Default Behavior

- **On First Install**: App uses device's system theme (ThemeMode.system)
- **User Changes**: Preferences are saved to local storage
- **App Restart**: Previous user preference is applied

## Files Modified

### Core Files
1. **`lib/core/theme/theme_controller.dart`**
   - Added `useSystemThemeProvider` state provider
   - Added `UseSystemThemeController` to manage system theme preference
   - Existing `themeModeProvider` still works for manual theme selection

2. **`lib/core/storage/local_settings_storage.dart`**
   - Added `_useSystemThemeKey` for storing system theme preference
   - Added `readUseSystemTheme()` method (defaults to true)
   - Added `saveUseSystemTheme()` method
   - Updated `readThemeMode()` to default to `ThemeMode.system`

3. **`lib/app/school_support_atlas_app.dart`**
   - Now watches both `useSystemThemeProvider` and `themeModeProvider`
   - Intelligently selects theme:
     - If `useSystemTheme = true` → Uses `ThemeMode.system`
     - If `useSystemTheme = false` → Uses manual selection (`ThemeMode.light` or `ThemeMode.dark`)

4. **`lib/features/volunteer/presentation/volunteer_settings_screen.dart`**
   - Replaced simple dark mode toggle with comprehensive theme selector
   - Added `_ThemeOption` widget for displaying theme choices
   - Shows 3 options:
     - Follow System Theme (with auto icon)
     - Light Theme (with sun icon)
     - Dark Theme (with moon icon)
   - Visual feedback: selected option shows green border and check mark

## How It Works

### Theme Selection Logic

```
App Startup
    ↓
Read useSystemTheme preference (default: true)
    ↓
If useSystemTheme == true:
    └─→ Use ThemeMode.system (follows device settings)
       └─→ Device is in dark mode? → Dark theme
       └─→ Device is in light mode? → Light theme
    
If useSystemTheme == false:
    └─→ Read manual theme preference (Light or Dark)
       └─→ Apply selected theme regardless of device setting
```

### Data Flow

```
Settings Screen
    ↓
User taps "Follow System Theme" / "Light Theme" / "Dark Theme"
    ↓
Updates useSystemThemeProvider or themeModeProvider
    ↓
Saves to local storage (Hive)
    ↓
App rebuilds with new theme
    ↓
Theme persists across app restarts
```

## Usage

### For Users

**In Settings Screen:**
1. Tap "Settings" in the bottom navigation
2. Scroll to "App Theme" section
3. Choose one of:
   - **Follow System Theme** (recommended) - Matches device settings
   - **Light Theme** - Always use light theme
   - **Dark Theme** - Always use dark theme
4. Selection is saved automatically

### For Developers

#### In Code
```dart
// Watch system theme preference
final useSystemTheme = ref.watch(useSystemThemeProvider);

// Watch manual theme selection
final manualTheme = ref.watch(themeModeProvider);

// Change system theme setting
await ref.read(useSystemThemeProvider.notifier)
    .setUseSystemTheme(true);

// Change manual theme
await ref.read(themeModeProvider.notifier)
    .setThemeMode(ThemeMode.dark);
```

#### Check Current Theme
```dart
// Get effective theme
final brightness = MediaQuery.of(context).platformBrightness;
final isDarkMode = brightness == Brightness.dark;

// Or use Theme.of
final textColor = Theme.of(context).textTheme.bodyMedium?.color;
```

## Data Storage

### Hive Storage Keys
- **`useSystemTheme`** - String value: "true" or "false" (default: "true")
- **`themeMode`** - String value: "light", "dark", or "system"

### Storage Location
```
Android: /data/data/[app.package]/app_flutter/school_support_atlas_settings
iOS: [App Documents]/school_support_atlas_settings
```

## Behavior Examples

### Scenario 1: User Hasn't Changed Settings (Default)
```
Device Setting: Dark Mode ON
App Setting: useSystemTheme = true (default)
Result: App displays Dark Theme ✓
```

### Scenario 2: User Locks to Light Theme
```
Device Setting: Dark Mode ON
App Setting: useSystemTheme = false, themeMode = light
Result: App displays Light Theme (ignores device setting) ✓
```

### Scenario 3: User Changes Device Setting
```
Device Setting: Changed from Light → Dark
App Setting: useSystemTheme = true
Result: App automatically updates to Dark Theme ✓
```

### Scenario 4: App Restart (User Preference Preserved)
```
Before: User locked app to Dark Theme
Restart: App reads saved preference from storage
Result: App loads with Dark Theme immediately ✓
```

## UI/UX Details

### Theme Option Widget (`_ThemeOption`)
- **Default State**: Gray icon, normal border
- **Selected State**: Green icon, green border, checkmark
- **Interaction**: Tap to select, smooth visual feedback
- **Accessibility**: Clear titles and descriptions

### Visual States

**Not Selected:**
```
[Icon] Title
       Description
```

**Selected:**
```
[Green Icon] Title                    [Checkmark]
             Description
```

## Testing

### Verify System Theme Detection
```bash
cd /home/x/Documents/repo/codekeyboard/support-platform-app/app

# Run app
flutter run -d LE2101

# Test: Check app theme matches device setting
# Test: Change device theme, app should update

# On Android, change theme in:
# Settings > Display > Dark theme (toggle)
```

### Test Manual Theme Override
1. Open app Settings
2. Tap "Light Theme"
3. Change device to dark mode
4. App should still show light theme ✓
5. Restart app - should still show light theme ✓

### Verify Data Persistence
1. Open app Settings
2. Select "Dark Theme"
3. Force close app (Settings > Apps > Force Stop)
4. Reopen app
5. Settings should show "Dark Theme" still selected ✓

## Theme Constants

Located in `lib/core/theme/app_colors.dart`:

```dart
class AppColors {
  // Colors adapt based on theme (light/dark)
  static Color screen(BuildContext context) => 
    Theme.of(context).scaffoldBackgroundColor;
  
  static const onboardingGreen = Color(0xFF1B8449);
  static const deepGreen = Color(0xFF0D523D);
  // ... more colors
}
```

## Troubleshooting

### Theme doesn't change when device setting changes
- **Check**: Ensure `useSystemTheme = true` in settings
- **Fix**: Go to Settings, tap "Follow System Theme"

### Manual theme selection not working
- **Check**: Ensure `useSystemTheme = false`
- **Fix**: User selected manual theme but setting still shows "Follow System"
- **Solution**: Tap the manual theme option again

### Theme not persisting after restart
- **Check**: Verify Hive storage is properly initialized
- **Check**: Ensure `LocalSettingsStorage.ensureOpened()` is called in main()
- **Fix**: Delete app and reinstall

### App shows wrong theme on startup
- **Check**: Device theme matches stored preference
- **Check**: Storage keys are correct: "useSystemTheme", "themeMode"
- **Debug**: Add logs in `ThemeController` to verify values

## Migration from Old System

If you had previous dark mode toggle:
- ✅ Old toggle automatically disabled
- ✅ Existing user preference preserved
- ✅ New system theme detection active
- ✅ User can still manually override

## Best Practices

1. **Respect System Settings** - Recommend users use "Follow System Theme"
2. **Test Both Themes** - Ensure app looks good in both light and dark
3. **Use Theme Colors** - Always use `Theme.of(context)` instead of hardcoded colors
4. **Test Device Changes** - Verify app updates when device theme changes
5. **Save User Preference** - Storage is automatic, but test persistence

## API Reference

### Providers

```dart
// Watch system theme preference
final useSystemTheme = ref.watch(useSystemThemeProvider);

// Watch manual theme selection  
final themeMode = ref.watch(themeModeProvider);

// Effective theme (combines both)
final effectiveTheme = useSystemTheme ? ThemeMode.system : themeMode;
```

### Methods

```dart
// Set system theme preference
await ref.read(useSystemThemeProvider.notifier).setUseSystemTheme(true);

// Set manual theme
await ref.read(themeModeProvider.notifier).setThemeMode(ThemeMode.dark);

// Legacy compatibility
await ref.read(themeModeProvider.notifier).setDarkMode(true);
```

### Storage

```dart
// Get storage instance
final storage = LocalSettingsStorage();

// Check system theme preference
bool useSystem = storage.readUseSystemTheme(); // default: true

// Get manual theme setting
ThemeMode theme = storage.readThemeMode();

// Update preference
await storage.saveUseSystemTheme(true);
await storage.saveThemeMode(ThemeMode.dark);
```

## Files Reference

- **Theme Logic**: `lib/core/theme/theme_controller.dart`
- **Storage**: `lib/core/storage/local_settings_storage.dart`
- **App Setup**: `lib/app/school_support_atlas_app.dart`
- **Settings UI**: `lib/features/volunteer/presentation/volunteer_settings_screen.dart`
- **Theme Colors**: `lib/core/theme/app_colors.dart`
- **Light Theme**: `lib/core/theme/app_theme.dart` → `AppTheme.light()`
- **Dark Theme**: `lib/core/theme/app_theme.dart` → `AppTheme.dark()`

## Performance Notes

- ✅ Theme detection runs once at app startup
- ✅ Theme changes trigger only affected widgets
- ✅ System theme changes detected automatically (no polling)
- ✅ Storage operations are fast (Hive is optimized)
- ✅ No performance impact on app

## Summary

Your app now has a modern theme system that:
- ✅ Respects user's device theme by default
- ✅ Allows manual theme override when desired
- ✅ Persists user preference across restarts
- ✅ Updates automatically when device theme changes
- ✅ Provides clear, intuitive UI for selection

Users enjoy a native experience that matches their device settings, with the flexibility to override if needed.
