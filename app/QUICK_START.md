# Quick Start Guide - Nested Routing

## What Changed?

Your Flutter app now has **proper back button handling**. When users press the Android back button, it goes back to the previous screen instead of closing the app.

## Quick Test

```bash
cd /home/x/Documents/repo/codekeyboard/support-platform-app/app

# Run on device
flutter run -d LE2101 --dart-define-from-file=.env

# Test: Navigate around, press back button
# Expected: Goes to previous screen, doesn't close app
```

## Files Changed

### New Files (Core Implementation)
1. **`lib/core/router/navigation_helper.dart`** - Navigation utilities
2. **`lib/core/router/navigation_service.dart`** - Navigation service
3. **`lib/core/widgets/back_button_handler.dart`** - App-level back handler
4. **`lib/core/widgets/shell_layouts.dart`** - Route organization
5. **`lib/core/widgets/back_button_examples.dart`** - Code examples

### Modified Files
1. **`lib/app/school_support_atlas_app.dart`** - Added BackButtonHandler wrapper
2. **`lib/core/router/app_router.dart`** - Reorganized routes into nested structure

### Documentation
- **`ROUTING_GUIDE.md`** - Complete routing guide
- **`IMPLEMENTATION_SUMMARY.md`** - What was implemented
- **`VALIDATION_CHECKLIST.md`** - How to test
- **`QUICK_START.md`** - This file

## How to Use

### Simple Navigation
```dart
import 'core/router/navigation_helper.dart';

// Go to a new screen (can go back)
NavigationHelper.push(context, '/volunteer/notifications');

// Replace current screen (can't go back to this screen)
NavigationHelper.go(context, '/volunteer/home');

// Go back to previous screen
NavigationHelper.pop(context);
```

### Handle Unsaved Data
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
      canPop: !hasUnsavedData,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        // Show confirmation dialog
      },
      child: Scaffold(
        appBar: AppBar(title: const Text('Edit Screen')),
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

See `back_button_examples.dart` for more patterns.

## Route Structure

```
/splash, /login/:role, /signup/:role (Auth)
    ↓
/volunteer/home, /volunteer/settings, etc. (Volunteer Feature)
    ↓
/sites, /sites/new, /sites/:id (Sites Feature)
    ↓
/map, /drafts, /sync, /export (Utilities)
```

Each route group has proper back button handling.

## Testing Checklist

1. **Run the app**
   ```bash
   flutter run -d LE2101 --dart-define-from-file=.env
   ```

2. **Test navigation**
   - Navigate: Home → Submitted Schools
   - Press back → Should go back to home (✓)
   - Navigate: Home → Profile → Edit
   - Press back → Should go to profile (✓)
   - Press back → Should go to home (✓)

3. **Test from root**
   - From `/volunteer/home` (first screen)
   - Press back → App closes (✓ expected)

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Back button closes app immediately | Check if PopScope is in place in school_support_atlas_app.dart |
| Can't navigate back between routes | Use `push()` for forward, `go()` for replace |
| Need to prevent navigation | Use PopScope with `canPop: false` |
| Need custom back behavior | Implement PopScope with `onPopInvokedWithResult` |

## Documentation

For complete details, see:
- **[ROUTING_GUIDE.md](ROUTING_GUIDE.md)** - Full routing documentation
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - What was changed
- **[back_button_examples.dart](lib/core/widgets/back_button_examples.dart)** - Code patterns
- **[VALIDATION_CHECKLIST.md](VALIDATION_CHECKLIST.md)** - Testing guide

## Next Steps

1. ✅ Test on your device
2. ✅ Check all screens for proper back button behavior
3. ✅ For screens with unsaved data, implement PopScope pattern
4. ✅ Share routing guide with your team

## Help

If you encounter issues:
1. Check [VALIDATION_CHECKLIST.md](VALIDATION_CHECKLIST.md) for troubleshooting
2. Review [ROUTING_GUIDE.md](ROUTING_GUIDE.md) for usage patterns
3. Look at [back_button_examples.dart](lib/core/widgets/back_button_examples.dart) for code examples

---

**That's it!** Your app now has proper nested routing with correct back button handling. 🎉

Test it out and let me know if you have questions!
