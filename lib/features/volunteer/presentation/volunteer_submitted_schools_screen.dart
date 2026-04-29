import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/utils/responsive.dart';
import '../../../features/auth/presentation/auth_controller.dart';
import '../../../features/sites/data/sites_repository.dart';
import '../../../shared/models/app_enums.dart';
import '../../../shared/models/site.dart';
import 'volunteer_home_screen.dart';

enum SubmittedSchoolsFilter {
  all('All'),
  submitted('Submitted'),
  pendingVerification('Pending Verification'),
  needsCorrection('Needs Correction');

  const SubmittedSchoolsFilter(this.label);

  final String label;
}

class VolunteerSubmittedSchoolsScreen extends ConsumerStatefulWidget {
  const VolunteerSubmittedSchoolsScreen({super.key});

  @override
  ConsumerState<VolunteerSubmittedSchoolsScreen> createState() =>
      _VolunteerSubmittedSchoolsScreenState();
}

class _VolunteerSubmittedSchoolsScreenState
    extends ConsumerState<VolunteerSubmittedSchoolsScreen> {
  SubmittedSchoolsFilter _filter = SubmittedSchoolsFilter.all;

  @override
  Widget build(BuildContext context) {
    final userId =
        ref.watch(authControllerProvider).valueOrNull?.session?.user.id ??
        'field-001';
    final submittedSites = ref.watch(submittedSitesProvider(userId));

    return VolunteerMainBackScope(
      currentPath: '/volunteer/submitted-schools',
      child: Scaffold(
        backgroundColor: AppColors.screen(context),
        body: SafeArea(
          bottom: false,
          child: Center(
            child: ConstrainedBox(
              constraints: BoxConstraints(
                maxWidth: Responsive.pageMaxWidth(context),
              ),
              child: submittedSites.when(
                data: (sites) => _SubmittedSchoolsBody(
                  sites: sites,
                  filter: _filter,
                  onFilterChanged: (value) => setState(() => _filter = value),
                ),
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (error, _) => Center(child: Text(error.toString())),
              ),
            ),
          ),
        ),
        bottomNavigationBar: const VolunteerBottomNavigation(currentIndex: 1),
      ),
    );
  }
}

class _SubmittedSchoolsBody extends StatelessWidget {
  const _SubmittedSchoolsBody({
    required this.sites,
    required this.filter,
    required this.onFilterChanged,
  });

  final List<Site> sites;
  final SubmittedSchoolsFilter filter;
  final ValueChanged<SubmittedSchoolsFilter> onFilterChanged;

  @override
  Widget build(BuildContext context) {
    final approvedCount = sites
        .where(
          (site) => site.submissionStatus == SubmissionReviewStatus.approved,
        )
        .length;
    final filtered = sites.where((site) {
      return switch (filter) {
        SubmittedSchoolsFilter.all => true,
        SubmittedSchoolsFilter.submitted =>
          site.submissionStatus == SubmissionReviewStatus.approved,
        SubmittedSchoolsFilter.pendingVerification =>
          site.submissionStatus == SubmissionReviewStatus.pendingVerification,
        SubmittedSchoolsFilter.needsCorrection =>
          site.submissionStatus == SubmissionReviewStatus.needsCorrection,
      };
    }).toList();

    return ListView(
      padding: const EdgeInsets.fromLTRB(18, 28, 18, 18),
      children: [
        Text(
          'My Submitted Schools',
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
            fontSize: 22,
            fontWeight: FontWeight.w900,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          '${sites.length} submissions · $approvedCount submitted & live',
          style: TextStyle(
            color: AppColors.secondaryText(context),
            fontSize: 13,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 18),
        _SubmissionFilterTabs(
          sites: sites,
          selected: filter,
          onChanged: onFilterChanged,
        ),
        const SizedBox(height: 18),
        if (filtered.isEmpty)
          _SubmittedEmptyState(filter: filter)
        else
          for (final site in filtered) ...[
            SubmittedSchoolCard(
              site: site,
              onTap: () =>
                  context.go('/volunteer/submitted-schools/${site.id}'),
            ),
            const SizedBox(height: 14),
          ],
        const SizedBox(height: 8),
        ElevatedButton.icon(
          onPressed: () => context.go('/sites/new'),
          icon: const Icon(Icons.add_rounded, size: 22),
          label: const Text('Submit Another School'),
          style: ElevatedButton.styleFrom(
            minimumSize: const Size.fromHeight(48),
            textStyle: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w900,
            ),
          ),
        ),
        const SizedBox(height: 12),
      ],
    );
  }
}

class _SubmissionFilterTabs extends StatelessWidget {
  const _SubmissionFilterTabs({
    required this.sites,
    required this.selected,
    required this.onChanged,
  });

  final List<Site> sites;
  final SubmittedSchoolsFilter selected;
  final ValueChanged<SubmittedSchoolsFilter> onChanged;

  @override
  Widget build(BuildContext context) {
    int countFor(SubmittedSchoolsFilter filter) {
      return sites.where((site) {
        return switch (filter) {
          SubmittedSchoolsFilter.all => true,
          SubmittedSchoolsFilter.submitted =>
            site.submissionStatus == SubmissionReviewStatus.approved,
          SubmittedSchoolsFilter.pendingVerification =>
            site.submissionStatus == SubmissionReviewStatus.pendingVerification,
          SubmittedSchoolsFilter.needsCorrection =>
            site.submissionStatus == SubmissionReviewStatus.needsCorrection,
        };
      }).length;
    }

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          for (final filter in SubmittedSchoolsFilter.values)
            Padding(
              padding: const EdgeInsets.only(right: 8),
              child: ChoiceChip(
                selected: selected == filter,
                label: Text('${filter.label} (${countFor(filter)})'),
                onSelected: (_) => onChanged(filter),
              ),
            ),
        ],
      ),
    );
  }
}

class SubmittedSchoolCard extends StatelessWidget {
  const SubmittedSchoolCard({
    super.key,
    required this.site,
    required this.onTap,
  });

  final Site site;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final needsCorrection = site.needsCorrection;
    final population = site.populationSummary;

    return Material(
      color: AppColors.elevatedSurface(context),
      borderRadius: BorderRadius.circular(18),
      child: InkWell(
        borderRadius: BorderRadius.circular(18),
        onTap: onTap,
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AppColors.border(context)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(
                  alpha: AppColors.isDark(context) ? 0.18 : 0.025,
                ),
                offset: const Offset(0, 4),
                blurRadius: 12,
              ),
            ],
          ),
          child: IntrinsicHeight(
            child: Row(
              children: [
                if (needsCorrection)
                  Container(
                    width: 5,
                    decoration: const BoxDecoration(
                      color: AppColors.danger,
                      borderRadius: BorderRadius.horizontal(
                        left: Radius.circular(18),
                      ),
                    ),
                  ),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.all(18),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Text(
                                site.name,
                                style: TextStyle(
                                  color: AppColors.primaryText(context),
                                  fontSize: 16,
                                  fontWeight: FontWeight.w900,
                                  height: 1.12,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            SubmissionStatusBadge(
                              status: site.submissionStatus,
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        _IconText(
                          icon: Icons.location_on_outlined,
                          text: '${site.community}, ${site.lga}, ${site.state}',
                        ),
                        if (site.isLive) ...[
                          const SizedBox(height: 16),
                          const VisibilityBanner(),
                        ],
                        if (needsCorrection) ...[
                          const SizedBox(height: 16),
                          CorrectionAlert(
                            message:
                                site.adminNotes ??
                                'Please update and resubmit this record.',
                          ),
                        ],
                        const SizedBox(height: 16),
                        Wrap(
                          spacing: 18,
                          runSpacing: 8,
                          children: [
                            _IconText(
                              icon: Icons.groups_2_outlined,
                              text:
                                  '${population?.totalChildren ?? 0} children',
                            ),
                            _IconText(
                              icon: Icons.calendar_today_outlined,
                              text:
                                  'Submitted ${DateFormat('MMM d, yyyy').format(site.createdAt)}',
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            for (final need in site.needs)
                              NeedChip(label: need.label),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class SubmissionStatusBadge extends StatelessWidget {
  const SubmissionStatusBadge({super.key, required this.status});

  final SubmissionReviewStatus status;

  @override
  Widget build(BuildContext context) {
    final style = switch (status) {
      SubmissionReviewStatus.approved => (
        color: const Color(0xFF0FA36B),
        background: AppColors.isDark(context)
            ? const Color(0xFF123C33)
            : const Color(0xFFEFFFF7),
        icon: Icons.check_circle_outline_rounded,
      ),
      SubmissionReviewStatus.pendingVerification => (
        color: AppColors.amber,
        background: AppColors.warningTint(context),
        icon: Icons.schedule_rounded,
      ),
      SubmissionReviewStatus.needsCorrection => (
        color: AppColors.danger,
        background: AppColors.dangerTint(context),
        icon: Icons.error_outline_rounded,
      ),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: BoxDecoration(
        color: style.background,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(style.icon, color: style.color, size: 14),
          const SizedBox(width: 5),
          Text(
            status.label,
            style: TextStyle(
              color: style.color,
              fontSize: 11,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }
}

class NeedChip extends StatelessWidget {
  const NeedChip({super.key, required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.softFill(context),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: AppColors.secondaryText(context),
          fontSize: 11,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

class VisibilityBanner extends StatelessWidget {
  const VisibilityBanner({super.key});

  @override
  Widget build(BuildContext context) {
    final background = AppColors.isDark(context)
        ? const Color(0xFF123C33)
        : const Color(0xFFEAFBF4);
    final border = AppColors.isDark(context)
        ? const Color(0xFF1E6B59)
        : const Color(0xFFBEEBD9);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: border),
      ),
      child: const Row(
        children: [
          Icon(Icons.visibility_outlined, color: Color(0xFF0FA36B), size: 18),
          SizedBox(width: 10),
          Expanded(
            child: Text(
              'Verified · Live on App · Visible to Helpers',
              style: TextStyle(
                color: Color(0xFF0FA36B),
                fontSize: 12,
                height: 1.15,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class CorrectionAlert extends StatelessWidget {
  const CorrectionAlert({super.key, required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.dangerTint(context),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: AppColors.danger.withValues(
            alpha: AppColors.isDark(context) ? 0.5 : 0.25,
          ),
        ),
      ),
      child: Row(
        children: [
          const Icon(
            Icons.warning_amber_rounded,
            color: AppColors.danger,
            size: 18,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              message,
              style: const TextStyle(
                color: AppColors.danger,
                fontSize: 12,
                height: 1.15,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _IconText extends StatelessWidget {
  const _IconText({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: AppColors.secondaryText(context), size: 16),
        const SizedBox(width: 6),
        Text(
          text,
          style: TextStyle(
            color: AppColors.secondaryText(context),
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}

class _SubmittedEmptyState extends StatelessWidget {
  const _SubmittedEmptyState({required this.filter});

  final SubmittedSchoolsFilter filter;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: AppColors.elevatedSurface(context),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.border(context)),
      ),
      child: Column(
        children: [
          Icon(
            Icons.school_outlined,
            color: AppColors.secondaryText(context),
            size: 38,
          ),
          const SizedBox(height: 10),
          Text(
            'No ${filter.label.toLowerCase()} schools',
            style: Theme.of(context).textTheme.titleMedium,
          ),
        ],
      ),
    );
  }
}
