import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/models/app_enums.dart';
import '../../../shared/models/site.dart';
import '../../sites/data/sites_repository.dart';

final volunteerNotificationsProvider = FutureProvider.autoDispose
    .family<List<VolunteerNotification>, String>((ref, userId) async {
      final sites = await ref.watch(submittedSitesProvider(userId).future);
      return buildVolunteerNotifications(sites);
    });

enum VolunteerNotificationType { approved, needsCorrection }

class VolunteerNotification {
  const VolunteerNotification({
    required this.id,
    required this.siteId,
    required this.siteName,
    required this.type,
    required this.message,
    required this.createdAt,
  });

  final String id;
  final String siteId;
  final String siteName;
  final VolunteerNotificationType type;
  final String message;
  final DateTime createdAt;
}

List<VolunteerNotification> buildVolunteerNotifications(List<Site> sites) {
  final notifications = <VolunteerNotification>[];
  for (final site in sites) {
    switch (site.submissionStatus) {
      case SubmissionReviewStatus.approved:
        notifications.add(
          VolunteerNotification(
            id: '${site.id}-approved',
            siteId: site.id,
            siteName: site.name,
            type: VolunteerNotificationType.approved,
            message:
                'Admin approved this record. It is now visible to Helpers.',
            createdAt: site.updatedAt,
          ),
        );
      case SubmissionReviewStatus.needsCorrection:
        notifications.add(
          VolunteerNotification(
            id: '${site.id}-needs-correction',
            siteId: site.id,
            siteName: site.name,
            type: VolunteerNotificationType.needsCorrection,
            message:
                site.adminNotes ??
                'Admin requested corrections on this record.',
            createdAt: site.updatedAt,
          ),
        );
      case SubmissionReviewStatus.pendingVerification:
        break;
    }
  }
  return notifications..sort((a, b) => b.createdAt.compareTo(a.createdAt));
}
