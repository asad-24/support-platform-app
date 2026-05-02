# Theme System - Visual Reference & API

## Visual Flow Diagram

### App Startup Theme Selection
```
┌─────────────────────────────────────────┐
│  App Starts                             │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Load Preferences from Storage          │
│  • useSystemTheme                       │
│  • manualThemeMode                      │
└──────────────┬──────────────────────────┘
               │
               ▼
        ┌──────────────┐
        │   useSystemTheme?
        │   (true by default)
        └──────┬───────────┘
               │
       ┌───────┴────────┐
       │                │
      YES              NO
       │                │
       ▼                ▼
┌────────────┐    ┌──────────────┐
│ Use Device │    │ Use Manual   │
│ Theme:     │    │ Selection:   │
│ • Auto     │    │ • Light      │
│ • Updates  │    │ • Dark       │
│   when     │    │ • Locked     │
│   device   │    │   (no auto)  │
│   changes  │    │              │
└────────────┘    └──────────────┘
       │                │
       └────────┬───────┘
                ▼
    ┌────────────────────────┐
    │ Apply Theme to App     │
    │ • MaterialApp.router   │
    │ • All screens update   │
    │ • Colors adapt         │
    └────────────────────────┘
```

### Settings Screen - Theme Selection

```
┌─ SETTINGS SCREEN ─────────────────────┐
│                                       │
│  APP THEME                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                       │
│  [🌍] Follow System Theme      ✓     │
│       Use your device's...            │
│                                       │
│  [☀️ ] Light Theme                   │
│       Bright and clean look           │
│                                       │
│  [🌙] Dark Theme                     │
│       Easy on the eyes...             │
│                                       │
│  CHANGE PASSWORD                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                       │
│  [🔒] Change password          >      │
│       Use a strong password...        │
│                                       │
└───────────────────────────────────────┘
```

## Code Structure

### Provider Architecture
```
┌──────────────────────────────────────┐
│  school_support_atlas_app.dart       │
│  ┌────────────────────────────────┐  │
│  │ watch(useSystemThemeProvider)  │  │
│  │ watch(themeModeProvider)       │  │
│  │ Combined logic for final theme │  │
│  └────────────────────────────────┘  │
└──────────────┬───────────────────────┘
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
   ┌────────────┐  ┌──────────┐
   │ useSystemTheme  │ themeMode
   │ Provider   │  │ Provider │
   └────┬───────┘  └────┬─────┘
        │               │
        ▼               ▼
   ┌────────────┐  ┌──────────────┐
   │ Local      │  │ Local Storage
   │ Settings   │  │ (Hive)
   │ Storage    │  │
   └────────────┘  └──────────────┘
```

## User Actions & Flow

### Scenario 1: User Follows System Theme (Default)
```
User opens app (first time)
            ↓
useSystemTheme = true (default)
            ↓
Check device theme
            ↓
Device is in dark mode?
            ├─ YES → Use Dark Theme ✓
            └─ NO → Use Light Theme ✓
            ↓
Device theme changes later
            ├─ Dark → Light → App updates automatically ✓
            └─ Light → Dark → App updates automatically ✓
```

### Scenario 2: User Locks to Light Theme
```
User opens Settings
            ↓
Taps "Light Theme"
            ↓
setUseSystemTheme(false)
setThemeMode(ThemeMode.light)
            ↓
Save to storage
            ↓
App theme changes to light
            ↓
Device changes to dark mode
            ├─ App stays light (ignored) ✓
            └─ As intended by user ✓
            ↓
User closes app
            ↓
reopens app
            ↓
Load from storage
            ├─ useSystemTheme = false
            ├─ themeMode = light
            └─ App shows light theme ✓
```

## API Reference

### Riverpod Providers

#### 1. useSystemThemeProvider
```dart
/// Tracks whether app should follow system theme
final useSystemThemeProvider = StateNotifierProvider<...>(...);

// Watch it
final useSystemTheme = ref.watch(useSystemThemeProvider);

// Update it
await ref.read(useSystemThemeProvider.notifier)
    .setUseSystemTheme(true);
```

#### 2. themeModeProvider  
```dart
/// Tracks manual theme selection (light/dark)
final themeModeProvider = StateNotifierProvider<...>(...);

// Watch it
final manualTheme = ref.watch(themeModeProvider);

// Update it
await ref.read(themeModeProvider.notifier)
    .setThemeMode(ThemeMode.dark);

// Legacy
await ref.read(themeModeProvider.notifier)
    .setDarkMode(true);
```

### Storage Methods

```dart
final storage = LocalSettingsStorage();

// System theme preference (default: true)
bool useSystem = storage.readUseSystemTheme();
await storage.saveUseSystemTheme(false);

// Manual theme selection
ThemeMode mode = storage.readThemeMode();
await storage.saveThemeMode(ThemeMode.dark);
```

## Decision Tree

### Determining App Theme

```
                  Start
                    ▼
        Read useSystemTheme value
                    ▼
            ┌───────┴────────┐
            │                │
          true             false
            │                │
            ▼                ▼
    ┌──────────────┐   ┌──────────────┐
    │ useSystemTheme    │ useManual
    │ (auto-detect)     │ (manual pick)
    └────┬───────┘   └────┬─────────┘
         │                │
         ▼                ▼
    Check device   Read manualTheme:
    brightness     ├─ Light
         │         ├─ Dark
    ┌────┴───┐     └─ System
    │        │
  Light    Dark
    │        │
    ▼        ▼
┌─────────────────┐
│ Apply Theme to  │
│ MaterialApp     │
└─────────────────┘
         ▼
    App renders
```

## State Transitions

### Theme Change Sequence
```
┌─────────────────────────────┐
│ Initial State               │
│ useSystemTheme: true        │
│ themeMode: system           │
│ Appearance: Matches device  │
└──────────┬──────────────────┘
           │
    User taps in Settings
           │
           ▼
┌─────────────────────────────┐
│ User Action                 │
│ "Dark Theme" selected       │
└──────────┬──────────────────┘
           │
    Notifier called
           │
           ▼
┌─────────────────────────────┐
│ Update State                │
│ setUseSystemTheme(false)    │
│ setThemeMode(ThemeMode.dark)│
└──────────┬──────────────────┘
           │
    Save to storage
           │
           ▼
┌─────────────────────────────┐
│ Hive Storage Updated        │
│ useSystemTheme: "false"     │
│ themeMode: "dark"           │
└──────────┬──────────────────┘
           │
    Rebuild widgets
           │
           ▼
┌─────────────────────────────┐
│ Final State                 │
│ App shows Dark Theme        │
│ Changes locked (no auto)    │
└─────────────────────────────┘
```

## Theme Color Adaptation

### Light Theme
```
┌──────────────────────────────┐
│ Light Theme Colors           │
├──────────────────────────────┤
│ Background: #FFFFFF (white)  │
│ Text: #000000 (black)        │
│ Accent: #1B8449 (green)      │
│ Surface: #F5F5F5 (light gray)│
│ Dividers: rgba(0,0,0, 0.12)  │
└──────────────────────────────┘
```

### Dark Theme
```
┌──────────────────────────────┐
│ Dark Theme Colors            │
├──────────────────────────────┤
│ Background: #121212 (dark)   │
│ Text: #FFFFFF (white)        │
│ Accent: #1B8449 (green)      │
│ Surface: #1E1E1E (dark gray) │
│ Dividers: rgba(255,255,255,  │
│           0.12)              │
└──────────────────────────────┘
```

## Component Interactions

### Settings Screen Theme Selector
```
┌──────────────────────────────────┐
│ _ThemeOption Widget              │
├──────────────────────────────────┤
│                                  │
│ constructor:                     │
│  • title: String                 │
│  • description: String           │
│  • icon: IconData                │
│  • isSelected: bool              │
│  • onTap: VoidCallback           │
│                                  │
│ build:                           │
│  • Shows icon + text             │
│  • Visual feedback when selected │
│  • Green border if selected      │
│  • Checkmark if selected         │
│                                  │
│ onTap → Updates providers:       │
│  • setUseSystemTheme()           │
│  • setThemeMode()                │
│  • Saves to storage              │
│                                  │
└──────────────────────────────────┘
```

## Data Flow Diagram

### Complete Data Journey
```
┌─────────────┐
│   Hive      │
│  Database   │
│  (Storage)  │
└──────┬──────┘
       │
       │ readUseSystemTheme()
       │ readThemeMode()
       │
       ▼
┌─────────────────────────┐
│ LocalSettingsStorage    │
│ (Initialization)        │
└──────┬──────────────────┘
       │
       │ Creates StateNotifiers
       │
       ▼
┌─────────────────────────┐
│ ThemeController         │
│ UseSystemThemeController
└──────┬──────────────────┘
       │
       │ Provides state
       │
       ▼
┌─────────────────────────┐
│ school_support_atlas_app│
│ (watches both)          │
└──────┬──────────────────┘
       │
       │ Combines logic
       │ Selects final theme
       │
       ▼
┌─────────────────────────┐
│ MaterialApp.router      │
│ themeMode = selected    │
└──────┬──────────────────┘
       │
       │ Rebuilds
       │
       ▼
┌─────────────────────────┐
│ All Screens Update      │
│ Theme.of(context)       │
│ Returns correct colors  │
└─────────────────────────┘
```

## Performance Timeline

```
App Startup
├─ 0ms: Initialize Hive
├─ 5ms: Read storage
├─ 10ms: Create providers
├─ 15ms: Determine theme
├─ 20ms: Apply to MaterialApp
├─ 30ms: Render first frame
└─ 50ms: App visible

Theme Change (User Action)
├─ 0ms: User taps option
├─ 5ms: Update provider
├─ 10ms: Save to storage
├─ 15ms: Rebuild widgets
└─ 50ms: New theme visible

Device Theme Change (System)
├─ 0ms: System notifies
├─ 5ms: Check useSystemTheme
├─ 10ms: If true, rebuild
└─ 30ms: New theme visible
```

---

This visual reference should help understand the theme system architecture and how all components interact. 🎨
