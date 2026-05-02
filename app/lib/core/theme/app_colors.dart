import 'package:flutter/material.dart';

class AppColors {
  const AppColors._();

  static const deepGreen = Color(0xFF0E5F43);
  static const forestGreen = Color(0xFF16734F);
  static const onboardingGreen = Color(0xFF07856F);
  static const onboardingCardGreen = Color(0xFF0A9A85);
  static const paleGreen = Color(0xFFEAF5EF);
  static const ink = Color(0xFF20242A);
  static const muted = Color(0xFF667085);
  static const mutedOnGreen = Color(0xBFE8FFFA);
  static const dashboardBackground = Color(0xFFF5F7FA);
  static const scaffold = Color(0xFFF6F8F7);
  static const line = Color(0xFFE4E7EC);
  static const amber = Color(0xFFF59E0B);
  static const orange = Color(0xFFF97316);
  static const danger = Color(0xFFDC2626);

  static bool isDark(BuildContext context) {
    return Theme.of(context).brightness == Brightness.dark;
  }

  static Color screen(BuildContext context) {
    return Theme.of(context).scaffoldBackgroundColor;
  }

  static Color surface(BuildContext context) {
    return Theme.of(context).colorScheme.surface;
  }

  static Color elevatedSurface(BuildContext context) {
    return isDark(context) ? const Color(0xFF1B211F) : Colors.white;
  }

  static Color border(BuildContext context) {
    return isDark(context) ? const Color(0xFF2A3531) : line;
  }

  static Color primaryText(BuildContext context) {
    return Theme.of(context).colorScheme.onSurface;
  }

  static Color secondaryText(BuildContext context) {
    return isDark(context) ? const Color(0xFFB6C2BD) : muted;
  }

  static Color softFill(BuildContext context) {
    return isDark(context) ? const Color(0xFF202825) : const Color(0xFFF1F4F8);
  }

  static Color greenTint(BuildContext context) {
    return isDark(context) ? const Color(0xFF123C33) : paleGreen;
  }

  static Color dangerTint(BuildContext context) {
    return isDark(context) ? const Color(0xFF3A171A) : const Color(0xFFFFF6F6);
  }

  static Color warningTint(BuildContext context) {
    return isDark(context) ? const Color(0xFF35270B) : const Color(0xFFFFF8E8);
  }
}
