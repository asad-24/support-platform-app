import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../constants/app_constants.dart';

class LocalSettingsStorage {
  static const _themeModeKey = 'themeMode';

  static Future<void> ensureOpened() async {
    if (!Hive.isBoxOpen(AppConstants.settingsBoxName)) {
      await Hive.openBox<String>(AppConstants.settingsBoxName);
    }
  }

  Box<String> get _box => Hive.box<String>(AppConstants.settingsBoxName);

  ThemeMode readThemeMode() {
    final raw = _box.get(_themeModeKey);
    return ThemeMode.values.firstWhere(
      (mode) => mode.name == raw,
      orElse: () => ThemeMode.light,
    );
  }

  Future<void> saveThemeMode(ThemeMode mode) async {
    await _box.put(_themeModeKey, mode.name);
  }
}
