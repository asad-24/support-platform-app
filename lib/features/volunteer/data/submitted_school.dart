enum SubmittedSchoolStatus {
  approved,
  pendingVerification,
  needsCorrection;

  String get label => switch (this) {
    SubmittedSchoolStatus.approved => 'Approved',
    SubmittedSchoolStatus.pendingVerification => 'Pending Verification',
    SubmittedSchoolStatus.needsCorrection => 'Needs Correction',
  };
}

class SubmittedSchool {
  const SubmittedSchool({
    required this.id,
    required this.name,
    required this.location,
    required this.status,
    required this.childrenCount,
    required this.submittedDate,
    required this.needs,
    required this.isLive,
    this.correctionMessage,
  });

  final String id;
  final String name;
  final String location;
  final SubmittedSchoolStatus status;
  final int childrenCount;
  final DateTime submittedDate;
  final List<String> needs;
  final bool isLive;
  final String? correctionMessage;
}

final mockSubmittedSchools = [
  SubmittedSchool(
    id: 'al-noor-madrasa',
    name: 'Al-Noor Madrasa',
    location: 'Nassarawa LGA, Kano',
    status: SubmittedSchoolStatus.approved,
    childrenCount: 87,
    submittedDate: DateTime(2026, 4, 10),
    needs: const ['Feeding', 'Healthcare', 'Sanitation'],
    isLive: true,
  ),
  SubmittedSchool(
    id: 'badr-academy',
    name: 'Badr Academy',
    location: 'Tarauni LGA, Kano',
    status: SubmittedSchoolStatus.approved,
    childrenCount: 203,
    submittedDate: DateTime(2026, 3, 28),
    needs: const ['Feeding', 'Shelter', 'Sanitation'],
    isLive: true,
  ),
  SubmittedSchool(
    id: 'faizan-islamiyya',
    name: 'Faizan Islamiyya',
    location: 'Ungogo LGA, Kano',
    status: SubmittedSchoolStatus.pendingVerification,
    childrenCount: 67,
    submittedDate: DateTime(2026, 4, 14),
    needs: const ['Clothing', 'Education Materials'],
    isLive: false,
  ),
  SubmittedSchool(
    id: 'makaranta-jibril',
    name: 'Makaranta Jibril',
    location: 'Kumbotso LGA, Kano',
    status: SubmittedSchoolStatus.needsCorrection,
    childrenCount: 44,
    submittedDate: DateTime(2026, 4, 12),
    needs: const ['Feeding'],
    isLive: false,
    correctionMessage: 'Admin review found issues — please update and resubmit',
  ),
];
