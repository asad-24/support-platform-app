import 'app_enums.dart';

class SiteDraft {
  const SiteDraft({
    required this.id,
    required this.updatedAt,
    required this.payload,
    this.syncPending = false,
    this.currentStep = 0,
    this.totalSteps = 1,
  });

  final String id;
  final DateTime updatedAt;
  final Map<String, dynamic> payload;
  final bool syncPending;
  final int currentStep;
  final int totalSteps;

  String get displayName => payload['name'] as String? ?? 'Untitled site';
  UrgencyLevel get urgency =>
      UrgencyLevel.fromJson(payload['urgencyLevel'] as String? ?? 'low');
  double get progress => totalSteps <= 0
      ? 0
      : ((currentStep + 1) / totalSteps).clamp(0.0, 1.0).toDouble();

  factory SiteDraft.fromJson(Map<String, dynamic> json) {
    return SiteDraft(
      id: json['id'] as String,
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      payload: Map<String, dynamic>.from(json['payload'] as Map? ?? const {}),
      syncPending: json['syncPending'] as bool? ?? false,
      currentStep: json['currentStep'] as int? ?? 0,
      totalSteps: json['totalSteps'] as int? ?? 1,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'updatedAt': updatedAt.toIso8601String(),
    'payload': payload,
    'syncPending': syncPending,
    'currentStep': currentStep,
    'totalSteps': totalSteps,
  };
}
