import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/utils/responsive.dart';
import '../data/submitted_school.dart';
import 'volunteer_home_screen.dart';
import 'volunteer_submitted_schools_screen.dart';

class SchoolSubmissionDetailScreen extends StatelessWidget {
  const SchoolSubmissionDetailScreen({super.key, required this.school});

  final SubmittedSchool school;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.dashboardBackground,
      appBar: AppBar(title: const Text('Submission Details')),
      body: SafeArea(
        bottom: false,
        child: Center(
          child: ConstrainedBox(
            constraints: BoxConstraints(
              maxWidth: Responsive.pageMaxWidth(context),
            ),
            child: ListView(
              padding: const EdgeInsets.all(18),
              children: [
                SubmittedSchoolCard(school: school, onTap: () {}),
                const SizedBox(height: 16),
                _StatePanel(school: school),
                const SizedBox(height: 16),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(18),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Submission Summary',
                          style: Theme.of(context).textTheme.titleMedium
                              ?.copyWith(fontWeight: FontWeight.w800),
                        ),
                        const SizedBox(height: 14),
                        _DetailRow(
                          'Children',
                          '${school.childrenCount} children',
                        ),
                        _DetailRow(
                          'Submitted',
                          DateFormat(
                            'MMM d, yyyy',
                          ).format(school.submittedDate),
                        ),
                        _DetailRow('Location', school.location),
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            for (final need in school.needs)
                              NeedChip(label: need),
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
      bottomNavigationBar: const VolunteerBottomNavigation(currentIndex: 1),
    );
  }
}

class _StatePanel extends StatelessWidget {
  const _StatePanel({required this.school});

  final SubmittedSchool school;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (school.status == SubmittedSchoolStatus.approved) ...[
              const VisibilityBanner(),
              const SizedBox(height: 12),
              const Text(
                'This school has been verified and is visible to Helpers in the support app.',
                style: TextStyle(color: AppColors.muted, fontSize: 12),
              ),
            ] else if (school.status ==
                SubmittedSchoolStatus.pendingVerification) ...[
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF8E8),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFFFDE3A2)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.schedule_rounded, color: AppColors.amber),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Pending review — admin verification is still in progress.',
                        style: TextStyle(
                          color: AppColors.amber,
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ] else ...[
              CorrectionAlert(
                message:
                    school.correctionMessage ??
                    'Please update and resubmit this record.',
              ),
              const SizedBox(height: 14),
              ElevatedButton.icon(
                onPressed: () => context.go('/sites/new'),
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
            width: 96,
            child: Text(
              label,
              style: const TextStyle(
                color: AppColors.muted,
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
