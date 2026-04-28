import 'app_enums.dart';

class SiteDraft {
  const SiteDraft({
    required this.id,
    required this.updatedAt,
    required this.payload,
    this.syncPending = false,
  });

  final String id;
  final DateTime updatedAt;
  final Map<String, dynamic> payload;
  final bool syncPending;

  String get displayName => payload['name'] as String? ?? 'Untitled site';
  UrgencyLevel get urgency =>
      UrgencyLevel.fromJson(payload['urgencyLevel'] as String? ?? 'low');

  factory SiteDraft.fromJson(Map<String, dynamic> json) {
    return SiteDraft(
      id: json['id'] as String,
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      payload: Map<String, dynamic>.from(json['payload'] as Map? ?? const {}),
      syncPending: json['syncPending'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'updatedAt': updatedAt.toIso8601String(),
    'payload': payload,
    'syncPending': syncPending,
  };
}
