import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../storage/local_settings_storage.dart';
import '../storage/storage_providers.dart';

final themeModeProvider = StateNotifierProvider<ThemeController, ThemeMode>((
  ref,
) {
  return ThemeController(ref.watch(localSettingsStorageProvider));
});

/// Provider to check if app should use system theme
final useSystemThemeProvider =
    StateNotifierProvider<UseSystemThemeController, bool>((
  ref,
) {
  return UseSystemThemeController(ref.watch(localSettingsStorageProvider));
});

class ThemeController extends StateNotifier<ThemeMode> {
  ThemeController(this._storage) : super(_storage.readThemeMode());

  final LocalSettingsStorage _storage;

  /// Set the theme mode explicitly (light or dark)
  Future<void> setThemeMode(ThemeMode mode) async {
    state = mode;
    await _storage.saveThemeMode(mode);
  }

  /// Set dark mode (legacy method for compatibility)
  Future<void> setDarkMode(bool enabled) {
    return setThemeMode(enabled ? ThemeMode.dark : ThemeMode.light);
  }
}

class UseSystemThemeController extends StateNotifier<bool> {
  UseSystemThemeController(this._storage)
      : super(_storage.readUseSystemTheme());

  final LocalSettingsStorage _storage;

  /// Toggle system theme preference
  Future<void> setUseSystemTheme(bool useSystemTheme) async {
    state = useSystemTheme;
    await _storage.saveUseSystemTheme(useSystemTheme);
  }
}
