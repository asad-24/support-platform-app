enum UserAccessRole {
  volunteer,
  helper;

  String get label => switch (this) {
    UserAccessRole.volunteer => 'Volunteer',
    UserAccessRole.helper => 'Helper',
  };

  String get dashboardPath => switch (this) {
    UserAccessRole.volunteer => '/volunteer/home',
    UserAccessRole.helper => '/dashboard/helper',
  };

  static UserAccessRole fromRoute(String? value) {
    return UserAccessRole.values.firstWhere(
      (role) => role.name == value,
      orElse: () => UserAccessRole.volunteer,
    );
  }
}
