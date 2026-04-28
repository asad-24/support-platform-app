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
    final session = await ref.read(authRepositoryProvider).restoreSession();
    return AuthState(session: session);
  }

  Future<void> login({
    required String email,
    required String password,
    required UserAccessRole accessRole,
  }) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final session = await ref
          .read(authRepositoryProvider)
          .login(email: email, password: password, accessRole: accessRole);
      return AuthState(session: session);
    });
  }

  Future<void> signup({
    required String name,
    required String emailOrPhone,
    required String password,
    required UserAccessRole accessRole,
  }) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final session = await ref
          .read(authRepositoryProvider)
          .signup(
            name: name,
            emailOrPhone: emailOrPhone,
            password: password,
            accessRole: accessRole,
          );
      return AuthState(session: session);
    });
  }

  Future<void> logout() async {
    await ref.read(authRepositoryProvider).logout();
    state = const AsyncData(AuthState());
  }
}
