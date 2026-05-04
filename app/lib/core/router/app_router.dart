import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/auth_controller.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/signup_screen.dart';
import '../../features/auth/presentation/splash_screen.dart';
import '../../features/auth/presentation/volunteer_application_screen.dart';
import '../../features/dashboard/presentation/home_screen.dart';
import '../../features/export/presentation/export_screen.dart';
import '../../features/map/presentation/map_screen.dart';
import '../../features/sites/presentation/add_site_flow_screen.dart';
import '../../features/sites/presentation/drafts_screen.dart';
import '../../features/sites/presentation/site_list_screen.dart';
import '../../features/sites/presentation/site_profile_screen.dart';
import '../../features/sites/presentation/sync_screen.dart';
import '../../features/volunteer/presentation/volunteer_home_screen.dart';
import '../../features/volunteer/presentation/volunteer_draft_records_screen.dart';
import '../../features/volunteer/presentation/volunteer_help_support_screen.dart';
import '../../features/volunteer/presentation/volunteer_notifications_screen.dart';
import '../../features/volunteer/presentation/volunteer_profile_screen.dart';
import '../../features/volunteer/presentation/volunteer_profile_setup_screen.dart';
import '../../features/volunteer/presentation/volunteer_settings_screen.dart';
import '../../features/volunteer/presentation/school_submission_detail_screen.dart';
import '../../features/volunteer/presentation/volunteer_submitted_schools_screen.dart';
import '../../features/volunteer/presentation/welcome_screen.dart';
import '../../shared/models/app_enums.dart';
import '../../shared/models/user_access_role.dart';
import '../widgets/shell_layouts.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final auth = ref.watch(authControllerProvider);

  return GoRouter(
    initialLocation: '/splash',
    routes: [
      // Auth routes
      GoRoute(path: '/access', redirect: (_, _) => '/login/volunteer'),
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(path: '/login', redirect: (_, _) => '/login/volunteer'),
      GoRoute(
        path: '/login/:role',
        builder: (context, state) => LoginScreen(
          selectedRole: UserAccessRole.fromRoute(state.pathParameters['role']),
        ),
      ),
      GoRoute(
        path: '/volunteer/register',
        builder: (context, state) => const VolunteerApplicationScreen(),
      ),
      GoRoute(
        path: '/signup/:role',
        redirect: (context, state) {
          final role = UserAccessRole.fromRoute(state.pathParameters['role']);
          return role == UserAccessRole.volunteer
              ? '/volunteer/register'
              : null;
        },
        builder: (context, state) => SignupScreen(
          selectedRole: UserAccessRole.fromRoute(state.pathParameters['role']),
        ),
      ),

      // Welcome flow
      GoRoute(
        path: '/welcome/volunteer',
        builder: (context, state) => const VolunteerWelcomeScreen(),
      ),

      // Home
      GoRoute(path: '/home', builder: (context, state) => const HomeScreen()),

      // Nested Volunteer Routes
      ShellRoute(
        builder: (context, state, child) => VolunteerShellLayout(
          currentRoute: state.matchedLocation,
          child: child,
        ),
        routes: [
          GoRoute(
            path: '/volunteer/home',
            builder: (context, state) => const VolunteerHomeScreen(),
          ),
          GoRoute(
            path: '/volunteer/submitted-schools',
            builder: (context, state) =>
                const VolunteerSubmittedSchoolsScreen(),
          ),
          GoRoute(
            path: '/volunteer/submitted-schools/:id',
            builder: (context, state) => SchoolSubmissionDetailScreen(
              siteId: state.pathParameters['id']!,
            ),
          ),
          GoRoute(
            path: '/volunteer/drafts',
            builder: (context, state) => const VolunteerDraftRecordsScreen(),
          ),
          GoRoute(
            path: '/volunteer/notifications',
            builder: (context, state) => const VolunteerNotificationsScreen(),
          ),
          GoRoute(
            path: '/volunteer/profile',
            builder: (context, state) => const VolunteerProfileScreen(),
          ),
          GoRoute(
            path: '/volunteer/profile/setup',
            redirect: (_, _) => '/volunteer/profile/edit',
          ),
          GoRoute(
            path: '/volunteer/profile/edit',
            builder: (context, state) =>
                const VolunteerProfileSetupScreen(editMode: true),
          ),
          GoRoute(
            path: '/volunteer/settings',
            builder: (context, state) => const VolunteerSettingsScreen(),
          ),
          GoRoute(
            path: '/volunteer/help',
            builder: (context, state) => const VolunteerHelpSupportScreen(),
          ),
        ],
      ),

      // Nested Sites Routes
      ShellRoute(
        builder: (context, state, child) =>
            SitesShellLayout(currentRoute: state.matchedLocation, child: child),
        routes: [
          GoRoute(
            path: '/sites',
            builder: (context, state) => const SiteListScreen(),
          ),
          GoRoute(
            path: '/sites/new',
            builder: (context, state) => AddSiteFlowScreen(
              initialStep:
                  int.tryParse(state.uri.queryParameters['step'] ?? '') ?? 0,
              draftId: state.uri.queryParameters['draftId'],
            ),
          ),
          GoRoute(
            path: '/sites/:id',
            builder: (context, state) =>
                SiteProfileScreen(siteId: state.pathParameters['id']!),
          ),
          GoRoute(
            path: '/sites/:id/edit',
            builder: (context, state) => AddSiteFlowScreen(
              siteId: state.pathParameters['id']!,
              correctionOnly:
                  state.uri.queryParameters['correctionOnly'] == 'true',
            ),
          ),
        ],
      ),

      // Dashboard routes
      GoRoute(
        path: '/dashboard/helper',
        builder: (context, state) =>
            const HomeScreen(dashboardRole: UserAccessRole.helper),
      ),
      GoRoute(
        path: '/dashboard/volunteer',
        redirect: (_, _) => '/volunteer/home',
      ),

      // Utility routes
      GoRoute(path: '/map', builder: (context, state) => const MapScreen()),
      GoRoute(
        path: '/drafts',
        builder: (context, state) {
          final session = ref.read(authControllerProvider).valueOrNull?.session;
          if (session?.accessRole == UserAccessRole.volunteer) {
            return const VolunteerDraftRecordsScreen();
          }
          return const DraftsScreen();
        },
      ),
      GoRoute(path: '/sync', builder: (context, state) => const SyncScreen()),
      GoRoute(
        path: '/export',
        builder: (context, state) => const ExportScreen(),
      ),

      // Redirects for alternative routes
      GoRoute(
        path: '/volunteer/schools',
        redirect: (_, _) => '/volunteer/submitted-schools',
      ),
    ],
    redirect: (context, state) {
      final location = state.matchedLocation;
      final path = state.uri.path;
      final isAuthRoute =
          path.startsWith('/login') ||
          path.startsWith('/signup') ||
          path == '/volunteer/register' ||
          location.startsWith('/login') ||
          location.startsWith('/signup') ||
          location == '/volunteer/register';

      if (auth.isLoading) {
        return path == '/splash' || location == '/splash' || isAuthRoute
            ? null
            : '/splash';
      }

      final session = auth.valueOrNull?.session;
      final isLoggedIn = session != null;

      if (!isLoggedIn) {
        if (location == '/splash' || location == '/access') {
          return '/login/volunteer';
        }
        return isAuthRoute ? null : '/login/volunteer';
      }

      if (isAuthRoute) {
        if (session.accessRole == UserAccessRole.volunteer) {
          return session.accessRole.dashboardPath;
        }
        return session.accessRole.dashboardPath;
      }

      if (location == '/splash' || location == '/access') {
        return session.accessRole.dashboardPath;
      }

      final adminOnly = location == '/export';
      if (adminOnly && session.user.role != UserRole.admin) {
        return session.accessRole.dashboardPath;
      }

      return null;
    },
    errorBuilder: (context, state) => Scaffold(
      appBar: AppBar(title: const Text('Page not found')),
      body: Center(child: Text(state.error.toString())),
    ),
  );
});
