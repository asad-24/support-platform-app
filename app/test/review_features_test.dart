import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:school_support_atlas/core/storage/local_settings_storage.dart';
import 'package:school_support_atlas/features/sites/data/sites_repository.dart';
import 'package:school_support_atlas/features/volunteer/data/volunteer_notification.dart';
import 'package:school_support_atlas/features/volunteer/presentation/volunteer_profile_screen.dart';
import 'package:school_support_atlas/features/volunteer/presentation/volunteer_submitted_schools_screen.dart';
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
    test('uses approved wording for approved records', () {
      expect(SubmissionReviewStatus.approved.label, 'Approved');
    });

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

    test('approved filter only returns approved records', () async {
      final repository = MockSitesRepository();
      final sites = await repository.getSubmittedSites('field-001');

      final approved = filterSubmittedSchoolsForVolunteer(
        sites,
        SubmittedSchoolsFilter.approved,
      );

      expect(approved, isNotEmpty);
      expect(
        approved.every(
          (site) => site.submissionStatus == SubmissionReviewStatus.approved,
        ),
        isTrue,
      );
    });

    test('derived notifications include only admin outcome statuses', () async {
      final repository = MockSitesRepository();
      final sites = await repository.getSubmittedSites('field-001');

      final notifications = buildVolunteerNotifications(sites);
      final types = notifications.map((item) => item.type);

      expect(types, contains(VolunteerNotificationType.approved));
      expect(types, contains(VolunteerNotificationType.needsCorrection));
      expect(notifications.any((item) => item.siteId == 'site-001'), isFalse);
    });
  });

  group('profile menu', () {
    testWidgets('only shows profile settings and help entries', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: Scaffold(body: ProfileMenuCard())),
      );

      expect(find.text('Edit Profile'), findsOneWidget);
      expect(find.text('Settings'), findsOneWidget);
      expect(find.text('Help & Support'), findsOneWidget);
      expect(find.text('My Submitted Schools'), findsNothing);
      expect(find.text('Draft Records'), findsNothing);
      expect(find.text('Sync Uploads'), findsNothing);
    });
  });
}
