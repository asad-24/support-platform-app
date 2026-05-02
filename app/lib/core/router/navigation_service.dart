import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

/// Navigation service to handle back button behavior and route tracking
class NavigationService {
  /// Check if there's a previous route to go back to
  /// Returns true if back navigation is possible, false if at root
  static bool canNavigateBack(BuildContext context) {
    return GoRouter.of(context).canPop();
  }

  /// Navigate back to previous route
  /// If not possible, does nothing (prevents app closure)
  static void navigateBack(BuildContext context) {
    if (canNavigateBack(context)) {
      GoRouter.of(context).pop();
    }
  }

  /// Navigate to a specific route
  static void navigateTo(BuildContext context, String route) {
    GoRouter.of(context).push(route);
  }

  /// Replace current route (no back navigation)
  static void replaceRoute(BuildContext context, String route) {
    GoRouter.of(context).go(route);
  }

  /// Navigate and clear all previous routes
  static void navigateAndClear(BuildContext context, String route) {
    GoRouter.of(context).go(route);
  }
}
