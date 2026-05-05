import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/utils/responsive.dart';
import 'volunteer_home_screen.dart';

class VolunteerHelpSupportScreen extends StatelessWidget {
  const VolunteerHelpSupportScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return VolunteerMainBackScope(
      currentPath: '/volunteer/help',
      child: Scaffold(
        appBar: AppBar(title: const Text('Help & Support')),
        backgroundColor: AppColors.screen(context),
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
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          AppColors.onboardingGreen,
                          AppColors.onboardingCardGreen,
                        ],
                      ),
                      borderRadius: BorderRadius.circular(22),
                    ),
                    child: const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(
                          Icons.support_agent_rounded,
                          color: Colors.white,
                          size: 32,
                        ),
                        SizedBox(height: 14),
                        Text(
                          'Field Volunteer Support',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        SizedBox(height: 8),
                        Text(
                          'Get help with school submissions, admin review updates, corrections, and profile details.',
                          style: TextStyle(
                            color: AppColors.mutedOnGreen,
                            height: 1.3,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),
                  const _HelpCard(
                    icon: Icons.add_location_alt_outlined,
                    title: 'Submitting a school',
                    body:
                        'Use Add New School from Home, complete each step, review the details, and submit. New records appear as Pending Verification until admin review is complete.',
                  ),
                  const _HelpCard(
                    icon: Icons.schedule_outlined,
                    title: 'Pending verification',
                    body:
                        'Pending Verification means the record was submitted successfully and is waiting for an admin decision.',
                  ),
                  const _HelpCard(
                    icon: Icons.error_outline_rounded,
                    title: 'Needs correction',
                    body:
                        'Open the record from My Schools or Notifications, review the admin note, then use Edit & Resubmit to update only the requested details.',
                  ),
                  const _HelpCard(
                    icon: Icons.verified_outlined,
                    title: 'Approved records',
                    body:
                        'Approved records are live and visible to Helpers. You will also see an approval notification after admin review.',
                  ),
                  const _HelpCard(
                    icon: Icons.person_outline_rounded,
                    title: 'Profile changes',
                    body:
                        'Use Edit Profile from the Profile tab to update your name, phone, address, or profile picture.',
                  ),
                  const SizedBox(height: 6),
                  const _SupportEmailCard(),
                ],
              ),
            ),
          ),
        ),
        bottomNavigationBar: const VolunteerBottomNavigation(currentIndex: 3),
      ),
    );
  }
}

class _HelpCard extends StatelessWidget {
  const _HelpCard({
    required this.icon,
    required this.title,
    required this.body,
  });

  final IconData icon;
  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.elevatedSurface(context),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.border(context)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppColors.greenTint(context),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(icon, color: AppColors.onboardingGreen, size: 23),
          ),
          const SizedBox(width: 13),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    color: AppColors.primaryText(context),
                    fontSize: 15,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 7),
                Text(
                  body,
                  style: TextStyle(
                    color: AppColors.secondaryText(context),
                    fontSize: 12,
                    height: 1.35,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SupportEmailCard extends StatelessWidget {
  const _SupportEmailCard();

  static const _supportEmail = 'info@example.com';

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.elevatedSurface(context),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.border(context)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Contact support',
            style: TextStyle(
              color: AppColors.primaryText(context),
              fontSize: 15,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'For help with your account, school submissions, or review updates, email the support team.',
            style: TextStyle(
              color: AppColors.secondaryText(context),
              fontSize: 12,
              height: 1.35,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: AppColors.greenTint(context),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border(context)),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.mail_outline_rounded,
                  color: AppColors.onboardingGreen,
                ),
                const SizedBox(width: 10),
                const Expanded(
                  child: SelectableText(
                    _supportEmail,
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900),
                  ),
                ),
                IconButton(
                  tooltip: 'Copy email',
                  onPressed: () async {
                    await Clipboard.setData(
                      const ClipboardData(text: _supportEmail),
                    );
                    if (!context.mounted) return;
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Support email copied.')),
                    );
                  },
                  icon: const Icon(Icons.copy_rounded),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
