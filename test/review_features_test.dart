import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:school_support_atlas/core/storage/local_settings_storage.dart';
import 'package:school_support_atlas/features/sites/data/sites_repository.dart';
import 'package:school_support_atlas/shared/models/app_enums.dart';

void main() {
  group('theme settings', () {
    late Directory tempDir;

    setUp(() async {
      tempDir = await Directory.systemTemp.createTemp('ssa_theme_test_');
      Hive.init(tempDir.path);
      await LocalSettingsStorage.ensureOpened();
    });

    tearDown(() async {
      await Hive.close();
      await tempDir.delete(recursive: true);
    });

    test('persists selected dark mode', () async {
      final storage = LocalSettingsStorage();

      expect(storage.readThemeMode(), ThemeMode.light);

      await storage.saveThemeMode(ThemeMode.dark);

      expect(LocalSettingsStorage().readThemeMode(), ThemeMode.dark);
    });
  });

  group('submission review statuses', () {
    test('parses backend aliases', () {
      expect(
        SubmissionReviewStatus.fromJson('verified'),
        SubmissionReviewStatus.approved,
      );
      expect(
        SubmissionReviewStatus.fromJson('pending_verification'),
        SubmissionReviewStatus.pendingVerification,
      );
      expect(
        SubmissionReviewStatus.fromJson('failed'),
        SubmissionReviewStatus.needsCorrection,
      );
    });

    test('mock repository exposes backend-shaped submitted schools', () async {
      final repository = MockSitesRepository();
      final sites = await repository.getSubmittedSites('field-001');

      expect(sites, isNotEmpty);
      expect(
        sites.where(
          (site) => site.submissionStatus == SubmissionReviewStatus.approved,
        ),
        isNotEmpty,
      );
      expect(
        sites.where(
          (site) =>
              site.submissionStatus == SubmissionReviewStatus.needsCorrection,
        ),
        isNotEmpty,
      );
    });
  });
}
