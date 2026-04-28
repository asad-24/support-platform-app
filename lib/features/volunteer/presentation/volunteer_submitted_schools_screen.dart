import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/utils/responsive.dart';
import '../data/submitted_school.dart';
import 'volunteer_home_screen.dart';

class VolunteerSubmittedSchoolsScreen extends StatelessWidget {
  const VolunteerSubmittedSchoolsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final approvedCount = mockSubmittedSchools
        .where((school) => school.isLive)
        .length;

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
                  'My Submitted Schools',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '${mockSubmittedSchools.length} submissions · $approvedCount approved & live',
                  style: const TextStyle(
                    color: AppColors.muted,
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 26),
                for (final school in mockSubmittedSchools) ...[
                  SubmittedSchoolCard(
                    school: school,
                    onTap: () =>
                        context.go('/volunteer/submitted-schools/${school.id}'),
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
            ),
          ),
        ),
      ),
      bottomNavigationBar: const VolunteerBottomNavigation(currentIndex: 1),
    );
  }
}

class SubmittedSchoolCard extends StatelessWidget {
  const SubmittedSchoolCard({
    super.key,
    required this.school,
    required this.onTap,
  });

  final SubmittedSchool school;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final needsCorrection =
        school.status == SubmittedSchoolStatus.needsCorrection;

    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(18),
      child: InkWell(
        borderRadius: BorderRadius.circular(18),
        onTap: onTap,
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AppColors.line),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.025),
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
                                school.name,
                                style: const TextStyle(
                                  color: AppColors.ink,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w900,
                                  height: 1.12,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            StatusBadge(status: school.status),
                          ],
                        ),
                        const SizedBox(height: 10),
                        _IconText(
                          icon: Icons.location_on_outlined,
                          text: school.location,
                        ),
                        if (school.isLive) ...[
                          const SizedBox(height: 16),
                          const VisibilityBanner(),
                        ],
                        if (needsCorrection &&
                            school.correctionMessage != null) ...[
                          const SizedBox(height: 16),
                          CorrectionAlert(message: school.correctionMessage!),
                        ],
                        const SizedBox(height: 16),
                        Wrap(
                          spacing: 18,
                          runSpacing: 8,
                          children: [
                            _IconText(
                              icon: Icons.groups_2_outlined,
                              text: '${school.childrenCount} children',
                            ),
                            _IconText(
                              icon: Icons.calendar_today_outlined,
                              text:
                                  'Submitted ${DateFormat('MMM d, yyyy').format(school.submittedDate)}',
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
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
    );
  }
}

class StatusBadge extends StatelessWidget {
  const StatusBadge({super.key, required this.status});

  final SubmittedSchoolStatus status;

  @override
  Widget build(BuildContext context) {
    final style = switch (status) {
      SubmittedSchoolStatus.approved => (
        color: const Color(0xFF0FA36B),
        background: const Color(0xFFEFFFF7),
        icon: Icons.check_circle_outline_rounded,
      ),
      SubmittedSchoolStatus.pendingVerification => (
        color: AppColors.amber,
        background: const Color(0xFFFFF8E8),
        icon: Icons.schedule_rounded,
      ),
      SubmittedSchoolStatus.needsCorrection => (
        color: AppColors.danger,
        background: const Color(0xFFFFF1F2),
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
        color: const Color(0xFFF1F4F8),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: const TextStyle(
          color: AppColors.muted,
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
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFFEAFBF4),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFBEEBD9)),
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
        color: const Color(0xFFFFF6F6),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFF8C9C9)),
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
        Icon(icon, color: AppColors.muted, size: 16),
        const SizedBox(width: 6),
        Text(
          text,
          style: const TextStyle(
            color: AppColors.muted,
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}
