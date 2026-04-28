import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_theme.dart';
import '../../shared/models/user_access_role.dart';
import '../../shared/widgets/app_logo.dart';

class AccessSelectionScreen extends StatelessWidget {
  const AccessSelectionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.black,
        statusBarIconBrightness: Brightness.light,
        systemNavigationBarColor: AppColors.onboardingGreen,
        systemNavigationBarIconBrightness: Brightness.light,
      ),
      child: Scaffold(
        backgroundColor: AppColors.onboardingGreen,
        body: SafeArea(
          child: LayoutBuilder(
            builder: (context, constraints) {
              final compact = constraints.maxHeight < 720;
              final horizontalPadding = compact ? 20.0 : 24.0;
              final contentWidth =
                  constraints.maxWidth - (horizontalPadding * 2);

              return Padding(
                padding: EdgeInsets.symmetric(
                  horizontal: horizontalPadding,
                  vertical: compact ? 12 : 18,
                ),
                child: Center(
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    child: SizedBox(
                      width: contentWidth.clamp(280.0, 430.0),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          SizedBox(height: compact ? 6 : 12),
                          Container(
                            width: compact ? 74 : 82,
                            height: compact ? 74 : 82,
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(22),
                              border: Border.all(
                                color: Colors.white.withValues(alpha: 0.28),
                                width: 2,
                              ),
                            ),
                            child: AppLogo(size: compact ? 50 : 56),
                          ),
                          SizedBox(height: compact ? 18 : 22),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 15,
                              vertical: 8,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: const Text(
                              'UNICEF Partner Program',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 13,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 0.2,
                              ),
                            ),
                          ),
                          SizedBox(height: compact ? 20 : 24),
                          Text(
                            'Almajiri Mapping\n& Support Platform',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: compact ? 27 : 30,
                              height: 1.15,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                          SizedBox(height: compact ? 14 : 17),
                          Text(
                            'Map schools, document welfare,\nand submit field records',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: AppColors.mutedOnGreen,
                              fontSize: compact ? 15 : 16,
                              height: 1.35,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          SizedBox(height: compact ? 34 : 48),
                          Text(
                            'Continue with volunteer access',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: AppColors.mutedOnGreen,
                              fontSize: compact ? 15 : 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          SizedBox(height: compact ? 18 : 22),
                          AccessOptionCard(
                            title: 'Access as Volunteer',
                            subtitle:
                                'Map schools, document\nwelfare, submit records',
                            icon: Icons.edit_outlined,
                            role: UserAccessRole.volunteer,
                            onTap: () => context.go('/login/volunteer'),
                          ),
                          SizedBox(height: compact ? 20 : 24),
                          Text(
                            'v2.1.0 · Field Edition · All data is end-to-end encrypted',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: Color(0x8AE8FFFA),
                              fontSize: compact ? 11 : 12,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}

class AccessOptionCard extends StatelessWidget {
  const AccessOptionCard({
    super.key,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.role,
    required this.onTap,
  });

  final String title;
  final String subtitle;
  final IconData icon;
  final UserAccessRole role;
  final VoidCallback onTap;

  bool get _isVolunteer => role == UserAccessRole.volunteer;

  @override
  Widget build(BuildContext context) {
    final foreground = _isVolunteer ? AppColors.onboardingGreen : Colors.white;
    final subtitleColor = _isVolunteer
        ? AppColors.muted
        : Colors.white.withValues(alpha: 0.84);

    return Material(
      color: _isVolunteer ? Colors.white : AppColors.onboardingCardGreen,
      borderRadius: BorderRadius.circular(24),
      child: InkWell(
        borderRadius: BorderRadius.circular(24),
        onTap: onTap,
        child: Container(
          constraints: const BoxConstraints(minHeight: 92),
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 15),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(24),
            border: Border.all(
              color: _isVolunteer
                  ? Colors.transparent
                  : Colors.white.withValues(alpha: 0.35),
              width: 2,
            ),
            boxShadow: _isVolunteer
                ? [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.14),
                      offset: const Offset(0, 10),
                      blurRadius: 18,
                    ),
                  ]
                : null,
          ),
          child: Row(
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: _isVolunteer
                      ? AppColors.onboardingGreen.withValues(alpha: 0.10)
                      : Colors.white.withValues(alpha: 0.22),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(icon, color: foreground, size: 28),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    FittedBox(
                      fit: BoxFit.scaleDown,
                      alignment: Alignment.centerLeft,
                      child: Text(
                        title,
                        maxLines: 1,
                        style: TextStyle(
                          color: foreground,
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                          height: 1.15,
                        ),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      subtitle,
                      style: TextStyle(
                        color: subtitleColor,
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        height: 1.18,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 10),
              Icon(Icons.chevron_right_rounded, color: foreground, size: 30),
            ],
          ),
        ),
      ),
    );
  }
}
