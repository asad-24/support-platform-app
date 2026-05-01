import 'package:flutter_test/flutter_test.dart';
import 'package:school_support_atlas/features/volunteer/data/volunteer_reward.dart';

void main() {
  group('volunteer reward levels', () {
    test('maps approved school thresholds to levels and stars', () {
      final cases = {
        0: ('Community Starter', 0),
        4: ('Community Starter', 0),
        5: ('Field Contributor', 1),
        14: ('Field Contributor', 1),
        15: ('Trusted Mapper', 2),
        30: ('Impact Builder', 3),
        50: ('Senior Field Lead', 4),
        100: ('Atlas Champion', 5),
      };

      for (final entry in cases.entries) {
        final level = VolunteerRewardLevel.fromApprovedCount(entry.key);

        expect(level.label, entry.value.$1);
        expect(level.starCount, entry.value.$2);
      }
    });

    test('explains what each level means', () {
      final level = VolunteerRewardLevel.fromApprovedCount(15);

      expect(level.description, contains('admin review'));
    });

    test('calculates remaining approvals for next level', () {
      final level = VolunteerRewardLevel.fromApprovedCount(5);

      expect(level.remainingForNext(5), 10);
      expect(level.progressFor(10), 0.5);
      expect(
        VolunteerRewardLevel.fromApprovedCount(100).remainingForNext(100),
        0,
      );
    });
  });
}
