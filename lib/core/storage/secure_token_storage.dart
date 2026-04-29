import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../../shared/models/user.dart';
import '../../shared/models/user_access_role.dart';

class AuthSession {
  const AuthSession({
    required this.accessToken,
    required this.refreshToken,
    required this.user,
    required this.accessRole,
  });

  final String accessToken;
  final String refreshToken;
  final User user;
  final UserAccessRole accessRole;

  AuthSession copyWith({
    String? accessToken,
    String? refreshToken,
    User? user,
    UserAccessRole? accessRole,
  }) {
    return AuthSession(
      accessToken: accessToken ?? this.accessToken,
      refreshToken: refreshToken ?? this.refreshToken,
      user: user ?? this.user,
      accessRole: accessRole ?? this.accessRole,
    );
  }
}

class SecureTokenStorage {
  SecureTokenStorage(this._storage);

  static const _accessTokenKey = 'access_token';
  static const _refreshTokenKey = 'refresh_token';
  static const _userKey = 'user';
  static const _accessRoleKey = 'access_role';

  final FlutterSecureStorage _storage;

  Future<void> saveSession(AuthSession session) async {
    await Future.wait([
      _storage.write(key: _accessTokenKey, value: session.accessToken),
      _storage.write(key: _refreshTokenKey, value: session.refreshToken),
      _storage.write(key: _userKey, value: jsonEncode(session.user.toJson())),
      _storage.write(key: _accessRoleKey, value: session.accessRole.name),
    ]);
  }

  Future<AuthSession?> readSession() async {
    final values = await Future.wait([
      _storage.read(key: _accessTokenKey),
      _storage.read(key: _refreshTokenKey),
      _storage.read(key: _userKey),
      _storage.read(key: _accessRoleKey),
    ]);
    final accessToken = values[0];
    final refreshToken = values[1];
    final rawUser = values[2];
    if (accessToken == null || refreshToken == null || rawUser == null) {
      return null;
    }
    return AuthSession(
      accessToken: accessToken,
      refreshToken: refreshToken,
      user: User.fromJson(
        Map<String, dynamic>.from(jsonDecode(rawUser) as Map),
      ),
      accessRole: UserAccessRole.fromRoute(values[3]),
    );
  }

  Future<String?> readAccessToken() => _storage.read(key: _accessTokenKey);

  Future<String?> readRefreshToken() => _storage.read(key: _refreshTokenKey);

  Future<void> updateTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await Future.wait([
      _storage.write(key: _accessTokenKey, value: accessToken),
      _storage.write(key: _refreshTokenKey, value: refreshToken),
    ]);
  }

  Future<void> clear() => _storage.deleteAll();
}
