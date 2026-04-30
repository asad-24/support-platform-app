import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/utils/responsive.dart';
import '../../auth/presentation/auth_controller.dart';
import 'volunteer_home_screen.dart';

class VolunteerProfileScreen extends ConsumerWidget {
  const VolunteerProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider).valueOrNull?.session?.user;
    final name = (user?.name.trim().isNotEmpty ?? false)
        ? user!.name
        : 'Ibrahim Sule';
    final email = (user?.email.trim().isNotEmpty ?? false)
        ? user!.email
        : 'ibrahim.sule@volunteer.org';
    final phone = user?.phone ?? 'Not provided';
    final username = user?.username == null ? '' : '@${user!.username}';
    final location = [
      user?.lga,
      user?.state,
    ].where((item) => item != null && item.trim().isNotEmpty).join(' · ');

    return VolunteerMainBackScope(
      currentPath: '/volunteer/profile',
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
                padding: const EdgeInsets.fromLTRB(18, 24, 18, 18),
                children: [
                  VolunteerProfileHeaderCard(
                    name: name,
                    email: email,
                    username: username,
                    phone: phone,
                    role: 'Field Volunteer',
                    location: location.isEmpty
                        ? 'Location not provided'
                        : location,
                    imagePath: user?.profileImagePath,
                    onEditProfile: () => context.go('/volunteer/profile/edit'),
                  ),
                  const SizedBox(height: 18),
                  const ProfileMenuCard(),
                  const SizedBox(height: 18),
                  const SignOutButton(),
                  const SizedBox(height: 12),
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

class VolunteerProfileHeaderCard extends StatelessWidget {
  const VolunteerProfileHeaderCard({
    super.key,
    required this.name,
    required this.email,
    required this.username,
    required this.phone,
    required this.role,
    required this.location,
    required this.onEditProfile,
    this.imagePath,
  });

  final String name;
  final String email;
  final String username;
  final String phone;
  final String role;
  final String location;
  final VoidCallback onEditProfile;
  final String? imagePath;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(18, 28, 18, 24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppColors.onboardingGreen, AppColors.onboardingCardGreen],
        ),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        children: [
          _ProfileAvatar(
            initials: _initials(name),
            imagePath: imagePath,
            onTap: onEditProfile,
          ),
          const SizedBox(height: 18),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              name,
              maxLines: 1,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 26,
                fontWeight: FontWeight.w900,
                height: 1.1,
              ),
            ),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 9),
            decoration: BoxDecoration(
              color: AppColors.onboardingCardGreen,
              borderRadius: BorderRadius.circular(999),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.edit_outlined, color: Colors.white, size: 15),
                const SizedBox(width: 7),
                Text(
                  role,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          Text(
            location,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: AppColors.mutedOnGreen,
              fontSize: 15,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            [
              username,
              email,
              phone,
            ].where((item) => item.trim().isNotEmpty).join(' · '),
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: AppColors.mutedOnGreen,
              fontSize: 13,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 28),
          const _ProfileStat(value: '2025', label: 'Active Since'),
          const SizedBox(height: 2),
          Text(
            'Volunteer account',
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.78),
              fontSize: 12,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  static String _initials(String name) {
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.length >= 2) return '${parts.first[0]}${parts.last[0]}';
    return name.trim().characters.take(2).toString();
  }
}

class ProfileMenuCard extends StatelessWidget {
  const ProfileMenuCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.elevatedSurface(context),
        borderRadius: BorderRadius.circular(18),
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
        children: [
          ProfileMenuTile(
            icon: Icons.person_rounded,
            label: 'Edit Profile',
            onTap: () => context.go('/volunteer/profile/edit'),
          ),
          ProfileMenuTile(
            icon: Icons.settings_outlined,
            label: 'Settings',
            onTap: () => context.go('/volunteer/settings'),
          ),
          ProfileMenuTile(
            icon: Icons.help_outline_rounded,
            label: 'Help & Support',
            showDivider: false,
            onTap: () => context.go('/volunteer/help'),
          ),
        ],
      ),
    );
  }
}

class ProfileMenuTile extends StatelessWidget {
  const ProfileMenuTile({
    super.key,
    required this.icon,
    required this.label,
    required this.onTap,
    this.showDivider = true,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final bool showDivider;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.only(left: 18),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: AppColors.softFill(context),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: AppColors.onboardingGreen, size: 24),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.fromLTRB(0, 21, 18, 21),
                  decoration: BoxDecoration(
                    border: showDivider
                        ? Border(
                            bottom: BorderSide(
                              color: AppColors.border(context),
                            ),
                          )
                        : null,
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(
                          label,
                          style: TextStyle(
                            color: AppColors.primaryText(context),
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                      Icon(
                        Icons.chevron_right_rounded,
                        color: AppColors.secondaryText(context),
                        size: 24,
                      ),
                    ],
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

class SignOutButton extends ConsumerWidget {
  const SignOutButton({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return OutlinedButton.icon(
      onPressed: () => _confirmSignOut(context, ref),
      icon: const Icon(Icons.logout_rounded, size: 22),
      label: const Text('Sign Out'),
      style: OutlinedButton.styleFrom(
        backgroundColor: AppColors.dangerTint(context),
        foregroundColor: AppColors.danger,
        side: BorderSide(color: AppColors.danger.withValues(alpha: 0.25)),
        minimumSize: const Size.fromHeight(56),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900),
      ),
    );
  }

  Future<void> _confirmSignOut(BuildContext context, WidgetRef ref) async {
    final signOut = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Sign out?'),
        content: const Text('You will need to sign in again to continue.'),
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
            child: const Text('Sign Out'),
          ),
        ],
      ),
    );
    if (signOut != true || !context.mounted) return;
    await ref.read(authControllerProvider.notifier).logout();
    if (context.mounted) context.go('/login/volunteer');
  }
}

class _ProfileAvatar extends StatelessWidget {
  const _ProfileAvatar({
    required this.initials,
    required this.onTap,
    this.imagePath,
  });

  final String initials;
  final VoidCallback onTap;
  final String? imagePath;

  @override
  Widget build(BuildContext context) {
    final hasImage = imagePath != null && imagePath!.isNotEmpty;

    return InkWell(
      customBorder: const CircleBorder(),
      onTap: onTap,
      child: SizedBox(
        width: 96,
        height: 96,
        child: Stack(
          children: [
            Positioned.fill(
              child: Container(
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: AppColors.onboardingCardGreen,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: Colors.white.withValues(alpha: 0.35),
                    width: 4,
                  ),
                ),
                clipBehavior: Clip.antiAlias,
                child: hasImage
                    ? FutureBuilder<Uint8List>(
                        future: XFile(imagePath!).readAsBytes(),
                        builder: (context, snapshot) {
                          if (snapshot.hasData) {
                            return Image.memory(
                              snapshot.data!,
                              width: 96,
                              height: 96,
                              fit: BoxFit.cover,
                            );
                          }
                          return const CircularProgressIndicator(
                            color: Colors.white,
                          );
                        },
                      )
                    : Text(
                        initials.toUpperCase(),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 26,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
              ),
            ),
            Positioned(
              right: 2,
              bottom: 4,
              child: Container(
                width: 30,
                height: 30,
                decoration: BoxDecoration(
                  color: AppColors.deepGreen,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 3),
                ),
                child: const Icon(
                  Icons.edit_rounded,
                  color: Colors.white,
                  size: 15,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProfileStat extends StatelessWidget {
  const _ProfileStat({required this.value, required this.label});

  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        FittedBox(
          fit: BoxFit.scaleDown,
          child: Text(
            value,
            maxLines: 1,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 25,
              fontWeight: FontWeight.w900,
            ),
          ),
        ),
        const SizedBox(height: 7),
        Text(
          label,
          textAlign: TextAlign.center,
          style: const TextStyle(
            color: AppColors.mutedOnGreen,
            fontSize: 12,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}
