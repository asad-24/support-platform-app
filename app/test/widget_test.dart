import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:school_support_atlas/core/constants/app_constants.dart';
import 'package:school_support_atlas/core/errors/app_exception.dart';
import 'package:school_support_atlas/core/storage/local_settings_storage.dart';
import 'package:school_support_atlas/core/storage/secure_token_storage.dart';
import 'package:school_support_atlas/core/storage/storage_providers.dart';
import 'package:school_support_atlas/core/theme/app_theme.dart';
import 'package:school_support_atlas/features/auth/presentation/auth_controller.dart';
import 'package:school_support_atlas/features/auth/presentation/login_screen.dart';
import 'package:school_support_atlas/features/sites/data/sites_repository.dart';
import 'package:school_support_atlas/features/volunteer/data/volunteer_notification.dart';
import 'package:school_support_atlas/features/volunteer/presentation/volunteer_help_support_screen.dart';
import 'package:school_support_atlas/features/volunteer/presentation/volunteer_home_screen.dart';
import 'package:school_support_atlas/features/volunteer/presentation/volunteer_notifications_screen.dart';
import 'package:school_support_atlas/features/volunteer/presentation/volunteer_profile_screen.dart';
import 'package:school_support_atlas/features/volunteer/presentation/volunteer_reward_widgets.dart';
import 'package:school_support_atlas/features/volunteer/presentation/volunteer_settings_screen.dart';
import 'package:school_support_atlas/features/volunteer/presentation/volunteer_submitted_schools_screen.dart';
import 'package:school_support_atlas/shared/models/app_enums.dart';
import 'package:school_support_atlas/shared/models/site.dart';
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
          volunteerNotificationsRepositoryProvider.overrideWithValue(
            _FakeVolunteerNotificationsRepository(),
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

  testWidgets('help support shows support email instead of action buttons', (
    tester,
  ) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authControllerProvider.overrideWith(_TestAuthController.new),
          volunteerNotificationsRepositoryProvider.overrideWithValue(
            _FakeVolunteerNotificationsRepository(),
          ),
        ],
        child: const MaterialApp(home: VolunteerHelpSupportScreen()),
      ),
    );
    await tester.scrollUntilVisible(find.text('Contact support'), 500);

    expect(find.text('info@example.com', findRichText: true), findsOneWidget);
    expect(find.widgetWithText(OutlinedButton, 'Edit Profile'), findsNothing);
    expect(find.widgetWithText(ElevatedButton, 'Submit School'), findsNothing);
  });

  testWidgets('volunteer reward info popup explains levels', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: VolunteerRewardBadge(approvedCount: 16, showInfoButton: true),
        ),
      ),
    );

    await tester.tap(find.byTooltip('How levels work'));
    await tester.pumpAndSettle();

    expect(find.text('Volunteer levels'), findsOneWidget);
    expect(find.text('Community Starter'), findsOneWidget);
    expect(find.text('Atlas Champion'), findsOneWidget);

    await tester.tap(find.byTooltip('Close'));
    await tester.pumpAndSettle();

    expect(find.text('Volunteer levels'), findsNothing);
  });

  testWidgets('volunteer profile card displays ward lga and state location', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: VolunteerProfileHeaderCard(
            name: 'Test Volunteer',
            email: 'test@example.com',
            username: '@test',
            phone: '+2348012345678',
            role: 'Field Volunteer',
            location: 'Tudun Wada · Nassarawa · Kano',
            approvedCount: 3,
            onEditProfile: () {},
          ),
        ),
      ),
    );

    expect(find.text('Tudun Wada · Nassarawa · Kano'), findsOneWidget);
  });

  testWidgets('submitted school status badges use clear status styles', (
    tester,
  ) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: Column(
            children: [
              SubmissionStatusBadge(status: SubmissionReviewStatus.approved),
              SubmissionStatusBadge(
                status: SubmissionReviewStatus.pendingVerification,
              ),
              SubmissionStatusBadge(
                status: SubmissionReviewStatus.needsCorrection,
              ),
            ],
          ),
        ),
      ),
    );

    expect(
      tester.widget<Text>(find.text('Approved')).style?.color,
      const Color(0xFF0FA36B),
    );
    expect(
      tester.widget<Text>(find.text('Pending Verification')).style?.color,
      AppColors.amber,
    );
    expect(
      tester.widget<Text>(find.text('Needs Correction')).style?.color,
      AppColors.danger,
    );
  });

  testWidgets('notification badge appears when unread notifications exist', (
    tester,
  ) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authControllerProvider.overrideWith(_PasswordSuccessController.new),
          volunteerNotificationsRepositoryProvider.overrideWithValue(
            _FakeVolunteerNotificationsRepository([
              _notification(id: 'n-1', status: 'unread'),
            ]),
          ),
        ],
        child: const MaterialApp(
          home: Scaffold(
            bottomNavigationBar: VolunteerBottomNavigation(currentIndex: 0),
          ),
        ),
      ),
    );
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 100));

    expect(find.byType(VolunteerBottomNavigation), findsOneWidget);
    expect(find.byKey(const Key('notification-unread-badge')), findsOneWidget);
  });

  testWidgets('notification screen highlights unread and marks tap read', (
    tester,
  ) async {
    final repository = _FakeVolunteerNotificationsRepository([
      _notification(id: 'n-1', status: 'unread'),
      _notification(id: 'n-2', status: 'read', title: 'Older update'),
    ]);
    final router = GoRouter(
      initialLocation: '/volunteer/notifications',
      routes: [
        GoRoute(
          path: '/volunteer/notifications',
          builder: (context, state) => const VolunteerNotificationsScreen(),
        ),
        GoRoute(
          path: '/volunteer/submitted-schools/:id',
          builder: (context, state) =>
              const Scaffold(body: Text('Detail Route')),
        ),
      ],
    );

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authControllerProvider.overrideWith(_PasswordSuccessController.new),
          volunteerNotificationsRepositoryProvider.overrideWithValue(
            repository,
          ),
        ],
        child: MaterialApp.router(routerConfig: router),
      ),
    );
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 100));

    expect(find.text('Unread'), findsOneWidget);
    expect(find.text('Read'), findsOneWidget);

    await tester.tap(find.text('Site Approved'));
    await tester.pumpAndSettle();

    expect(repository.markReadCalls, 1);
    expect(find.text('Detail Route'), findsOneWidget);
  });

  testWidgets('my schools supports pull to refresh', (tester) async {
    final sitesRepository = _CountingSitesRepository();
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authControllerProvider.overrideWith(_PasswordSuccessController.new),
          sitesRepositoryProvider.overrideWithValue(sitesRepository),
          volunteerNotificationsRepositoryProvider.overrideWithValue(
            _FakeVolunteerNotificationsRepository(),
          ),
        ],
        child: const MaterialApp(home: VolunteerSubmittedSchoolsScreen()),
      ),
    );
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 100));

    expect(find.byType(RefreshIndicator), findsOneWidget);

    final before = sitesRepository.getSubmittedSitesCalls;
    await tester.drag(find.byType(ListView), const Offset(0, 320));
    await tester.pump();
    await tester.pump(const Duration(seconds: 1));

    expect(sitesRepository.getSubmittedSitesCalls, greaterThan(before));
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
      volunteerNotificationsRepositoryProvider.overrideWithValue(
        _FakeVolunteerNotificationsRepository(),
      ),
    ],
    child: MaterialApp.router(routerConfig: router),
  );
}

class _FakeVolunteerNotificationsRepository
    implements VolunteerNotificationsRepository {
  _FakeVolunteerNotificationsRepository([this.items = const []]);

  final List<VolunteerNotification> items;
  int markReadCalls = 0;
  int markAllReadCalls = 0;

  @override
  Future<List<VolunteerNotification>> getAll() async => items;

  @override
  Future<void> markAllRead() async {
    markAllReadCalls += 1;
  }

  @override
  Future<void> markRead(String id) async {
    markReadCalls += 1;
  }
}

class _CountingSitesRepository extends MockSitesRepository {
  int getSubmittedSitesCalls = 0;

  @override
  Future<List<Site>> getSubmittedSites(String userId) async {
    getSubmittedSitesCalls += 1;
    return [
      _site(
        id: 'site-1',
        name: 'Pending School',
        status: SubmissionReviewStatus.pendingVerification,
      ),
    ];
  }
}

VolunteerNotification _notification({
  required String id,
  String status = 'unread',
  String title = 'Site Approved',
}) {
  return VolunteerNotification(
    id: id,
    siteId: 'site-1',
    siteName: 'School One',
    type: VolunteerNotificationType.approved,
    title: title,
    message: 'Your site School One has been approved',
    status: status,
    createdAt: DateTime(2026, 5, 5, 12),
  );
}

Site _site({
  required String id,
  required String name,
  required SubmissionReviewStatus status,
}) {
  return Site(
    id: id,
    uniqueSiteId: id,
    name: name,
    type: 'Learning Centre',
    operatorName: 'Operator',
    phone: '+2348012345678',
    state: 'Kano',
    lga: 'Fagge',
    ward: 'Ward',
    community: 'Community',
    latitude: 12,
    longitude: 8,
    verificationStatus: switch (status) {
      SubmissionReviewStatus.approved => VerificationStatus.verified,
      SubmissionReviewStatus.needsCorrection => VerificationStatus.rejected,
      SubmissionReviewStatus.pendingVerification => VerificationStatus.pending,
    },
    urgencyLevel: UrgencyLevel.low,
    createdBy: 'user-1',
    createdAt: DateTime(2026, 5, 5),
    updatedAt: DateTime(2026, 5, 5),
    reviewStatus: status,
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
