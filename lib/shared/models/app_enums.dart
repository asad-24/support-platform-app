enum UserRole {
  admin,
  fieldWorker;

  String get label => switch (this) {
    UserRole.admin => 'Admin',
    UserRole.fieldWorker => 'Field Worker',
  };

  static UserRole fromJson(String value) {
    return UserRole.values.firstWhere(
      (role) => role.name == value,
      orElse: () => UserRole.fieldWorker,
    );
  }
}

enum VerificationStatus {
  pending,
  verified,
  rejected;

  String get label => switch (this) {
    VerificationStatus.pending => 'Pending',
    VerificationStatus.verified => 'Verified',
    VerificationStatus.rejected => 'Rejected',
  };

  static VerificationStatus fromJson(String value) {
    return VerificationStatus.values.firstWhere(
      (status) => status.name == value,
      orElse: () => VerificationStatus.pending,
    );
  }
}

enum UrgencyLevel {
  low,
  medium,
  high;

  String get label => switch (this) {
    UrgencyLevel.low => 'Low',
    UrgencyLevel.medium => 'Medium',
    UrgencyLevel.high => 'High',
  };

  static UrgencyLevel fromJson(String value) {
    return UrgencyLevel.values.firstWhere(
      (level) => level.name == value,
      orElse: () => UrgencyLevel.low,
    );
  }
}

enum MediaType {
  entrance,
  classArea,
  sleepingArea,
  sanitation,
  environment,
  other;

  String get label => switch (this) {
    MediaType.entrance => 'Entrance',
    MediaType.classArea => 'Class area',
    MediaType.sleepingArea => 'Sleeping area',
    MediaType.sanitation => 'Sanitation',
    MediaType.environment => 'Environment',
    MediaType.other => 'Other',
  };

  String toJson() => switch (this) {
    MediaType.classArea => 'class_area',
    MediaType.sleepingArea => 'sleeping_area',
    _ => name,
  };

  static MediaType fromJson(String value) {
    return switch (value) {
      'class_area' => MediaType.classArea,
      'sleeping_area' => MediaType.sleepingArea,
      _ => MediaType.values.firstWhere(
        (type) => type.name == value,
        orElse: () => MediaType.other,
      ),
    };
  }
}

enum NeedType {
  feeding,
  clothing,
  bedding,
  shelterImprovement,
  healthOutreach,
  counselling,
  sanitation,
  waterAccess,
  hygieneKits,
  educationMaterials,
  safeguarding,
  identityDocumentation,
  other;

  String get label => switch (this) {
    NeedType.feeding => 'Feeding',
    NeedType.clothing => 'Clothing',
    NeedType.bedding => 'Bedding',
    NeedType.shelterImprovement => 'Shelter',
    NeedType.healthOutreach => 'Healthcare',
    NeedType.counselling => 'Counselling',
    NeedType.sanitation => 'Sanitation',
    NeedType.waterAccess => 'Water access',
    NeedType.hygieneKits => 'Hygiene kits',
    NeedType.educationMaterials => 'Education materials',
    NeedType.safeguarding => 'Safeguarding support',
    NeedType.identityDocumentation => 'Identity documentation',
    NeedType.other => 'Other',
  };

  String toJson() => switch (this) {
    NeedType.shelterImprovement => 'shelterImprovement',
    NeedType.healthOutreach => 'healthOutreach',
    NeedType.waterAccess => 'waterAccess',
    NeedType.hygieneKits => 'hygieneKits',
    NeedType.educationMaterials => 'educationMaterials',
    NeedType.identityDocumentation => 'identityDocumentation',
    _ => name,
  };

  static NeedType fromJson(String value) {
    return NeedType.values.firstWhere(
      (need) => need.toJson() == value || need.name == value,
      orElse: () => NeedType.other,
    );
  }
}
