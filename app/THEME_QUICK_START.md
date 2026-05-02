# Theme System - Quick Start

## What's New

Your app now automatically adapts to your device's light/dark theme. You can also manually override this in Settings.

## How It Works

### By Default
- **Device has Dark Mode ON** → App shows dark theme
- **Device has Dark Mode OFF** → App shows light theme
- **Device theme changes** → App updates automatically

### Manual Override (Settings)
```
Settings → App Theme
  • Follow System Theme (recommended, default)
  • Light Theme (always light)
  • Dark Theme (always dark)
```

## For Users

### Change Theme Settings
1. Open the app
2. Tap **Settings** (bottom right icon)
3. Find **"App Theme"** section
4. Choose one of three options:
   - **Follow System Theme** - Auto-adapts to device setting
   - **Light Theme** - Always light, bright look
   - **Dark Theme** - Always dark, easy on eyes
5. Selection saves automatically! ✓

### How It Looks

#### Light Theme
- Bright white background
- Dark text
- Green accents
- Good for bright environments

#### Dark Theme
- Dark background
- Light text
- Green accents
- Good for low light environments

## For Developers

### Access Theme in Code

```dart
// Watch system theme preference
final useSystemTheme = ref.watch(useSystemThemeProvider);

// Watch manual theme selection
final manualTheme = ref.watch(themeModeProvider);

// Both combined (what the app actually uses)
final effectiveTheme = useSystemTheme ? ThemeMode.system : manualTheme;
```

### Change Theme Programmatically

```dart
// Follow device theme
await ref.read(useSystemThemeProvider.notifier)
    .setUseSystemTheme(true);

// Force light theme
await ref.read(useSystemThemeProvider.notifier)
    .setUseSystemTheme(false);
await ref.read(themeModeProvider.notifier)
    .setThemeMode(ThemeMode.light);

// Force dark theme
await ref.read(useSystemThemeProvider.notifier)
    .setUseSystemTheme(false);
await ref.read(themeModeProvider.notifier)
    .setThemeMode(ThemeMode.dark);
```

### Use Theme Colors

Always use `Theme.of(context)` for colors:

```dart
// Good ✓
Text('Hello', 
  style: TextStyle(
    color: Theme.of(context).textTheme.bodyMedium?.color
  ),
);

// Avoid ✗
Text('Hello', 
  style: TextStyle(color: Colors.black),
);
```

## Testing

### Test System Theme Detection

On Android:
1. Settings > Display > Dark theme (toggle on)
2. Open app
3. App should show dark theme automatically ✓
4. Toggle off in settings
5. App should show light theme automatically ✓

On iOS:
1. Settings > Display & Brightness > Dark (or Light)
2. Open app
3. App theme matches device setting ✓

### Test Manual Override

1. Settings > Display > Dark theme (OFF - light device)
2. Open app → Shows light theme ✓
3. App Settings > Light Theme → Select Dark Theme
4. App shows dark theme despite light device setting ✓
5. Close and reopen app
6. App still shows dark theme ✓

### Test Persistence

1. Change app theme to Dark Theme
2. Force close app
3. Reopen app
4. App still shows Dark Theme ✓

## File Changes Summary

| File | Change |
|------|--------|
| `theme_controller.dart` | Added system theme provider |
| `local_settings_storage.dart` | Added system theme preference storage |
| `school_support_atlas_app.dart` | App now reads both theme settings |
| `volunteer_settings_screen.dart` | New theme selector UI with 3 options |

## Common Questions

**Q: What's the default?**  
A: Follow System Theme. App automatically matches your device.

**Q: Can I force light theme?**  
A: Yes! Settings > App Theme > Light Theme

**Q: Does theme change when I change device setting?**  
A: Only if you have "Follow System Theme" selected (default).

**Q: Is my choice saved?**  
A: Yes! Your theme preference is saved and restored.

**Q: Can users see old dark mode toggle?**  
A: No, it's replaced with the new theme selector.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| App not following device theme | Check Settings > App Theme > "Follow System Theme" |
| App shows wrong theme after restart | Reselect your theme in Settings |
| Can't find theme settings | Open app, tap Settings (bottom right), scroll to "App Theme" |

## Next Steps

1. **Test it** - Change theme in Settings and see it update
2. **Test device changes** - Toggle device dark mode while app is open
3. **Test persistence** - Change theme, close and reopen app

## More Info

See [THEME_SYSTEM_GUIDE.md](THEME_SYSTEM_GUIDE.md) for complete documentation.

---

**That's it!** Your app theme now adapts to your device or your preference. 🎨
