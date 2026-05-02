import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../constants/app_constants.dart';

class LocalSettingsStorage {
  static const _themeModeKey = 'themeMode';
  static const _useSystemThemeKey = 'useSystemTheme';
  static const _volunteerLoginGuideDismissedKey =
      'volunteerLoginGuideDismissed';

  static Future<void> ensureOpened() async {
    if (!Hive.isBoxOpen(AppConstants.settingsBoxName)) {
      await Hive.openBox<String>(AppConstants.settingsBoxName);
    }
  }

  Box<String> get _box => Hive.box<String>(AppConstants.settingsBoxName);

  /// Check if app should follow system theme (default: true)
  bool readUseSystemTheme() {
    final raw = _box.get(_useSystemThemeKey);
    // Default to true (follow system theme) if not set
    return raw != 'false';
  }

  /// Save user preference for following system theme
  Future<void> saveUseSystemTheme(bool useSystemTheme) async {
    await _box.put(_useSystemThemeKey, useSystemTheme.toString());
  }

  /// Read the manually selected theme mode (when not using system theme)
  ThemeMode readThemeMode() {
    final raw = _box.get(_themeModeKey);
    // Default to system if not explicitly set
    return ThemeMode.values.firstWhere(
      (mode) => mode.name == raw,
      orElse: () => ThemeMode.system,
    );
  }

  /// Save manually selected theme mode
  Future<void> saveThemeMode(ThemeMode mode) async {
    await _box.put(_themeModeKey, mode.name);
  }

  bool readVolunteerLoginGuideDismissed() {
    return _box.get(_volunteerLoginGuideDismissedKey) == 'true';
  }

  Future<void> saveVolunteerLoginGuideDismissed(bool dismissed) async {
    await _box.put(_volunteerLoginGuideDismissedKey, dismissed.toString());
  }
}
