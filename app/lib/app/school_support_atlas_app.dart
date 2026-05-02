import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/constants/app_constants.dart';
import '../core/theme/app_theme.dart';
import '../core/theme/theme_controller.dart';
import '../core/router/app_router.dart';
import '../core/widgets/back_button_handler.dart';

class SchoolSupportAtlasApp extends ConsumerWidget {
  const SchoolSupportAtlasApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);
    final useSystemTheme = ref.watch(useSystemThemeProvider);
    final manualThemeMode = ref.watch(themeModeProvider);

    // Determine the final theme mode:
    // - If useSystemTheme is true -> use ThemeMode.system (device theme)
    // - If useSystemTheme is false -> use manual selection
    final themeMode = useSystemTheme ? ThemeMode.system : manualThemeMode;

    return BackButtonHandler(
      child: MaterialApp.router(
        title: AppConstants.appName,
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light(),
        darkTheme: AppTheme.dark(),
        themeMode: themeMode,
        routerConfig: router,
      ),
    );
  }
}
