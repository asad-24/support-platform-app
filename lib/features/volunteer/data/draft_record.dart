class DraftRecord {
  const DraftRecord({
    required this.id,
    required this.schoolName,
    required this.lastEditedText,
    required this.currentStep,
    required this.totalSteps,
    required this.progress,
  });

  final String id;
  final String schoolName;
  final String lastEditedText;
  final int currentStep;
  final int totalSteps;
  final double progress;

  int get progressPercent => (progress * 100).round();
}

final mockDraftRecords = [
  const DraftRecord(
    id: 'draft-faizan-islamiyya',
    schoolName: 'Faizan Islamiyya',
    lastEditedText: 'Today, 09:14 AM',
    currentStep: 3,
    totalSteps: 5,
    progress: 0.60,
  ),
  const DraftRecord(
    id: 'draft-makaranta-jibril',
    schoolName: 'Makaranta Jibril',
    lastEditedText: 'Yesterday, 04:30 PM',
    currentStep: 1,
    totalSteps: 5,
    progress: 0.20,
  ),
  const DraftRecord(
    id: 'draft-al-furqan-centre',
    schoolName: 'Al-Furqan Centre',
    lastEditedText: 'Apr 13, 2026',
    currentStep: 4,
    totalSteps: 5,
    progress: 0.80,
  ),
];
