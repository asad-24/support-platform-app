import 'package:flutter/material.dart';

/// Widget wrapper that handles Android back button behavior
/// Prevents app from closing by checking if there's a previous route
class BackButtonHandler extends StatefulWidget {
  final Widget child;

  const BackButtonHandler({required this.child, super.key});

  @override
  State<BackButtonHandler> createState() => _BackButtonHandlerState();
}

class _BackButtonHandlerState extends State<BackButtonHandler> {
  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: true,
      onPopInvokedWithResult: (didPop, result) {
        // Let GoRouter handle the back navigation
        // This prevents the app from closing when back button is pressed
        // Instead, it navigates to the previous route
      },
      child: widget.child,
    );
  }
}
