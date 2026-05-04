import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:school_support_atlas/core/constants/app_constants.dart';
import 'package:school_support_atlas/core/errors/app_exception.dart';
import 'package:school_support_atlas/core/storage/local_settings_storage.dart';
import 'package:school_support_atlas/core/storage/secure_token_storage.dart';
import 'package:school_support_atlas/core/storage/storage_providers.dart';
import 'package:school_support_atlas/features/auth/presentation/auth_controller.dart';
import 'package:school_support_atlas/features/auth/presentation/login_screen.dart';
import 'package:school_support_atlas/features/volunteer/presentation/volunteer_settings_screen.dart';
import 'package:school_support_atlas/shared/models/app_enums.dart';
import 'package:school_support_atlas/shared/models/user.dart';
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

  testWidgets('failed login shows popup and stays on login', (tester) async {
    await tester.pumpWidget(
      _authTestApp(
        controllerFactory: _FailingLoginController.new,
        settings: _FakeSettingsStorage(),
      ),
    );

    await tester.enterText(
      find.byType(TextFormField).at(0),
      'missing@test.com',
    );
    await tester.enterText(find.byType(TextFormField).at(1), 'WrongPass1!');
    await tester.tap(find.text('Sign in'));
    await tester.pumpAndSettle();

    expect(find.text('Sign in failed'), findsOneWidget);
    expect(
      find.text('User is not registered or the password is incorrect.'),
      findsOneWidget,
    );
    expect(find.text('Home Route'), findsNothing);
  });

  testWidgets('successful login shows success popup then volunteer guide', (
    tester,
  ) async {
    await tester.pumpWidget(
      _authTestApp(
        controllerFactory: _SuccessfulLoginController.new,
        settings: _FakeSettingsStorage(),
      ),
    );

    await tester.enterText(
      find.byType(TextFormField).at(0),
      'test@example.com',
    );
    await tester.enterText(find.byType(TextFormField).at(1), 'Test@1234');
    await tester.tap(find.text('Sign in'));
    await tester.pumpAndSettle();

    expect(find.text('Signed in successfully'), findsOneWidget);

    await tester.tap(find.text('Continue'));
    await tester.pumpAndSettle();

    expect(find.text('Welcome to Support Atlas'), findsOneWidget);
    expect(find.text("Don't show again"), findsOneWidget);
  });

  testWidgets('volunteer guide can be dismissed permanently', (tester) async {
    final settings = _FakeSettingsStorage();
    await tester.pumpWidget(
      _authTestApp(
        controllerFactory: _SuccessfulLoginController.new,
        settings: settings,
      ),
    );

    await tester.enterText(
      find.byType(TextFormField).at(0),
      'test@example.com',
    );
    await tester.enterText(find.byType(TextFormField).at(1), 'Test@1234');
    await tester.tap(find.text('Sign in'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Continue'));
    await tester.pumpAndSettle();
    await tester.ensureVisible(find.byType(CheckboxListTile));
    await tester.pumpAndSettle();
    await tester.tap(find.byType(CheckboxListTile));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Start'));
    await tester.pumpAndSettle();

    expect(settings.dismissed, isTrue);
    expect(find.text('Home Route'), findsOneWidget);
  });

  testWidgets('change password shows success popup', (tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authControllerProvider.overrideWith(_PasswordSuccessController.new),
          localSettingsStorageProvider.overrideWithValue(
            _FakeSettingsStorage(),
          ),
        ],
        child: const MaterialApp(home: VolunteerSettingsScreen()),
      ),
    );

    await tester.tap(find.byTooltip('Change password'));
    await tester.pumpAndSettle();
    await tester.enterText(
      find.widgetWithText(TextFormField, 'Current password'),
      'Test@1234',
    );
    await tester.enterText(
      find.widgetWithText(TextFormField, 'New password'),
      'Better@1234',
    );
    await tester.enterText(
      find.widgetWithText(TextFormField, 'Confirm new password'),
      'Better@1234',
    );
    await tester.tap(find.text('Save'));
    await tester.pumpAndSettle();

    expect(find.text('Password changed'), findsOneWidget);
  });
}

class _TestAuthController extends AuthController {
  @override
  Future<AuthState> build() async => const AuthState();
}

Widget _authTestApp({
  required AuthController Function() controllerFactory,
  required _FakeSettingsStorage settings,
}) {
  final router = GoRouter(
    initialLocation: '/login/volunteer',
    routes: [
      GoRoute(
        path: '/login/volunteer',
        builder: (context, state) =>
            const LoginScreen(selectedRole: UserAccessRole.volunteer),
      ),
      GoRoute(
        path: '/volunteer/home',
        builder: (context, state) => const Scaffold(body: Text('Home Route')),
      ),
    ],
  );

  return ProviderScope(
    overrides: [
      authControllerProvider.overrideWith(controllerFactory),
      localSettingsStorageProvider.overrideWithValue(settings),
    ],
    child: MaterialApp.router(routerConfig: router),
  );
}

class _FakeSettingsStorage extends LocalSettingsStorage {
  bool dismissed = false;

  @override
  ThemeMode readThemeMode() => ThemeMode.light;

  @override
  Future<void> saveThemeMode(ThemeMode mode) async {}

  @override
  bool readUseSystemTheme() => false;

  @override
  Future<void> saveUseSystemTheme(bool useSystemTheme) async {}

  @override
  bool readVolunteerLoginGuideDismissed() => dismissed;

  @override
  Future<void> saveVolunteerLoginGuideDismissed(bool dismissed) async {
    this.dismissed = dismissed;
  }
}

class _FailingLoginController extends _TestAuthController {
  @override
  Future<AuthSession> login({
    required String identifier,
    required String password,
    required UserAccessRole accessRole,
  }) async {
    throw const AppException(
      'User is not registered or the password is incorrect.',
    );
  }
}

class _SuccessfulLoginController extends _TestAuthController {
  @override
  Future<AuthSession> login({
    required String identifier,
    required String password,
    required UserAccessRole accessRole,
  }) async {
    final session = _session(accessRole);
    state = AsyncData(AuthState(session: session));
    return session;
  }
}

class _PasswordSuccessController extends _SuccessfulLoginController {
  @override
  Future<AuthState> build() async {
    return AuthState(session: _session(UserAccessRole.volunteer));
  }

  @override
  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {}
}

AuthSession _session(UserAccessRole accessRole) {
  return AuthSession(
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    accessRole: accessRole,
    user: const User(
      id: 'user-1',
      name: 'Test Volunteer',
      email: 'test@example.com',
      role: UserRole.fieldWorker,
      username: 'test',
      profileComplete: true,
    ),
  );
}
