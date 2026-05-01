import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:school_support_atlas/core/constants/app_constants.dart';
import 'package:school_support_atlas/features/auth/presentation/auth_controller.dart';
import 'package:school_support_atlas/features/auth/presentation/login_screen.dart';
import 'package:school_support_atlas/shared/widgets/app_logo.dart';
import 'package:school_support_atlas/shared/models/user_access_role.dart';

void main() {
  testWidgets('renders Support Atlas brand elements', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: Column(children: [AppLogo(), Text(AppConstants.appName)]),
        ),
      ),
    );

    expect(find.byType(AppLogo), findsOneWidget);
    expect(find.text(AppConstants.appName), findsOneWidget);
  });

  testWidgets('volunteer login offers registration instead of signup', (
    tester,
  ) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authControllerProvider.overrideWith(_TestAuthController.new),
        ],
        child: const MaterialApp(
          home: LoginScreen(selectedRole: UserAccessRole.volunteer),
        ),
      ),
    );

    expect(find.text('Register as Volunteer'), findsOneWidget);
    expect(find.textContaining('Sign up'), findsNothing);
  });
}

class _TestAuthController extends AuthController {
  @override
  Future<AuthState> build() async => const AuthState();
}
