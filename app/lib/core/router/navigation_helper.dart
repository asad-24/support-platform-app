import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

/// Helper class for common navigation operations
class NavigationHelper {
  /// Check if the app can navigate back
  static bool canPop(BuildContext context) {
    return GoRouter.of(context).canPop();
  }

  /// Navigate back to previous route
  /// Usage in screens:
  /// ```dart
  /// NavigationHelper.pop(context);
  /// ```
  static void pop(BuildContext context) {
    if (GoRouter.of(context).canPop()) {
      GoRouter.of(context).pop();
    }
  }

  /// Navigate to a route (pushes to stack)
  /// Usage in screens:
  /// ```dart
  /// NavigationHelper.push(context, '/volunteer/profile');
  /// ```
  static void push(BuildContext context, String location) {
    GoRouter.of(context).push(location);
  }

  /// Replace current route (doesn't push to stack)
  /// Usage in screens:
  /// ```dart
  /// NavigationHelper.go(context, '/volunteer/home');
  /// ```
  static void go(BuildContext context, String location) {
    GoRouter.of(context).go(location);
  }

  /// Get current route location
  static String getCurrentLocation(BuildContext context) {
    return GoRouter.of(context).location;
  }
}

/// Mixin for screens that need custom back button handling
/// Usage in your screen:
/// ```dart
/// class MyScreen extends StatefulWidget {
///   @override
///   State<MyScreen> createState() => _MyScreenState();
/// }
///
/// class _MyScreenState extends State<MyScreen> with BackButtonMixin {
///   @override
///   Future<bool> onBackPressed() async {
///     // Return true to prevent navigation, false to allow
///     // You can show dialogs, save data, etc.
///     return false; // Allow navigation
///   }
///
///   @override
///   Widget build(BuildContext context) {
///     return PopScope(
///       canPop: true,
///       onPopInvokedWithResult: (didPop, result) {
///         if (didPop) return;
///         onBackPressed().then((shouldPrevent) {
///           if (!shouldPrevent && mounted) {
///             NavigationHelper.pop(context);
///           }
///         });
///       },
///       child: Scaffold(
///         appBar: AppBar(title: const Text('My Screen')),
///         body: Center(child: Text('Screen Content')),
///       ),
///     );
///   }
/// }
/// ```
mixin BackButtonMixin {
  /// Override this method to handle back button behavior
  /// Return true to prevent navigation, false to allow it
  Future<bool> onBackPressed() async => false;
}
