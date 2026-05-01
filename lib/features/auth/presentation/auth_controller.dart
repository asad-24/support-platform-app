import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/storage/secure_token_storage.dart';
import '../../../shared/models/user_access_role.dart';
import '../data/auth_repository.dart';

class AuthState {
  const AuthState({this.session});

  final AuthSession? session;

  bool get isAuthenticated => session != null;
}

final authControllerProvider = AsyncNotifierProvider<AuthController, AuthState>(
  AuthController.new,
);

class AuthController extends AsyncNotifier<AuthState> {
  @override
  Future<AuthState> build() async {
    await Future<void>.delayed(const Duration(milliseconds: 1600));
    final session = await ref.read(authRepositoryProvider).restoreSession();
    return AuthState(session: session);
  }

  Future<void> login({
    required String identifier,
    required String password,
    required UserAccessRole accessRole,
  }) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final session = await ref
          .read(authRepositoryProvider)
          .login(
            identifier: identifier,
            password: password,
            accessRole: accessRole,
          );
      return AuthState(session: session);
    });
  }

  Future<void> signup({
    required String username,
    required String email,
    required String password,
    required UserAccessRole accessRole,
  }) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final session = await ref
          .read(authRepositoryProvider)
          .signup(
            username: username,
            email: email,
            password: password,
            accessRole: accessRole,
          );
      return AuthState(session: session);
    });
  }

  Future<bool> isUsernameAvailable(String username) {
    return ref.read(authRepositoryProvider).isUsernameAvailable(username);
  }

  Future<VolunteerApplicationResult> submitVolunteerApplication(
    VolunteerApplication application,
  ) {
    return ref
        .read(authRepositoryProvider)
        .submitVolunteerApplication(application);
  }

  Future<void> completeVolunteerProfile({
    required String name,
    required String phone,
    required String stateName,
    required String lga,
    required String address,
    String? profileImagePath,
  }) async {
    final session = state.valueOrNull?.session;
    if (session == null) return;
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final updatedSession = await ref
          .read(authRepositoryProvider)
          .updateVolunteerProfile(
            session: session,
            name: name,
            phone: phone,
            state: stateName,
            lga: lga,
            address: address,
            profileImagePath: profileImagePath,
          );
      return AuthState(session: updatedSession);
    });
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    final session = state.valueOrNull?.session;
    if (session == null) return;
    await ref
        .read(authRepositoryProvider)
        .changePassword(
          session: session,
          currentPassword: currentPassword,
          newPassword: newPassword,
        );
  }

  Future<void> logout() async {
    await ref.read(authRepositoryProvider).logout();
    state = const AsyncData(AuthState());
  }
}
