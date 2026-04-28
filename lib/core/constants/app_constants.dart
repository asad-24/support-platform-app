class AppConstants {
  const AppConstants._();

  static const appName = 'School Support Atlas';
  static const tagline = 'Enabling data-driven transformation in education';
  static const apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://api.school-support-atlas.local',
  );
  static const draftBoxName = 'school_support_atlas_drafts';
}
