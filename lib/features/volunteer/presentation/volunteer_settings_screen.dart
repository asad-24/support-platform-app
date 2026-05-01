import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/theme/theme_controller.dart';
import '../../../core/utils/responsive.dart';
import '../../auth/auth_validators.dart';
import '../../auth/presentation/auth_controller.dart';
import 'volunteer_home_screen.dart';

class VolunteerSettingsScreen extends ConsumerWidget {
  const VolunteerSettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeModeProvider);
    final darkMode = themeMode == ThemeMode.dark;

    return VolunteerMainBackScope(
      currentPath: '/volunteer/profile',
      child: Scaffold(
        appBar: AppBar(title: const Text('Settings')),
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
                      color: Theme.of(context).colorScheme.surface,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: Theme.of(
                          context,
                        ).dividerColor.withValues(alpha: 0.24),
                      ),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: AppColors.onboardingGreen.withValues(
                              alpha: 0.12,
                            ),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Icon(
                            darkMode
                                ? Icons.dark_mode_rounded
                                : Icons.light_mode_rounded,
                            color: AppColors.onboardingGreen,
                          ),
                        ),
                        const SizedBox(width: 14),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Dark mode',
                                style: TextStyle(fontWeight: FontWeight.w900),
                              ),
                              SizedBox(height: 4),
                              Text(
                                'Switch the app color scheme for low light use.',
                                style: TextStyle(
                                  color: AppColors.muted,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Switch(
                          value: darkMode,
                          onChanged: (value) {
                            ref
                                .read(themeModeProvider.notifier)
                                .setDarkMode(value);
                          },
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),
                  const _ChangePasswordCard(),
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

class _ChangePasswordCard extends ConsumerWidget {
  const _ChangePasswordCard();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: Theme.of(context).dividerColor.withValues(alpha: 0.24),
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppColors.onboardingGreen.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(
              Icons.lock_reset_rounded,
              color: AppColors.onboardingGreen,
            ),
          ),
          const SizedBox(width: 14),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Change password',
                  style: TextStyle(fontWeight: FontWeight.w900),
                ),
                SizedBox(height: 4),
                Text(
                  'Use a strong password for your volunteer account.',
                  style: TextStyle(
                    color: AppColors.muted,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            tooltip: 'Change password',
            onPressed: () => _showChangePasswordDialog(context, ref),
            icon: const Icon(Icons.chevron_right_rounded),
          ),
        ],
      ),
    );
  }

  Future<void> _showChangePasswordDialog(
    BuildContext context,
    WidgetRef ref,
  ) async {
    final parentContext = context;
    final formKey = GlobalKey<FormState>();
    final currentPassword = TextEditingController();
    final newPassword = TextEditingController();
    final confirmPassword = TextEditingController();
    var loading = false;
    var obscureCurrent = true;
    var obscureNew = true;
    var obscureConfirm = true;

    await showDialog<void>(
      context: context,
      builder: (dialogContext) {
        return StatefulBuilder(
          builder: (innerContext, setState) {
            Future<void> submit() async {
              if (!formKey.currentState!.validate()) return;
              setState(() => loading = true);
              try {
                await ref
                    .read(authControllerProvider.notifier)
                    .changePassword(
                      currentPassword: currentPassword.text,
                      newPassword: newPassword.text,
                    );
                if (!dialogContext.mounted) return;
                Navigator.of(dialogContext).pop();
                ScaffoldMessenger.of(parentContext).showSnackBar(
                  const SnackBar(content: Text('Password changed.')),
                );
              } catch (error) {
                if (!innerContext.mounted) return;
                ScaffoldMessenger.of(
                  innerContext,
                ).showSnackBar(SnackBar(content: Text(error.toString())));
              } finally {
                if (innerContext.mounted) setState(() => loading = false);
              }
            }

            return AlertDialog(
              title: const Text('Change password'),
              content: Form(
                key: formKey,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _PasswordField(
                      controller: currentPassword,
                      label: 'Current password',
                      obscureText: obscureCurrent,
                      onToggle: () =>
                          setState(() => obscureCurrent = !obscureCurrent),
                      validator: AuthValidators.passwordError,
                    ),
                    const SizedBox(height: 12),
                    _PasswordField(
                      controller: newPassword,
                      label: 'New password',
                      obscureText: obscureNew,
                      onToggle: () => setState(() => obscureNew = !obscureNew),
                      validator: (value) {
                        final error = AuthValidators.passwordError(value);
                        if (error != null) return error;
                        if (value == currentPassword.text) {
                          return 'Choose a different password';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 12),
                    _PasswordField(
                      controller: confirmPassword,
                      label: 'Confirm new password',
                      obscureText: obscureConfirm,
                      onToggle: () =>
                          setState(() => obscureConfirm = !obscureConfirm),
                      validator: (value) {
                        return AuthValidators.confirmPasswordError(
                          value,
                          newPassword.text,
                        );
                      },
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: loading
                      ? null
                      : () => Navigator.of(dialogContext).pop(),
                  child: const Text('Cancel'),
                ),
                ElevatedButton.icon(
                  onPressed: loading ? null : submit,
                  icon: loading
                      ? const SizedBox.square(
                          dimension: 16,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Icon(Icons.check_rounded),
                  label: const Text('Save'),
                ),
              ],
            );
          },
        );
      },
    );

    currentPassword.dispose();
    newPassword.dispose();
    confirmPassword.dispose();
  }
}

class _PasswordField extends StatelessWidget {
  const _PasswordField({
    required this.controller,
    required this.label,
    required this.obscureText,
    required this.onToggle,
    required this.validator,
  });

  final TextEditingController controller;
  final String label;
  final bool obscureText;
  final VoidCallback onToggle;
  final FormFieldValidator<String> validator;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      obscureText: obscureText,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: const Icon(Icons.lock_outline_rounded),
        suffixIcon: IconButton(
          tooltip: obscureText ? 'Show password' : 'Hide password',
          onPressed: onToggle,
          icon: Icon(
            obscureText
                ? Icons.visibility_rounded
                : Icons.visibility_off_rounded,
          ),
        ),
      ),
      validator: validator,
    );
  }
}
