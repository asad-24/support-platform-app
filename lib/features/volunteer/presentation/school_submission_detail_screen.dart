import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/utils/responsive.dart';
import '../../../features/sites/data/sites_repository.dart';
import '../../../shared/models/app_enums.dart';
import '../../../shared/models/site.dart';
import 'volunteer_home_screen.dart';
import 'volunteer_submitted_schools_screen.dart';

class SchoolSubmissionDetailScreen extends ConsumerWidget {
  const SchoolSubmissionDetailScreen({super.key, required this.siteId});

  final String siteId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sites = ref.watch(sitesProvider);

    return Scaffold(
      backgroundColor: AppColors.screen(context),
      appBar: AppBar(title: const Text('Submission Details')),
      body: SafeArea(
        bottom: false,
        child: Center(
          child: ConstrainedBox(
            constraints: BoxConstraints(
              maxWidth: Responsive.pageMaxWidth(context),
            ),
            child: sites.when(
              data: (items) {
                final site = items.firstWhere((item) => item.id == siteId);
                return _DetailBody(site: site);
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (error, _) => Center(child: Text(error.toString())),
            ),
          ),
        ),
      ),
      bottomNavigationBar: const VolunteerBottomNavigation(currentIndex: 1),
    );
  }
}

class _DetailBody extends StatelessWidget {
  const _DetailBody({required this.site});

  final Site site;

  @override
  Widget build(BuildContext context) {
    final population = site.populationSummary;
    final welfare = site.welfareAssessment;

    return ListView(
      padding: const EdgeInsets.all(18),
      children: [
        SubmittedSchoolCard(site: site, onTap: () {}),
        const SizedBox(height: 16),
        _StatePanel(site: site),
        const SizedBox(height: 16),
        _SectionCard(
          title: 'School Details',
          children: [
            _DetailRow('School', site.name),
            _DetailRow('Type', site.type),
            _DetailRow('Operator', site.operatorName),
            _DetailRow('Phone', site.phone),
            _DetailRow(
              'Location',
              '${site.community}, ${site.lga}, ${site.state}',
            ),
            _DetailRow('Ward', site.ward),
            _DetailRow('Landmark', site.landmark ?? 'Not provided'),
            _DetailRow(
              'Submitted',
              DateFormat('MMM d, yyyy').format(site.createdAt),
            ),
          ],
        ),
        const SizedBox(height: 16),
        _SectionCard(
          title: 'Students',
          children: [
            _DetailRow('Total', '${population?.totalChildren ?? 0} children'),
            _DetailRow('Resident', '${population?.residentChildren ?? 0}'),
            _DetailRow(
              'Non-resident',
              '${population?.nonResidentChildren ?? 0}',
            ),
            _DetailRow('Boys', '${population?.boys ?? 0}'),
            _DetailRow('Girls', '${population?.girls ?? 0}'),
            _DetailRow(
              'Age groups',
              population?.ageGroups.isNotEmpty == true
                  ? population!.ageGroups.join(', ')
                  : 'Not specified',
            ),
          ],
        ),
        const SizedBox(height: 16),
        _SectionCard(
          title: 'Welfare',
          children: [
            _DetailRow('Feeding', welfare?.feedingStatus ?? 'Unknown'),
            _DetailRow('Shelter', welfare?.shelterStatus ?? 'Unknown'),
            _DetailRow('Sanitation', welfare?.sanitationStatus ?? 'Unknown'),
            _DetailRow('Water', welfare?.waterAccess ?? 'Unknown'),
            _DetailRow('Health access', welfare?.healthAccess ?? 'Unknown'),
            _DetailRow('Clothing', welfare?.clothingStatus ?? 'Unknown'),
            _DetailRow('Notes', welfare?.notes ?? 'Not provided'),
          ],
        ),
        const SizedBox(height: 16),
        _SectionCard(
          title: 'Needs',
          children: [
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final need in site.needs) NeedChip(label: need.label),
              ],
            ),
          ],
        ),
      ],
    );
  }
}

class _StatePanel extends StatelessWidget {
  const _StatePanel({required this.site});

  final Site site;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            SubmissionStatusBadge(status: site.submissionStatus),
            const SizedBox(height: 12),
            if (site.submissionStatus == SubmissionReviewStatus.approved) ...[
              const VisibilityBanner(),
              const SizedBox(height: 12),
              Text(
                'This school has been verified and is visible to Helpers in the support app.',
                style: TextStyle(
                  color: AppColors.secondaryText(context),
                  fontSize: 12,
                ),
              ),
            ] else if (site.submissionStatus ==
                SubmissionReviewStatus.pendingVerification) ...[
              _InfoBanner(
                color: AppColors.amber,
                background: AppColors.warningTint(context),
                icon: Icons.schedule_rounded,
                message:
                    'Pending review. Admin verification is still in progress.',
              ),
            ] else ...[
              CorrectionAlert(
                message:
                    site.adminNotes ??
                    'Please update and resubmit this record.',
              ),
              if (site.correctionIssues.isNotEmpty) ...[
                const SizedBox(height: 12),
                for (final issue in site.correctionIssues) ...[
                  _CorrectionIssueTile(issue: issue),
                  const SizedBox(height: 8),
                ],
              ],
              const SizedBox(height: 14),
              ElevatedButton.icon(
                onPressed: () =>
                    context.go('/sites/${site.id}/edit?correctionOnly=true'),
                icon: const Icon(Icons.edit_outlined),
                label: const Text('Edit & Resubmit'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  const _SectionCard({required this.title, required this.children});

  final String title;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: Theme.of(
                context,
              ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 14),
            ...children,
          ],
        ),
      ),
    );
  }
}

class _InfoBanner extends StatelessWidget {
  const _InfoBanner({
    required this.color,
    required this.background,
    required this.icon,
    required this.message,
  });

  final Color color;
  final Color background;
  final IconData icon;
  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withValues(alpha: 0.38)),
      ),
      child: Row(
        children: [
          Icon(icon, color: color),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              message,
              style: TextStyle(
                color: color,
                fontSize: 12,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _CorrectionIssueTile extends StatelessWidget {
  const _CorrectionIssueTile({required this.issue});

  final CorrectionIssue issue;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.softFill(context),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.border(context)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.report_problem_outlined, color: AppColors.danger),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              issue.message,
              style: TextStyle(
                color: AppColors.primaryText(context),
                fontSize: 12,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  const _DetailRow(this.label, this.value);

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 106,
            child: Text(
              label,
              style: TextStyle(
                color: AppColors.secondaryText(context),
                fontSize: 12,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
          Expanded(child: Text(value, style: const TextStyle(fontSize: 12))),
        ],
      ),
    );
  }
}
