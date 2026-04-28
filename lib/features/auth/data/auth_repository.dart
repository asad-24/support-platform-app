import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';

import '../../../core/errors/app_exception.dart';
import '../../../core/storage/secure_token_storage.dart';
import '../../../core/storage/storage_providers.dart';
import '../../../shared/models/app_enums.dart';
import '../../../shared/models/user.dart';
import '../../../shared/models/user_access_role.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return MockAuthRepository(ref.watch(secureTokenStorageProvider));
});

abstract class AuthRepository {
  Future<AuthSession?> restoreSession();

  Future<AuthSession> login({
    required String email,
    required String password,
    required UserAccessRole accessRole,
  });

  Future<AuthSession> signup({
    required String name,
    required String emailOrPhone,
    required String password,
    required UserAccessRole accessRole,
  });

  Future<void> logout();
}

class MockAuthRepository implements AuthRepository {
  MockAuthRepository(this._tokenStorage);

  final SecureTokenStorage _tokenStorage;
  final _uuid = const Uuid();

  @override
  Future<AuthSession?> restoreSession() => _tokenStorage.readSession();

  @override
  Future<AuthSession> login({
    required String email,
    required String password,
    required UserAccessRole accessRole,
  }) async {
    await Future<void>.delayed(const Duration(milliseconds: 500));
    if (email.trim().isEmpty || password.length < 6) {
      throw const AppException(
        'Use a valid email and a password of at least 6 characters.',
      );
    }

    final role = email.toLowerCase().contains('admin')
        ? UserRole.admin
        : UserRole.fieldWorker;
    final session = AuthSession(
      accessToken: 'mock-access-${_uuid.v4()}',
      refreshToken: 'mock-refresh-${_uuid.v4()}',
      accessRole: accessRole,
      user: User(
        id: role == UserRole.admin ? 'admin-001' : 'field-001',
        name: role == UserRole.admin
            ? 'Atlas Admin'
            : accessRole == UserAccessRole.volunteer
            ? 'Ibrahim Sule'
            : 'Helper User',
        email: email,
        role: role,
        permissions: role == UserRole.admin
            ? const [
                'sites:read',
                'sites:verify',
                'exports:read',
                'users:manage',
              ]
            : const ['sites:create', 'sites:update:assigned'],
      ),
    );
    await _tokenStorage.saveSession(session);
    return session;
  }

  @override
  Future<AuthSession> signup({
    required String name,
    required String emailOrPhone,
    required String password,
    required UserAccessRole accessRole,
  }) async {
    await Future<void>.delayed(const Duration(milliseconds: 600));
    if (name.trim().length < 2 ||
        emailOrPhone.trim().isEmpty ||
        password.length < 6) {
      throw const AppException(
        'Enter your name, email or phone, and a password of at least 6 characters.',
      );
    }

    final session = AuthSession(
      accessToken: 'mock-access-${_uuid.v4()}',
      refreshToken: 'mock-refresh-${_uuid.v4()}',
      accessRole: accessRole,
      user: User(
        id: '${accessRole.name}-${_uuid.v4().substring(0, 8)}',
        name: name.trim(),
        email: emailOrPhone.trim(),
        role: UserRole.fieldWorker,
        permissions: accessRole == UserAccessRole.volunteer
            ? const ['sites:create', 'sites:update:assigned']
            : const ['sites:read', 'support:offer'],
      ),
    );
    await _tokenStorage.saveSession(session);
    return session;
  }

  @override
  Future<void> logout() => _tokenStorage.clear();
}
