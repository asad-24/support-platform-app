# Nested Routing & Back Button Implementation Guide

## Overview
This guide explains how the nested routing system works in the app and how back button behavior is handled.

## What's New

### 1. **Nested Routes with ShellRoutes**
Routes are now organized hierarchically:
- **Volunteer Routes** - All `/volunteer/*` routes use `VolunteerShellLayout`
- **Sites Routes** - All `/sites/*` routes use `SitesShellLayout`
- **Auth Routes** - Standalone (splash, login, signup)

This improves:
- Code organization
- Navigation tracking
- Back button behavior
- State management across related screens

### 2. **Back Button Handling**
The app now properly handles Android back button presses:
- ✅ Back button navigates to previous route instead of closing app
- ✅ Works with nested routes
- ✅ Respects GoRouter's navigation stack

## How It Works

### Automatic Back Navigation
By default, the back button will:
1. Check if there's a previous route in the stack
2. If yes → Navigate back to it
3. If no → Close the app (last screen)

### PopScope Integration
`PopScope` is used at three levels:

1. **App Level** (`BackButtonHandler`)
   - Wraps the entire app
   - Ensures back button is captured

2. **Shell Layout Level** (`VolunteerShellLayout`, `SitesShellLayout`)
   - Organizes related routes
   - Maintains navigation context

3. **Screen Level** (Optional)
   - Individual screens can override behavior
   - Useful for unsaved data, confirmations, etc.

## Usage in Your Screens

### Basic Navigation
```dart
import 'package:go_router/go_router.dart';

// Navigate forward
context.push('/volunteer/profile');

// Replace current route
context.go('/volunteer/home');

// Navigate back
context.pop();

// Check if can go back
if (context.canPop()) {
  context.pop();
}
```

### Using Navigation Helper
```dart
import 'core/router/navigation_helper.dart';

// Cleaner API
NavigationHelper.push(context, '/volunteer/notifications');
NavigationHelper.go(context, '/volunteer/home');
NavigationHelper.pop(context);

// Check current location
String location = NavigationHelper.getCurrentLocation(context);
if (location == '/volunteer/home') {
  // Do something
}
```

### Custom Back Button Handling (Unsaved Data)
If your screen has unsaved data and you need to confirm before going back:

```dart
class MyScreen extends StatefulWidget {
  @override
  State<MyScreen> createState() => _MyScreenState();
}

class _MyScreenState extends State<MyScreen> {
  bool hasUnsavedData = false;

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: !hasUnsavedData, // Prevent pop if unsaved
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        
        // Show confirmation dialog
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Discard changes?'),
            content: const Text('You have unsaved changes.'),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Keep Editing'),
              ),
              TextButton(
                onPressed: () {
                  Navigator.pop(context);
                  NavigationHelper.pop(context); // Go back
                },
                child: const Text('Discard'),
              ),
            ],
          ),
        );
      },
      child: Scaffold(
        appBar: AppBar(title: const Text('Edit Profile')),
        body: Center(
          child: ElevatedButton(
            onPressed: () => setState(() => hasUnsavedData = !hasUnsavedData),
            child: const Text('Toggle Unsaved Data'),
          ),
        ),
      ),
    );
  }
}
```

## Route Structure

### Current Hierarchy
```
/splash (SplashScreen)
/login/:role (LoginScreen)
/signup/:role (SignupScreen)
/volunteer/register (VolunteerApplicationScreen)

/home (HomeScreen)
/welcome/volunteer (VolunteerWelcomeScreen)

/volunteer/* (VolunteerShellLayout)
  ├── /volunteer/home (VolunteerHomeScreen)
  ├── /volunteer/submitted-schools (VolunteerSubmittedSchoolsScreen)
  ├── /volunteer/submitted-schools/:id (SchoolSubmissionDetailScreen)
  ├── /volunteer/drafts (VolunteerDraftRecordsScreen)
  ├── /volunteer/notifications (VolunteerNotificationsScreen)
  ├── /volunteer/profile (VolunteerProfileScreen)
  ├── /volunteer/profile/setup (VolunteerProfileSetupScreen)
  ├── /volunteer/profile/edit (VolunteerProfileSetupScreen - edit mode)
  ├── /volunteer/settings (VolunteerSettingsScreen)
  └── /volunteer/help (VolunteerHelpSupportScreen)

/sites/* (SitesShellLayout)
  ├── /sites (SiteListScreen)
  ├── /sites/new (AddSiteFlowScreen)
  ├── /sites/:id (SiteProfileScreen)
  └── /sites/:id/edit (AddSiteFlowScreen - edit mode)

/dashboard/helper (HomeScreen with helper role)
/map (MapScreen)
/drafts (DraftsScreen or VolunteerDraftRecordsScreen based on role)
/sync (SyncScreen)
/export (ExportScreen)
```

## Key Files

1. **app_router.dart** - Main router configuration with nested routes
2. **back_button_handler.dart** - App-level back button wrapper
3. **shell_layouts.dart** - Shell layouts for volunteer and sites features
4. **navigation_helper.dart** - Utility functions and mixins for navigation

## Testing Back Button

### Test Scenarios
1. ✅ From any `/volunteer/*` route → Back button goes to previous volunteer route
2. ✅ From `/volunteer/home` → Back button closes app (last route)
3. ✅ From `/sites/:id` → Back button goes to previous sites route
4. ✅ With unsaved data → Shows confirmation before going back

### Manual Testing
```bash
# Run app
flutter run -d LE2101

# Press Android back button at different screens
# Verify:
# - Goes back to previous route (not app closure)
# - Routes in same feature branch stay within branch
# - App only closes from root screens
```

## Migration from Old Navigation

If you had custom back button handling using `WillPopScope`:

**Old Way:**
```dart
class MyScreen extends StatefulWidget {
  @override
  State<MyScreen> createState() => _MyScreenState();
}

class _MyScreenState extends State<MyScreen> {
  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        // Custom handling
        return true;
      },
      child: Scaffold(...),
    );
  }
}
```

**New Way:**
```dart
class MyScreen extends StatefulWidget {
  @override
  State<MyScreen> createState() => _MyScreenState();
}

class _MyScreenState extends State<MyScreen> {
  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: true,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        // Custom handling
      },
      child: Scaffold(...),
    );
  }
}
```

## Troubleshooting

### Back button closes app immediately
- Check if route is under a ShellRoute
- Verify PopScope is wrapping the Scaffold
- Ensure GoRouter is properly configured

### Can't navigate back between routes
- Use `context.push()` to add to navigation stack
- Use `context.go()` only for replacement (no back)
- Check ShellRoute configuration

### Back button doesn't show confirmation dialog
- Ensure PopScope has `onPopInvokedWithResult` callback
- Dialog should only pop if user confirms

## Best Practices

1. **Always use nested routes** for related features
2. **Use `push()` for new pages**, `go()` for tab switches
3. **Show confirmations for unsaved data** using PopScope
4. **Test back button** on both Android and iOS
5. **Keep route names consistent** with feature structure

## Additional Resources

- [GoRouter Documentation](https://pub.dev/packages/go_router)
- [PopScope Documentation](https://api.flutter.dev/flutter/widgets/PopScope-class.html)
- [Flutter Navigation](https://docs.flutter.dev/development/ui/navigation)
