import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../core/storage/storage_providers.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/responsive.dart';
import '../../../features/sites/data/sites_repository.dart';
import '../../../shared/models/site_draft.dart';
import 'volunteer_home_screen.dart';

class VolunteerDraftRecordsScreen extends ConsumerWidget {
  const VolunteerDraftRecordsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final drafts = ref.watch(draftsProvider);

    return VolunteerMainBackScope(
      currentPath: '/volunteer/drafts',
      child: Scaffold(
        backgroundColor: AppColors.screen(context),
        body: SafeArea(
          bottom: false,
          child: Center(
            child: ConstrainedBox(
              constraints: BoxConstraints(
                maxWidth: Responsive.pageMaxWidth(context),
              ),
              child: drafts.when(
                data: (items) => _DraftBody(drafts: items),
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (error, _) => Center(child: Text(error.toString())),
              ),
            ),
          ),
        ),
        bottomNavigationBar: const VolunteerBottomNavigation(currentIndex: 2),
      ),
    );
  }
}

class _DraftBody extends ConsumerWidget {
  const _DraftBody({required this.drafts});

  final List<SiteDraft> drafts;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ListView(
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
          '${drafts.length} saved drafts',
          style: TextStyle(
            color: AppColors.secondaryText(context),
            fontSize: 13,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 26),
        if (drafts.isEmpty)
          _DraftEmptyState(onStart: () => context.go('/sites/new'))
        else ...[
          for (final draft in drafts) ...[
            DraftRecordCard(
              draft: draft,
              onContinue: () => context.go(
                '/sites/new?draftId=${Uri.encodeComponent(draft.id)}&step=${draft.currentStep}',
              ),
              onDelete: () => _confirmDelete(context, ref, draft),
            ),
            const SizedBox(height: 14),
          ],
          const SizedBox(height: 8),
          ElevatedButton.icon(
            onPressed: () => context.go('/sites/new'),
            icon: const Icon(Icons.add_rounded, size: 22),
            label: const Text('Start New School Record'),
            style: ElevatedButton.styleFrom(
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
    );
  }

  Future<void> _confirmDelete(
    BuildContext context,
    WidgetRef ref,
    SiteDraft draft,
  ) async {
    final delete = await showDialog<bool>(
      context: context,
      builder: (context) => const DeleteDraftDialog(),
    );
    if (delete != true || !context.mounted) return;
    await ref.read(localDraftStorageProvider).delete(draft.id);
    ref.invalidate(draftsProvider);
  }
}

class DraftRecordCard extends StatelessWidget {
  const DraftRecordCard({
    super.key,
    required this.draft,
    required this.onContinue,
    required this.onDelete,
  });

  final SiteDraft draft;
  final VoidCallback onContinue;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    final progressPercent = (draft.progress * 100).round();
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.elevatedSurface(context),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.border(context)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(
              alpha: AppColors.isDark(context) ? 0.18 : 0.03,
            ),
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
                  draft.displayName,
                  style: TextStyle(
                    color: AppColors.primaryText(context),
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
              Icon(
                Icons.access_time_rounded,
                color: AppColors.secondaryText(context),
                size: 16,
              ),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  'Last edited: ${DateFormat.yMMMd().add_jm().format(draft.updatedAt)}',
                  style: TextStyle(
                    color: AppColors.secondaryText(context),
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
              Text(
                'Progress',
                style: TextStyle(
                  color: AppColors.secondaryText(context),
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const Spacer(),
              Text(
                '$progressPercent%',
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
                    side: BorderSide(color: AppColors.border(context)),
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
        backgroundColor: AppColors.softFill(context),
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

  final SiteDraft draft;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
      decoration: BoxDecoration(
        color: AppColors.softFill(context),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        'Step ${draft.currentStep + 1}/${draft.totalSteps}',
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
        color: AppColors.elevatedSurface(context),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.border(context)),
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
          Text(
            'No draft records',
            style: TextStyle(
              color: AppColors.primaryText(context),
              fontSize: 16,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Start a new school record and save it as draft anytime.',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: AppColors.secondaryText(context),
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
