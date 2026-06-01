import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/errors/app_exception.dart';
import '../../../core/network/api_client.dart';
import '../../../shared/models/app_enums.dart';
import '../../../shared/models/site.dart';

final volunteerNotificationsRepositoryProvider =
    Provider<VolunteerNotificationsRepository>((ref) {
      return ApiVolunteerNotificationsRepository(ref.watch(dioProvider));
    });

final volunteerNotificationsProvider = FutureProvider.autoDispose
    .family<List<VolunteerNotification>, String>((ref, userId) async {
      final refreshTimer = Timer.periodic(const Duration(seconds: 15), (_) {
        if (ref.state.isLoading) return;
        ref.invalidateSelf();
      });
      ref.onDispose(refreshTimer.cancel);

      return ref.watch(volunteerNotificationsRepositoryProvider).getAll();
    });

final volunteerUnreadNotificationsProvider = FutureProvider.autoDispose
    .family<int, String>((ref, userId) async {
      final notifications = await ref.watch(
        volunteerNotificationsProvider(userId).future,
      );
      return notifications.where((notification) => !notification.isRead).length;
    });

enum VolunteerNotificationType { approved, needsCorrection }

class VolunteerNotification {
  const VolunteerNotification({
    required this.id,
    required this.siteId,
    required this.siteName,
    required this.type,
    required this.title,
    required this.message,
    required this.status,
    required this.createdAt,
    this.readAt,
  });

  final String id;
  final String siteId;
  final String siteName;
  final VolunteerNotificationType type;
  final String title;
  final String message;
  final String status;
  final DateTime createdAt;
  final DateTime? readAt;

  bool get isRead => status == 'read';

  factory VolunteerNotification.fromJson(Map<String, dynamic> json) {
    final metadata = Map<String, dynamic>.from(
      json['metadata'] as Map? ?? const {},
    );
    final type = _typeFromJson(json['type'] as String? ?? '');
    final schoolId = json['school_id'] ?? json['schoolId'];
    final siteName =
        metadata['school_name'] as String? ??
        metadata['schoolName'] as String? ??
        json['school_name'] as String? ??
        json['siteName'] as String? ??
        'School record';

    return VolunteerNotification(
      id: '${json['id']}',
      siteId: schoolId == null ? '' : '$schoolId',
      siteName: siteName,
      type: type,
      title:
          json['title'] as String? ??
          (type == VolunteerNotificationType.approved
              ? 'School approved'
              : 'Needs correction'),
      message: json['message'] as String? ?? '',
      status: json['status'] as String? ?? 'unread',
      createdAt:
          DateTime.tryParse('${json['created_at'] ?? json['createdAt']}') ??
          DateTime.now(),
      readAt: DateTime.tryParse('${json['read_at'] ?? json['readAt']}'),
    );
  }
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
            title: 'School approved',
            message:
                'Admin approved this record. It is now visible to Helpers.',
            status: 'unread',
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
            title: 'Needs correction',
            message:
                site.adminNotes ??
                'Admin requested corrections on this record.',
            status: 'unread',
            createdAt: site.updatedAt,
          ),
        );
      case SubmissionReviewStatus.pendingVerification:
        break;
    }
  }
  return notifications..sort((a, b) => b.createdAt.compareTo(a.createdAt));
}

abstract class VolunteerNotificationsRepository {
  Future<List<VolunteerNotification>> getAll();

  Future<void> markRead(String id);

  Future<void> markAllRead();
}

class ApiVolunteerNotificationsRepository
    implements VolunteerNotificationsRepository {
  const ApiVolunteerNotificationsRepository(this._dio);

  final Dio _dio;

  @override
  Future<List<VolunteerNotification>> getAll() async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(
        '/volunteer/notifications',
        queryParameters: {'limit': 50},
      );
      final data = response.data ?? const {};
      final envelope = data['data'] as Map<String, dynamic>? ?? data;
      final items = envelope['items'] as List? ?? const [];
      return items
          .map(
            (item) => VolunteerNotification.fromJson(
              Map<String, dynamic>.from(item as Map),
            ),
          )
          .toList();
    } catch (error) {
      throw _exceptionFrom(error);
    }
  }

  @override
  Future<void> markRead(String id) async {
    try {
      await _dio.post<Map<String, dynamic>>(
        '/volunteer/notifications/$id/read',
      );
    } catch (error) {
      throw _exceptionFrom(error);
    }
  }

  @override
  Future<void> markAllRead() async {
    try {
      await _dio.post<Map<String, dynamic>>(
        '/volunteer/notifications/read-all',
      );
    } catch (error) {
      throw _exceptionFrom(error);
    }
  }
}

VolunteerNotificationType _typeFromJson(String value) {
  final normalized = value.trim();
  return switch (normalized) {
    'school_approved' || 'approved' => VolunteerNotificationType.approved,
    'school_rejected' ||
    'rejected' ||
    'needsCorrection' ||
    'needs_correction' => VolunteerNotificationType.needsCorrection,
    _ => VolunteerNotificationType.needsCorrection,
  };
}

AppException _exceptionFrom(Object error) {
  if (error is AppException) return error;
  if (error is DioException) {
    final data = error.response?.data;
    if (data is Map<String, dynamic>) {
      final errorData = data['error'];
      if (errorData is Map<String, dynamic>) {
        return AppException(
          errorData['message'] as String? ?? 'Unable to load notifications.',
          code: errorData['code'] as String?,
        );
      }
    }
    return AppException(error.message ?? 'Unable to load notifications.');
  }
  return AppException(error.toString());
}
