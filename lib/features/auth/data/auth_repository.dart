import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';

import '../../../core/errors/app_exception.dart';
import '../../../core/storage/secure_token_storage.dart';
import '../../../core/storage/storage_providers.dart';
import '../../../shared/models/app_enums.dart';
import '../../../shared/models/user.dart';
import '../../../shared/models/user_access_role.dart';
import '../auth_validators.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return MockAuthRepository(ref.watch(secureTokenStorageProvider));
});

abstract class AuthRepository {
  Future<AuthSession?> restoreSession();

  Future<bool> isUsernameAvailable(String username);

  Future<AuthSession> login({
    required String identifier,
    required String password,
    required UserAccessRole accessRole,
  });

  Future<AuthSession> signup({
    required String username,
    required String email,
    required String password,
    required UserAccessRole accessRole,
  });

  Future<AuthSession> updateVolunteerProfile({
    required AuthSession session,
    required String name,
    required String phone,
    required String state,
    required String lga,
    required String address,
    String? profileImagePath,
  });

  Future<void> logout();
}

class MockAuthRepository implements AuthRepository {
  MockAuthRepository(this._tokenStorage);

  final SecureTokenStorage _tokenStorage;
  final _uuid = const Uuid();

  static const _reservedUsernames = {
    'admin',
    'atlas',
    'support',
    'volunteer',
    'ibrahim',
  };

  @override
  Future<AuthSession?> restoreSession() => _tokenStorage.readSession();

  @override
  Future<bool> isUsernameAvailable(String username) async {
    await Future<void>.delayed(const Duration(milliseconds: 320));
    final normalized = username.trim().toLowerCase();
    return normalized.length >= 3 && !_reservedUsernames.contains(normalized);
  }

  @override
  Future<AuthSession> login({
    required String identifier,
    required String password,
    required UserAccessRole accessRole,
  }) async {
    await Future<void>.delayed(const Duration(milliseconds: 500));
    if (!AuthValidators.isValidLoginIdentifier(identifier) ||
        !AuthValidators.isValidPassword(password)) {
      throw const AppException(
        'Use a valid email or username and a strong password.',
      );
    }

    final normalizedIdentifier = identifier.trim().toLowerCase();
    final isEmail = normalizedIdentifier.contains('@');
    final email = isEmail
        ? identifier.trim()
        : '$normalizedIdentifier@school-support-atlas.local';
    final role = normalizedIdentifier.contains('admin')
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
        username: isEmail
            ? (role == UserRole.admin ? 'admin' : 'ibrahim')
            : normalizedIdentifier,
        phone: accessRole == UserAccessRole.volunteer ? '+2348012345678' : null,
        state: accessRole == UserAccessRole.volunteer ? 'Kano' : null,
        lga: accessRole == UserAccessRole.volunteer ? 'Nassarawa' : null,
        address: accessRole == UserAccessRole.volunteer
            ? 'Nassarawa LGA, Kano State'
            : null,
        profileComplete: true,
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
    required String username,
    required String email,
    required String password,
    required UserAccessRole accessRole,
  }) async {
    await Future<void>.delayed(const Duration(milliseconds: 600));
    final normalizedUsername = username.trim().toLowerCase();
    if (normalizedUsername.length < 3 ||
        !AuthValidators.isValidEmail(email) ||
        !AuthValidators.isValidPassword(password)) {
      throw const AppException(
        'Enter a username, valid email, and a strong password.',
      );
    }
    if (!await isUsernameAvailable(normalizedUsername)) {
      throw const AppException('That username is already taken.');
    }

    final session = AuthSession(
      accessToken: 'mock-access-${_uuid.v4()}',
      refreshToken: 'mock-refresh-${_uuid.v4()}',
      accessRole: accessRole,
      user: User(
        id: '${accessRole.name}-${_uuid.v4().substring(0, 8)}',
        name: '',
        email: email.trim(),
        role: UserRole.fieldWorker,
        username: normalizedUsername,
        profileComplete: accessRole != UserAccessRole.volunteer,
        permissions: accessRole == UserAccessRole.volunteer
            ? const ['sites:create', 'sites:update:assigned']
            : const ['sites:read', 'support:offer'],
      ),
    );
    await _tokenStorage.saveSession(session);
    return session;
  }

  @override
  Future<AuthSession> updateVolunteerProfile({
    required AuthSession session,
    required String name,
    required String phone,
    required String state,
    required String lga,
    required String address,
    String? profileImagePath,
  }) async {
    await Future<void>.delayed(const Duration(milliseconds: 450));
    if (name.trim().length < 2 ||
        phone.trim().length < 7 ||
        state.trim().isEmpty ||
        lga.trim().isEmpty ||
        address.trim().length < 4) {
      throw const AppException('Complete your name, phone, and address.');
    }

    final updated = session.copyWith(
      user: session.user.copyWith(
        name: name.trim(),
        phone: phone.trim(),
        state: state.trim(),
        lga: lga.trim(),
        address: address.trim(),
        profileImagePath: profileImagePath,
        profileComplete: true,
      ),
    );
    await _tokenStorage.saveSession(updated);
    return updated;
  }

  @override
  Future<void> logout() => _tokenStorage.clear();
}
