class VolunteerRewardLevel {
  const VolunteerRewardLevel({
    required this.label,
    required this.description,
    required this.starCount,
    required this.minimumApproved,
    required this.nextTarget,
  });

  final String label;
  final String description;
  final int starCount;
  final int minimumApproved;
  final int? nextTarget;

  int remainingForNext(int approvedCount) {
    final target = nextTarget;
    if (target == null) return 0;
    return (target - approvedCount).clamp(0, target);
  }

  double progressFor(int approvedCount) {
    final target = nextTarget;
    if (target == null) return 1;
    final span = target - minimumApproved;
    if (span <= 0) return 1;
    return ((approvedCount - minimumApproved) / span).clamp(0, 1);
  }

  static VolunteerRewardLevel fromApprovedCount(int approvedCount) {
    if (approvedCount >= 100) {
      return const VolunteerRewardLevel(
        label: 'Atlas Champion',
        description: 'Recognized for 100+ approved school records.',
        starCount: 5,
        minimumApproved: 100,
        nextTarget: null,
      );
    }
    if (approvedCount >= 50) {
      return const VolunteerRewardLevel(
        label: 'Senior Field Lead',
        description: 'Trusted for broad, consistent field coverage.',
        starCount: 4,
        minimumApproved: 50,
        nextTarget: 100,
      );
    }
    if (approvedCount >= 30) {
      return const VolunteerRewardLevel(
        label: 'Impact Builder',
        description: 'Shows strong impact through approved submissions.',
        starCount: 3,
        minimumApproved: 30,
        nextTarget: 50,
      );
    }
    if (approvedCount >= 15) {
      return const VolunteerRewardLevel(
        label: 'Trusted Mapper',
        description: 'Consistently submits records that pass admin review.',
        starCount: 2,
        minimumApproved: 15,
        nextTarget: 30,
      );
    }
    if (approvedCount >= 5) {
      return const VolunteerRewardLevel(
        label: 'Field Contributor',
        description: 'Has started building verified school coverage.',
        starCount: 1,
        minimumApproved: 5,
        nextTarget: 15,
      );
    }
    return const VolunteerRewardLevel(
      label: 'Community Starter',
      description: 'New volunteer working toward first approved records.',
      starCount: 0,
      minimumApproved: 0,
      nextTarget: 5,
    );
  }
}
