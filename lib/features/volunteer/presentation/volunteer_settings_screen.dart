import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/theme/theme_controller.dart';
import '../../../core/utils/responsive.dart';
import 'volunteer_home_screen.dart';

class VolunteerSettingsScreen extends ConsumerWidget {
  const VolunteerSettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeModeProvider);
    final darkMode = themeMode == ThemeMode.dark;

    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
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
                          ref.read(themeModeProvider.notifier).state = value
                              ? ThemeMode.dark
                              : ThemeMode.light;
                        },
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      bottomNavigationBar: const VolunteerBottomNavigation(currentIndex: 3),
    );
  }
}
