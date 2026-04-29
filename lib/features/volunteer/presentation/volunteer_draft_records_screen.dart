import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/utils/responsive.dart';
import '../data/draft_record.dart';
import 'volunteer_home_screen.dart';

class VolunteerDraftRecordsScreen extends StatefulWidget {
  const VolunteerDraftRecordsScreen({super.key});

  @override
  State<VolunteerDraftRecordsScreen> createState() =>
      _VolunteerDraftRecordsScreenState();
}

class _VolunteerDraftRecordsScreenState
    extends State<VolunteerDraftRecordsScreen> {
  late final List<DraftRecord> _drafts;

  @override
  void initState() {
    super.initState();
    _drafts = List<DraftRecord>.of(mockDraftRecords);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.dashboardBackground,
      body: SafeArea(
        bottom: false,
        child: Center(
          child: ConstrainedBox(
            constraints: BoxConstraints(
              maxWidth: Responsive.pageMaxWidth(context),
            ),
            child: ListView(
              padding: const EdgeInsets.fromLTRB(18, 28, 18, 18),
              children: [
                Text(
                  'Draft Records',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '${_drafts.length} unsaved drafts',
                  style: const TextStyle(
                    color: AppColors.muted,
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 26),
                if (_drafts.isEmpty)
                  _DraftEmptyState(onStart: _startNewRecord)
                else ...[
                  for (final draft in _drafts) ...[
                    DraftRecordCard(
                      draft: draft,
                      onContinue: () => _continueDraft(draft),
                      onDelete: () => _confirmDelete(draft),
                    ),
                    const SizedBox(height: 14),
                  ],
                  const SizedBox(height: 8),
                  ElevatedButton.icon(
                    onPressed: _startNewRecord,
                    icon: const Icon(Icons.add_rounded, size: 22),
                    label: const Text('Start New School Record'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.onboardingGreen,
                      foregroundColor: Colors.white,
                      minimumSize: const Size.fromHeight(56),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(18),
                      ),
                      textStyle: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
      bottomNavigationBar: const VolunteerBottomNavigation(currentIndex: 2),
    );
  }

  void _startNewRecord() {
    context.go('/sites/new');
  }

  void _continueDraft(DraftRecord draft) {
    final step = (draft.currentStep - 1).clamp(0, 4);
    context.go(
      '/sites/new?draftId=${Uri.encodeComponent(draft.id)}&step=$step',
    );
  }

  Future<void> _confirmDelete(DraftRecord draft) async {
    final delete = await showDialog<bool>(
      context: context,
      builder: (context) => const DeleteDraftDialog(),
    );
    if (delete != true || !mounted) return;
    setState(() => _drafts.removeWhere((item) => item.id == draft.id));
  }
}

class DraftRecordCard extends StatelessWidget {
  const DraftRecordCard({
    super.key,
    required this.draft,
    required this.onContinue,
    required this.onDelete,
  });

  final DraftRecord draft;
  final VoidCallback onContinue;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.line),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            offset: const Offset(0, 4),
            blurRadius: 12,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  draft.schoolName,
                  style: const TextStyle(
                    color: AppColors.ink,
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    height: 1.12,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              _StepBadge(draft: draft),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              const Icon(
                Icons.access_time_rounded,
                color: AppColors.muted,
                size: 16,
              ),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  'Last edited: ${draft.lastEditedText}',
                  style: const TextStyle(
                    color: AppColors.muted,
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          Row(
            children: [
              const Text(
                'Progress',
                style: TextStyle(
                  color: AppColors.muted,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const Spacer(),
              Text(
                '${draft.progressPercent}%',
                style: const TextStyle(
                  color: AppColors.onboardingGreen,
                  fontSize: 13,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          DraftProgressBar(progress: draft.progress),
          const SizedBox(height: 18),
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: onContinue,
                  icon: const Icon(Icons.edit_outlined, size: 18),
                  label: const Text('Continue Editing'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.onboardingGreen,
                    foregroundColor: Colors.white,
                    minimumSize: const Size.fromHeight(48),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    textStyle: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              SizedBox(
                width: 56,
                height: 48,
                child: OutlinedButton(
                  onPressed: onDelete,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.danger,
                    side: const BorderSide(color: AppColors.line),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    padding: EdgeInsets.zero,
                  ),
                  child: const Icon(Icons.delete_outline_rounded, size: 22),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class DraftProgressBar extends StatelessWidget {
  const DraftProgressBar({super.key, required this.progress});

  final double progress;

  @override
  Widget build(BuildContext context) {
    final value = progress.clamp(0.0, 1.0);
    return ClipRRect(
      borderRadius: BorderRadius.circular(999),
      child: LinearProgressIndicator(
        value: value,
        minHeight: 7,
        color: AppColors.onboardingGreen,
        backgroundColor: const Color(0xFFF0F3F7),
      ),
    );
  }
}

class DeleteDraftDialog extends StatelessWidget {
  const DeleteDraftDialog({super.key});

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Delete Draft?'),
      content: const Text(
        'This draft will be permanently removed from this device.',
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(false),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: () => Navigator.of(context).pop(true),
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.danger,
            foregroundColor: Colors.white,
          ),
          child: const Text('Delete'),
        ),
      ],
    );
  }
}

class _StepBadge extends StatelessWidget {
  const _StepBadge({required this.draft});

  final DraftRecord draft;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F4F8),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        'Step ${draft.currentStep}/${draft.totalSteps}',
        style: const TextStyle(
          color: AppColors.onboardingGreen,
          fontSize: 11,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}

class _DraftEmptyState extends StatelessWidget {
  const _DraftEmptyState({required this.onStart});

  final VoidCallback onStart;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.line),
      ),
      child: Column(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: AppColors.onboardingGreen.withValues(alpha: 0.10),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Icon(
              Icons.edit_note_rounded,
              color: AppColors.onboardingGreen,
              size: 28,
            ),
          ),
          const SizedBox(height: 14),
          const Text(
            'No draft records',
            style: TextStyle(
              color: AppColors.ink,
              fontSize: 16,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Start a new school record and save it as draft anytime.',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: AppColors.muted,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 18),
          ElevatedButton.icon(
            onPressed: onStart,
            icon: const Icon(Icons.add_rounded, size: 22),
            label: const Text('Start New School Record'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.onboardingGreen,
              foregroundColor: Colors.white,
              minimumSize: const Size.fromHeight(48),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
              textStyle: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
