import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';

import 'app/school_support_atlas_app.dart';
import 'core/storage/local_draft_storage.dart';
import 'core/storage/local_settings_storage.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Hive.initFlutter();
  await LocalDraftStorage.ensureOpened();
  await LocalSettingsStorage.ensureOpened();
  runApp(const ProviderScope(child: SchoolSupportAtlasApp()));
}
