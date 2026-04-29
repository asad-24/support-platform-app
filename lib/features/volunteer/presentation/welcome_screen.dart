import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/app_logo.dart';

class VolunteerWelcomeScreen extends StatefulWidget {
  const VolunteerWelcomeScreen({super.key});

  @override
  State<VolunteerWelcomeScreen> createState() => _VolunteerWelcomeScreenState();
}

class _VolunteerWelcomeScreenState extends State<VolunteerWelcomeScreen> {
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer(const Duration(seconds: 2), () {
      if (mounted) context.go('/volunteer/home');
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.black,
        statusBarIconBrightness: Brightness.light,
        systemNavigationBarColor: AppColors.onboardingGreen,
        systemNavigationBarIconBrightness: Brightness.light,
      ),
      child: const Scaffold(
        backgroundColor: AppColors.onboardingGreen,
        body: SafeArea(
          child: Center(
            child: Padding(
              padding: EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  AppLogo(size: 92),
                  SizedBox(height: 26),
                  Text(
                    'Welcome to ${AppConstants.appName}',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 25,
                      height: 1.2,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  SizedBox(height: 10),
                  Text(
                    "You're signed in as a Volunteer",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: AppColors.mutedOnGreen,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  SizedBox(height: 28),
                  SizedBox.square(
                    dimension: 28,
                    child: CircularProgressIndicator(
                      color: Colors.white,
                      strokeWidth: 2.6,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
