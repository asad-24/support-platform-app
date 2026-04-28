class DashboardSummary {
  const DashboardSummary({
    required this.totalSites,
    required this.estimatedChildren,
    required this.pendingVerification,
    required this.verifiedSites,
    required this.highUrgencySites,
  });

  final int totalSites;
  final int estimatedChildren;
  final int pendingVerification;
  final int verifiedSites;
  final int highUrgencySites;
}
