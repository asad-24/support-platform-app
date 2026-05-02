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
      canPop: true,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        // Navigator pops if it can, otherwise prevents app closure
        if (Navigator.of(context).canPop()) {
          Navigator.of(context).pop();
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
      canPop: true,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        if (Navigator.of(context).canPop()) {
          Navigator.of(context).pop();
        }
      },
      child: widget.child,
    );
  }
}
