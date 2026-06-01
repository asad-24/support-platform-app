import 'package:hive_flutter/hive_flutter.dart';

import '../../shared/models/site_draft.dart';
import '../constants/app_constants.dart';

class LocalDraftStorage {
  static Future<void> ensureOpened() async {
    if (!Hive.isBoxOpen(AppConstants.draftBoxName)) {
      await Hive.openBox<Map>(AppConstants.draftBoxName);
    }
  }

  Box<Map> get _box => Hive.box<Map>(AppConstants.draftBoxName);

  Future<List<SiteDraft>> all() async {
    await ensureOpened();
    return _box.values
        .map((raw) => SiteDraft.fromJson(Map<String, dynamic>.from(raw)))
        .toList()
      ..sort((a, b) => b.updatedAt.compareTo(a.updatedAt));
  }

  Future<void> save(SiteDraft draft) async {
    await ensureOpened();
    await _box.put(draft.id, draft.toJson());
  }

  Future<void> delete(String id) async {
    await ensureOpened();
    await _box.delete(id);
  }

  Future<void> clearSynced() async {
    await ensureOpened();
    final syncedKeys = _box.keys.where((key) {
      final raw = Map<String, dynamic>.from(_box.get(key) ?? const {});
      return SiteDraft.fromJson(raw).syncPending == false;
    }).toList();
    await _box.deleteAll(syncedKeys);
  }
}
