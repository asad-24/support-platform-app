import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../storage/local_settings_storage.dart';
import '../storage/storage_providers.dart';

final themeModeProvider = StateNotifierProvider<ThemeController, ThemeMode>((
  ref,
) {
  return ThemeController(ref.watch(localSettingsStorageProvider));
});

class ThemeController extends StateNotifier<ThemeMode> {
  ThemeController(this._storage) : super(_storage.readThemeMode());

  final LocalSettingsStorage _storage;

  Future<void> setThemeMode(ThemeMode mode) async {
    state = mode;
    await _storage.saveThemeMode(mode);
  }

  Future<void> setDarkMode(bool enabled) {
    return setThemeMode(enabled ? ThemeMode.dark : ThemeMode.light);
  }
}
