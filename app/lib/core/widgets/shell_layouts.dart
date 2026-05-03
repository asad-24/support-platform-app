import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

/// Shell widget for volunteer routes
/// Provides consistent layout and navigation for volunteer feature
class VolunteerShellLayout extends StatefulWidget {
  final Widget child;
  final String currentRoute;

  const VolunteerShellLayout({
    required this.child,
    this.currentRoute = '',
    super.key,
  });

  @override
  State<VolunteerShellLayout> createState() => _VolunteerShellLayoutState();
}

class _VolunteerShellLayoutState extends State<VolunteerShellLayout> {
  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false, // Prevent default back behavior
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        
        // Handle back navigation within volunteer shell
        final router = GoRouter.of(context);
        final currentLocation = widget.currentRoute;
        
        if (currentLocation == '/volunteer/profile/edit') {
          // From profile edit -> profile
          router.go('/volunteer/profile');
        } else if (currentLocation == '/volunteer/settings') {
          // From settings -> profile
          router.go('/volunteer/profile');
        } else if (currentLocation == '/volunteer/submitted-schools') {
          // From submitted schools -> home
          router.go('/volunteer/home');
        } else if (currentLocation.startsWith('/volunteer/submitted-schools/')) {
          // From school detail -> submitted schools
          router.go('/volunteer/submitted-schools');
        } else if (currentLocation == '/volunteer/drafts') {
          // From drafts -> home
          router.go('/volunteer/home');
        } else if (currentLocation == '/volunteer/notifications') {
          // From notifications -> home
          router.go('/volunteer/home');
        } else if (currentLocation == '/volunteer/help') {
          // From help -> home
          router.go('/volunteer/home');
        } else if (currentLocation == '/volunteer/profile/setup') {
          // From profile setup -> home
          router.go('/volunteer/home');
        } else {
          // Default: try to go to home, or let system handle
          if (currentLocation != '/volunteer/home') {
            router.go('/volunteer/home');
          } else {
            // If already at home, allow app closure
            Navigator.of(context).pop();
          }
        }
      },
      child: widget.child,
    );
  }
}

/// Shell widget for site management routes
/// Provides consistent layout and navigation for sites feature
class SitesShellLayout extends StatefulWidget {
  final Widget child;
  final String currentRoute;

  const SitesShellLayout({
    required this.child,
    this.currentRoute = '',
    super.key,
  });

  @override
  State<SitesShellLayout> createState() => _SitesShellLayoutState();
}

class _SitesShellLayoutState extends State<SitesShellLayout> {
  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false, // Prevent default back behavior
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        
        // Handle back navigation within sites shell
        final router = GoRouter.of(context);
        final currentLocation = widget.currentRoute;
        
        if (currentLocation.startsWith('/sites/') && currentLocation.contains('/edit')) {
          // From site edit -> site profile
          final siteId = currentLocation.split('/')[2];
          router.go('/sites/$siteId');
        } else if (currentLocation.startsWith('/sites/') && !currentLocation.contains('/new')) {
          // From site profile -> sites list
          router.go('/sites');
        } else if (currentLocation == '/sites/new') {
          // From new site -> sites list
          router.go('/sites');
        } else {
          // Default: go to sites list
          if (currentLocation != '/sites') {
            router.go('/sites');
          } else {
            // If already at sites, allow app closure
            Navigator.of(context).pop();
          }
        }
      },
      child: widget.child,
    );
  }
}
