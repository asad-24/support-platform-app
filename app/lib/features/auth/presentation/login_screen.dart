import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/storage/storage_providers.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/responsive.dart';
import '../../../shared/models/user_access_role.dart';
import '../../../shared/widgets/app_logo.dart';
import '../auth_validators.dart';
import 'auth_controller.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key, required this.selectedRole});

  final UserAccessRole selectedRole;

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _identifierController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _submitting = false;

  @override
  void dispose() {
    _identifierController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authControllerProvider);
    final busy = authState.isLoading || _submitting;

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: Responsive.pagePadding(context),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(22),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const Center(child: AppLogo()),
                        const SizedBox(height: 18),
                        Text(
                          'Login',
                          textAlign: TextAlign.center,
                          style: Theme.of(context).textTheme.headlineMedium,
                        ),
                        const SizedBox(height: 24),
                        TextFormField(
                          controller: _identifierController,
                          keyboardType: TextInputType.emailAddress,
                          autofillHints: const <String>[],
                          decoration: const InputDecoration(
                            labelText: 'Email or username',
                            prefixIcon: Icon(Icons.person_outline_rounded),
                          ),
                          validator: AuthValidators.loginIdentifierError,
                        ),
                        const SizedBox(height: 14),
                        TextFormField(
                          controller: _passwordController,
                          obscureText: _obscurePassword,
                          autofillHints: const <String>[],
                          decoration: InputDecoration(
                            labelText: 'Password',
                            prefixIcon: const Icon(Icons.lock_outline_rounded),
                            suffixIcon: IconButton(
                              tooltip: _obscurePassword
                                  ? 'Show password'
                                  : 'Hide password',
                              onPressed: () => setState(
                                () => _obscurePassword = !_obscurePassword,
                              ),
                              icon: Icon(
                                _obscurePassword
                                    ? Icons.visibility_rounded
                                    : Icons.visibility_off_rounded,
                              ),
                            ),
                          ),
                          validator: AuthValidators.passwordError,
                        ),
                        const SizedBox(height: 22),
                        ElevatedButton.icon(
                          onPressed: busy ? null : _submit,
                          icon: busy
                              ? const SizedBox.square(
                                  dimension: 18,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white,
                                  ),
                                )
                              : const Icon(Icons.login_rounded),
                          label: const Text('Sign in'),
                        ),
                        const SizedBox(height: 16),
                        if (widget.selectedRole == UserAccessRole.volunteer)
                          TextButton.icon(
                            onPressed: busy
                                ? null
                                : () => context.go('/volunteer/register'),
                            icon: const Icon(Icons.how_to_reg_rounded),
                            label: const Text('Register as Volunteer'),
                          )
                        else
                          Text(
                            'Access is created by an administrator.',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: AppColors.secondaryText(context),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _submit() async {
    if (_submitting || !_formKey.currentState!.validate()) return;
    setState(() => _submitting = true);
    Object? loginError;
    try {
      await ref
          .read(authControllerProvider.notifier)
          .login(
            identifier: _identifierController.text.trim(),
            password: _passwordController.text,
            accessRole: widget.selectedRole,
          );
    } catch (error) {
      loginError = error;
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
    if (!mounted) return;

    if (loginError != null) {
      await _showLoginErrorDialog(loginError.toString());
      return;
    }

    await _showSignedInDialog();
    if (!mounted) return;

    if (widget.selectedRole == UserAccessRole.volunteer) {
      await _showVolunteerGuideIfNeeded();
      if (!mounted) return;
      context.go(widget.selectedRole.dashboardPath);
      return;
    }

    context.go(widget.selectedRole.dashboardPath);
  }

  Future<void> _showLoginErrorDialog(String message) {
    return showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        icon: const Icon(Icons.error_outline_rounded),
        title: const Text('Sign in failed'),
        content: Text(
          message.trim().isEmpty
              ? 'User is not registered or the password is incorrect.'
              : message,
        ),
        actions: [
          FilledButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Try again'),
          ),
        ],
      ),
    );
  }

  Future<void> _showSignedInDialog() {
    return showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        icon: const Icon(Icons.check_circle_outline_rounded),
        title: const Text('Signed in successfully'),
        content: const Text('Welcome back. Your volunteer workspace is ready.'),
        actions: [
          FilledButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Continue'),
          ),
        ],
      ),
    );
  }

  Future<void> _showVolunteerGuideIfNeeded() async {
    final settings = ref.read(localSettingsStorageProvider);
    if (settings.readVolunteerLoginGuideDismissed()) return;

    var dontShowAgain = false;
    await showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) {
        return StatefulBuilder(
          builder: (context, setState) => AlertDialog(
            icon: const Icon(Icons.volunteer_activism_rounded),
            title: const Text('Welcome to Support Atlas'),
            content: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 520),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Use this workspace to document schools carefully, follow corrections, and build a trusted volunteer record.',
                    ),
                    const SizedBox(height: 16),
                    const _GuideItem(
                      icon: Icons.dashboard_customize_rounded,
                      title: 'Dashboard',
                      body:
                          'Check your approved, pending, and correction work at a glance.',
                    ),
                    const _GuideItem(
                      icon: Icons.add_location_alt_rounded,
                      title: 'Submit schools',
                      body:
                          'Add location, school details, photos, welfare notes, and needs before sending for review.',
                    ),
                    const _GuideItem(
                      icon: Icons.fact_check_rounded,
                      title: 'Submitted schools',
                      body:
                          'Track approval status and open any request that needs correction.',
                    ),
                    const _GuideItem(
                      icon: Icons.workspace_premium_rounded,
                      title: 'Rewards',
                      body:
                          'Your level grows when submitted schools are approved.',
                    ),
                    const _GuideItem(
                      icon: Icons.manage_accounts_rounded,
                      title: 'Profile and settings',
                      body:
                          'Keep contact details updated and change your password when needed.',
                    ),
                    const SizedBox(height: 8),
                    CheckboxListTile(
                      contentPadding: EdgeInsets.zero,
                      value: dontShowAgain,
                      onChanged: (value) =>
                          setState(() => dontShowAgain = value ?? false),
                      controlAffinity: ListTileControlAffinity.leading,
                      title: const Text("Don't show again"),
                    ),
                  ],
                ),
              ),
            ),
            actions: [
              FilledButton(
                onPressed: () async {
                  if (dontShowAgain) {
                    await settings.saveVolunteerLoginGuideDismissed(true);
                  }
                  if (dialogContext.mounted) {
                    Navigator.of(dialogContext).pop();
                  }
                },
                child: const Text('Start'),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _GuideItem extends StatelessWidget {
  const _GuideItem({
    required this.icon,
    required this.title,
    required this.body,
  });

  final IconData icon;
  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 22, color: Theme.of(context).colorScheme.primary),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontWeight: FontWeight.w900),
                ),
                const SizedBox(height: 2),
                Text(body),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
