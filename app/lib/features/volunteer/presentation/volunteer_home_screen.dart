import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/utils/responsive.dart';
import '../../../shared/models/app_enums.dart';
import '../../auth/presentation/auth_controller.dart';
import '../../sites/data/sites_repository.dart';
import 'volunteer_reward_widgets.dart';

class VolunteerHomeScreen extends ConsumerWidget {
  const VolunteerHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final session = ref.watch(authControllerProvider).valueOrNull?.session;
    final userId = session?.user.id ?? 'field-001';
    final submittedSites = ref.watch(submittedSitesProvider(userId));
    final sites = submittedSites.valueOrNull ?? const [];
    final totalCount = sites.length;
    final approvedCount = sites
        .where(
          (site) => site.submissionStatus == SubmissionReviewStatus.approved,
        )
        .length;
    final pendingCount = sites
        .where(
          (site) =>
              site.submissionStatus ==
              SubmissionReviewStatus.pendingVerification,
        )
        .length;
    final userName = (session?.user.name.trim().isNotEmpty ?? false)
        ? session!.user.name
        : 'Ibrahim Sule';
    final location = [
      session?.user.lga,
      session?.user.state,
    ].where((item) => item != null && item.trim().isNotEmpty).join(' · ');

    return VolunteerMainBackScope(
      currentPath: '/volunteer/home',
      child: Scaffold(
        backgroundColor: AppColors.screen(context),
        body: SafeArea(
          bottom: false,
          child: Center(
            child: ConstrainedBox(
              constraints: BoxConstraints(
                maxWidth: Responsive.pageMaxWidth(context),
              ),
              child: ListView(
                padding: const EdgeInsets.fromLTRB(14, 12, 14, 14),
                children: [
                  VolunteerHeaderCard(
                    userName: userName,
                    location: location.isEmpty
                        ? 'Location not provided'
                        : location,
                    approvedCount: approvedCount,
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: VolunteerStatCard(
                          value: submittedSites.isLoading
                              ? '...'
                              : '$totalCount',
                          label: 'Total',
                          color: AppColors.onboardingGreen,
                        ),
                      ),
                      SizedBox(width: 9),
                      Expanded(
                        child: VolunteerStatCard(
                          value: submittedSites.isLoading
                              ? '...'
                              : '$approvedCount',
                          label: 'Approved',
                          color: const Color(0xFF18A66D),
                        ),
                      ),
                      SizedBox(width: 9),
                      Expanded(
                        child: VolunteerStatCard(
                          value: submittedSites.isLoading
                              ? '...'
                              : '$pendingCount',
                          label: 'Pending',
                          color: AppColors.orange,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  Text(
                    'Quick Actions',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 10),
                  GridView.count(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisCount: 2,
                    mainAxisSpacing: 9,
                    crossAxisSpacing: 9,
                    childAspectRatio: 1.45,
                    children: [
                      QuickActionCard(
                        title: 'Add New\nSchool',
                        icon: Icons.add_circle_outline_rounded,
                        iconColor: AppColors.onboardingGreen,
                        iconBackground: AppColors.onboardingGreen.withValues(
                          alpha: 0.10,
                        ),
                        onTap: () => context.go('/sites/new'),
                      ),
                      QuickActionCard(
                        title: 'My\nSchools',
                        icon: Icons.map_outlined,
                        iconColor: AppColors.onboardingGreen,
                        iconBackground: AppColors.onboardingGreen.withValues(
                          alpha: 0.10,
                        ),
                        onTap: () => context.go('/volunteer/submitted-schools'),
                      ),
                      QuickActionCard(
                        title: 'Draft\nRecords',
                        icon: Icons.edit_outlined,
                        iconColor: const Color(0xFF1586C7),
                        iconBackground: const Color(0xFFEAF6FF),
                        onTap: () => context.go('/volunteer/drafts'),
                      ),
                      QuickActionCard(
                        title: 'Notifications',
                        icon: Icons.notifications_none_rounded,
                        iconColor: const Color(0xFFC47A05),
                        iconBackground: const Color(0xFFFFF4D8),
                        onTap: () => context.go('/volunteer/notifications'),
                      ),
                      QuickActionCard(
                        title: 'My\nProfile',
                        icon: Icons.person_outline_rounded,
                        iconColor: const Color(0xFF7C3EC8),
                        iconBackground: const Color(0xFFF3ECFF),
                        onTap: () => context.go('/volunteer/profile'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
        bottomNavigationBar: const VolunteerBottomNavigation(currentIndex: 0),
      ),
    );
  }
}

class VolunteerMainBackScope extends StatelessWidget {
  const VolunteerMainBackScope({
    super.key,
    required this.currentPath,
    required this.child,
  });

  final String currentPath;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (didPop || currentPath == '/volunteer/home') return;
        context.go('/volunteer/home');
      },
      child: child,
    );
  }
}

class VolunteerHeaderCard extends StatelessWidget {
  const VolunteerHeaderCard({
    super.key,
    required this.userName,
    required this.location,
    required this.approvedCount,
  });

  final String userName;
  final String location;
  final int approvedCount;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppColors.onboardingGreen, AppColors.onboardingCardGreen],
        ),
        borderRadius: BorderRadius.circular(22),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 7,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.edit_outlined,
                            color: Colors.white,
                            size: 15,
                          ),
                          SizedBox(width: 7),
                          Text(
                            'Volunteer',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 14,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Welcome back,',
                      style: TextStyle(
                        color: AppColors.mutedOnGreen,
                        fontSize: 17,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 5),
                    FittedBox(
                      fit: BoxFit.scaleDown,
                      alignment: Alignment.centerLeft,
                      child: Text(
                        userName,
                        maxLines: 1,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 26,
                          fontWeight: FontWeight.w900,
                          height: 1.1,
                        ),
                      ),
                    ),
                    const SizedBox(height: 9),
                    Text(
                      'Field Volunteer · $location',
                      style: const TextStyle(
                        color: AppColors.mutedOnGreen,
                        fontSize: 15,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 10),
              _VolunteerAvatar(name: userName),
            ],
          ),
          const SizedBox(height: 14),
          VolunteerRewardBadge(
            approvedCount: approvedCount,
            onDarkBackground: true,
          ),
        ],
      ),
    );
  }
}

class _VolunteerAvatar extends StatelessWidget {
  const _VolunteerAvatar({required this.name});

  final String name;

  @override
  Widget build(BuildContext context) {
    final parts = name.trim().split(RegExp(r'\s+'));
    final initials = parts.length >= 2
        ? '${parts.first[0]}${parts.last[0]}'
        : name.trim().characters.take(2).toString();

    return Container(
      width: 52,
      height: 52,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.35),
          width: 3,
        ),
      ),
      child: Text(
        initials.toUpperCase(),
        style: const TextStyle(
          color: Colors.white,
          fontSize: 18,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}

class VolunteerStatCard extends StatelessWidget {
  const VolunteerStatCard({
    super.key,
    required this.value,
    required this.label,
    required this.color,
  });

  final String value;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 78,
      decoration: BoxDecoration(
        color: AppColors.elevatedSurface(context),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border(context)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            offset: const Offset(0, 4),
            blurRadius: 12,
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            value,
            style: TextStyle(
              color: color,
              fontSize: 25,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 5),
          Text(
            label,
            style: TextStyle(
              color: AppColors.secondaryText(context),
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class QuickActionCard extends StatelessWidget {
  const QuickActionCard({
    super.key,
    required this.title,
    required this.icon,
    required this.iconColor,
    required this.iconBackground,
    required this.onTap,
  });

  final String title;
  final IconData icon;
  final Color iconColor;
  final Color iconBackground;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.elevatedSurface(context),
      borderRadius: BorderRadius.circular(18),
      child: InkWell(
        borderRadius: BorderRadius.circular(18),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(11),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AppColors.border(context)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: iconBackground,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: iconColor, size: 23),
              ),
              const SizedBox(height: 10),
              FittedBox(
                fit: BoxFit.scaleDown,
                alignment: Alignment.centerLeft,
                child: Text(
                  title,
                  style: TextStyle(
                    color: AppColors.primaryText(context),
                    fontSize: 14,
                    height: 1.08,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class VolunteerBottomNavigation extends StatelessWidget {
  const VolunteerBottomNavigation({super.key, required this.currentIndex});

  final int currentIndex;

  @override
  Widget build(BuildContext context) {
    final items = [
      _VolunteerNavItem('Home', Icons.home_outlined, '/volunteer/home'),
      _VolunteerNavItem(
        'My Schools',
        Icons.map_outlined,
        '/volunteer/submitted-schools',
      ),
      _VolunteerNavItem(
        'Notifications',
        Icons.notifications_none_rounded,
        '/volunteer/notifications',
      ),
      _VolunteerNavItem(
        'Profile',
        Icons.person_outline_rounded,
        '/volunteer/profile',
      ),
    ];

    const radius = Radius.circular(26);
    return DecoratedBox(
      decoration: BoxDecoration(
        color: AppColors.elevatedSurface(context),
        borderRadius: const BorderRadius.vertical(top: radius),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(
              alpha: AppColors.isDark(context) ? 0.24 : 0.08,
            ),
            offset: const Offset(0, -4),
            blurRadius: 18,
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: const BorderRadius.vertical(top: radius),
        child: NavigationBar(
          selectedIndex: currentIndex,
          height: 68,
          backgroundColor: AppColors.elevatedSurface(context),
          indicatorColor: AppColors.onboardingGreen.withValues(alpha: 0.18),
          onDestinationSelected: (index) {
            if (index != currentIndex) context.go(items[index].path);
          },
          destinations: [
            for (final item in items)
              NavigationDestination(
                icon: Icon(item.icon),
                selectedIcon: Icon(item.icon, color: AppColors.onboardingGreen),
                label: item.label,
              ),
          ],
        ),
      ),
    );
  }
}

class _VolunteerNavItem {
  const _VolunteerNavItem(this.label, this.icon, this.path);

  final String label;
  final IconData icon;
  final String path;
}
