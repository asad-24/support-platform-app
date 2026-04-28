class WelfareAssessment {
  const WelfareAssessment({
    required this.feedingStatus,
    required this.shelterStatus,
    required this.sanitationStatus,
    required this.waterAccess,
    required this.healthAccess,
    required this.clothingStatus,
    this.safetyRisks,
    this.immediateInterventionNeeded = false,
    this.urgencyReason,
    this.followUpDate,
    this.notes,
  });

  final String feedingStatus;
  final String shelterStatus;
  final String sanitationStatus;
  final String waterAccess;
  final String healthAccess;
  final String clothingStatus;
  final String? safetyRisks;
  final bool immediateInterventionNeeded;
  final String? urgencyReason;
  final DateTime? followUpDate;
  final String? notes;

  factory WelfareAssessment.empty() => const WelfareAssessment(
    feedingStatus: 'Unknown',
    shelterStatus: 'Unknown',
    sanitationStatus: 'Unknown',
    waterAccess: 'Unknown',
    healthAccess: 'Unknown',
    clothingStatus: 'Unknown',
  );

  factory WelfareAssessment.fromJson(Map<String, dynamic> json) {
    return WelfareAssessment(
      feedingStatus: json['feedingStatus'] as String? ?? 'Unknown',
      shelterStatus: json['shelterStatus'] as String? ?? 'Unknown',
      sanitationStatus: json['sanitationStatus'] as String? ?? 'Unknown',
      waterAccess: json['waterAccess'] as String? ?? 'Unknown',
      healthAccess: json['healthAccess'] as String? ?? 'Unknown',
      clothingStatus: json['clothingStatus'] as String? ?? 'Unknown',
      safetyRisks: json['safetyRisks'] as String?,
      immediateInterventionNeeded:
          json['immediateInterventionNeeded'] as bool? ?? false,
      urgencyReason: json['urgencyReason'] as String?,
      followUpDate: json['followUpDate'] == null
          ? null
          : DateTime.parse(json['followUpDate'] as String),
      notes: json['notes'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'feedingStatus': feedingStatus,
    'shelterStatus': shelterStatus,
    'sanitationStatus': sanitationStatus,
    'waterAccess': waterAccess,
    'healthAccess': healthAccess,
    'clothingStatus': clothingStatus,
    'safetyRisks': safetyRisks,
    'immediateInterventionNeeded': immediateInterventionNeeded,
    'urgencyReason': urgencyReason,
    'followUpDate': followUpDate?.toIso8601String(),
    'notes': notes,
  };
}
