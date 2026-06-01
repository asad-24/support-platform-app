import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';

import '../../../core/errors/app_exception.dart';
import '../../../core/network/api_client.dart';
import '../../../core/storage/secure_token_storage.dart';
import '../../../core/storage/storage_providers.dart';
import '../../../shared/models/app_enums.dart';
import '../../../shared/models/user.dart';
import '../../../shared/models/user_access_role.dart';
import '../auth_validators.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return ApiAuthRepository(
    ref.watch(dioProvider),
    ref.watch(secureTokenStorageProvider),
  );
});

abstract class AuthRepository {
  Future<AuthSession?> restoreSession();

  Future<bool> isUsernameAvailable(String username);

  Future<VolunteerApplicationResult> submitVolunteerApplication(
    VolunteerApplication application,
  );

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
    required String ward,
    required String address,
    String? profileImagePath,
  });

  Future<void> changePassword({
    required AuthSession session,
    required String currentPassword,
    required String newPassword,
  });

  Future<void> logout();
}

class VolunteerApplication {
  const VolunteerApplication({
    required this.fullName,
    required this.email,
    required this.phone,
    required this.dateOfBirth,
    required this.gender,
    required this.state,
    required this.lga,
    required this.address,
    required this.educationLevel,
    required this.occupation,
    required this.skills,
    required this.volunteerExperience,
    required this.availability,
    required this.volunteeringMode,
    required this.motivation,
    required this.emergencyContactName,
    required this.emergencyContactPhone,
  });

  final String fullName;
  final String email;
  final String phone;
  final String dateOfBirth;
  final String gender;
  final String state;
  final String lga;
  final String address;
  final String educationLevel;
  final String occupation;
  final String skills;
  final String volunteerExperience;
  final String availability;
  final String volunteeringMode;
  final String motivation;
  final String emergencyContactName;
  final String emergencyContactPhone;

  Map<String, dynamic> toJson() => {
    'fullName': fullName,
    'email': email,
    'phone': phone,
    'dateOfBirth': dateOfBirth,
    'gender': gender,
    'state': state,
    'lga': lga,
    'address': address,
    'educationLevel': educationLevel,
    'occupation': occupation,
    'skills': skills,
    'volunteerExperience': volunteerExperience,
    'availability': availability,
    'volunteeringMode': volunteeringMode,
    'motivation': motivation,
    'emergencyContactName': emergencyContactName,
    'emergencyContactPhone': emergencyContactPhone,
  };
}

class VolunteerApplicationResult {
  const VolunteerApplicationResult({
    required this.requestId,
    required this.submittedAt,
    required this.status,
  });

  final String requestId;
  final DateTime submittedAt;
  final String status;
}

class ApiAuthRepository implements AuthRepository {
  ApiAuthRepository(this._dio, this._tokenStorage);

  final Dio _dio;
  final SecureTokenStorage _tokenStorage;

  @override
  Future<AuthSession?> restoreSession() async {
    final stored = await _tokenStorage.readSession();
    if (stored == null) return null;

    try {
      final response = await _dio.get<Map<String, dynamic>>('/users/me');
      final restored = stored.copyWith(
        user: User.fromJson(response.data ?? {}),
      );
      await _tokenStorage.saveSession(restored);
      return restored;
    } catch (_) {
      await _tokenStorage.clear();
      return null;
    }
  }

  @override
  Future<bool> isUsernameAvailable(String username) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(
        '/auth/username-available',
        queryParameters: {'username': username},
        options: Options(extra: {'skipAuth': true}),
      );
      return response.data?['available'] as bool? ?? false;
    } catch (error) {
      throw _exceptionFrom(error);
    }
  }

  @override
  Future<VolunteerApplicationResult> submitVolunteerApplication(
    VolunteerApplication application,
  ) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/volunteer-applications',
        data: application.toJson(),
        options: Options(extra: {'skipAuth': true}),
      );
      final data = response.data ?? {};
      return VolunteerApplicationResult(
        requestId: data['requestId'] as String? ?? '',
        status: data['status'] as String? ?? 'pending',
        submittedAt:
            DateTime.tryParse('${data['submittedAt']}') ?? DateTime.now(),
      );
    } catch (error) {
      throw _exceptionFrom(error);
    }
  }

  @override
  Future<AuthSession> login({
    required String identifier,
    required String password,
    required UserAccessRole accessRole,
  }) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/auth/login',
        data: {
          'identifier': identifier,
          'password': password,
          'accessRole': accessRole.name,
        },
        options: Options(extra: {'skipAuth': true}),
      );
      final session = _sessionFromJson(response.data ?? {});
      await _tokenStorage.saveSession(session);
      return session;
    } catch (error) {
      throw _exceptionFrom(error);
    }
  }

  @override
  Future<AuthSession> signup({
    required String username,
    required String email,
    required String password,
    required UserAccessRole accessRole,
  }) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/auth/signup',
        data: {
          'username': username,
          'email': email,
          'password': password,
          'accessRole': accessRole.name,
        },
        options: Options(extra: {'skipAuth': true}),
      );
      final session = _sessionFromJson(response.data ?? {});
      await _tokenStorage.saveSession(session);
      return session;
    } catch (error) {
      throw _exceptionFrom(error);
    }
  }

  @override
  Future<AuthSession> updateVolunteerProfile({
    required AuthSession session,
    required String name,
    required String phone,
    required String state,
    required String lga,
    required String ward,
    required String address,
    String? profileImagePath,
  }) async {
    try {
      final formData = FormData.fromMap({
        'fullName': name,
        'phone': phone,
        'state': state,
        'lga': lga,
        'ward': ward,
        'address': address,
      });

      // Add profile image if provided
      if (profileImagePath != null && profileImagePath.isNotEmpty) {
        final file = await MultipartFile.fromFile(
          profileImagePath,
          filename: 'profile_image.jpg',
        );
        formData.files.add(MapEntry('profileImage', file));
      }

      final response = await _dio.patch<Map<String, dynamic>>(
        '/users/me/volunteer-profile',
        data: formData,
      );
      final updated = session.copyWith(
        user: User.fromJson(response.data ?? {}),
      );
      await _tokenStorage.saveSession(updated);
      return updated;
    } catch (error) {
      throw _exceptionFrom(error);
    }
  }

  @override
  Future<void> changePassword({
    required AuthSession session,
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      await _dio.post<Map<String, dynamic>>(
        '/auth/change-password',
        data: {'currentPassword': currentPassword, 'newPassword': newPassword},
      );
    } catch (error) {
      throw _exceptionFrom(error);
    }
  }

  @override
  Future<void> logout() async {
    final session = await _tokenStorage.readSession();
    try {
      if (session != null) {
        await _dio.post<Map<String, dynamic>>(
          '/auth/logout',
          data: {'refreshToken': session.refreshToken},
        );
      }
    } catch (_) {
      // Local logout must still clear stale tokens.
    }
    await _tokenStorage.clear();
  }

  AuthSession _sessionFromJson(Map<String, dynamic> data) {
    return AuthSession(
      accessToken: data['accessToken'] as String,
      refreshToken: data['refreshToken'] as String,
      accessRole: UserAccessRole.fromRoute(data['accessRole'] as String?),
      user: User.fromJson(Map<String, dynamic>.from(data['user'] as Map)),
    );
  }

  AppException _exceptionFrom(Object error) {
    if (error is! DioException) return AppException(error.toString());
    final response = error.response;
    final data = response?.data;
    if (data is Map && data['error'] is Map) {
      final err = Map<String, dynamic>.from(data['error'] as Map);
      return AppException(
        err['message'] as String? ?? 'Request failed.',
        code: err['code'] as String?,
      );
    }
    if (data is Map && data['error'] is String) {
      return AppException(data['error'] as String);
    }
    return AppException(error.toString());
  }
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
  Future<VolunteerApplicationResult> submitVolunteerApplication(
    VolunteerApplication application,
  ) async {
    await Future<void>.delayed(const Duration(milliseconds: 700));
    final values = application.toJson().values.map((value) => '$value'.trim());
    final allRequiredFilled = values.every((value) => value.isNotEmpty);
    if (!allRequiredFilled ||
        !AuthValidators.isValidEmail(application.email) ||
        application.fullName.trim().length < 2 ||
        application.phone.trim().length < 7 ||
        application.emergencyContactPhone.trim().length < 7) {
      throw const AppException('Complete all required volunteer details.');
    }

    return VolunteerApplicationResult(
      requestId: 'volunteer-request-${_uuid.v4().substring(0, 8)}',
      submittedAt: DateTime.now(),
      status: 'pending',
    );
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
        dateOfBirth: accessRole == UserAccessRole.volunteer
            ? '1994-05-14'
            : null,
        gender: accessRole == UserAccessRole.volunteer ? 'Male' : null,
        educationLevel: accessRole == UserAccessRole.volunteer
            ? 'Tertiary'
            : null,
        occupation: accessRole == UserAccessRole.volunteer
            ? 'Community volunteer'
            : null,
        skills: accessRole == UserAccessRole.volunteer
            ? 'Community outreach, data collection, Hausa and English'
            : null,
        volunteerExperience: accessRole == UserAccessRole.volunteer
            ? 'Two years supporting school mapping and welfare outreach.'
            : null,
        availability: accessRole == UserAccessRole.volunteer
            ? 'Weekends and selected weekdays'
            : null,
        volunteeringMode: accessRole == UserAccessRole.volunteer
            ? 'Field visits'
            : null,
        motivation: accessRole == UserAccessRole.volunteer
            ? 'Improve support visibility for underserved learning centres.'
            : null,
        emergencyContactName: accessRole == UserAccessRole.volunteer
            ? 'Amina Sule'
            : null,
        emergencyContactPhone: accessRole == UserAccessRole.volunteer
            ? '+2348091112233'
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
    required String ward,
    required String address,
    String? profileImagePath,
  }) async {
    await Future<void>.delayed(const Duration(milliseconds: 450));
    if (name.trim().length < 2 ||
        phone.trim().length < 7 ||
        state.trim().isEmpty ||
        lga.trim().isEmpty ||
        address.trim().length < 4) {
      throw const AppException(
        'Complete your name, phone, location, and address.',
      );
    }

    final updated = session.copyWith(
      user: session.user.copyWith(
        name: name.trim(),
        phone: phone.trim(),
        state: state.trim(),
        lga: lga.trim(),
        ward: ward.trim(),
        address: address.trim(),
        profileImagePath: profileImagePath,
        profileComplete: true,
      ),
    );
    await _tokenStorage.saveSession(updated);
    return updated;
  }

  @override
  Future<void> changePassword({
    required AuthSession session,
    required String currentPassword,
    required String newPassword,
  }) async {
    await Future<void>.delayed(const Duration(milliseconds: 500));
    if (!AuthValidators.isValidPassword(currentPassword) ||
        !AuthValidators.isValidPassword(newPassword) ||
        currentPassword == newPassword) {
      throw const AppException(
        'Use your current password and choose a different strong password.',
      );
    }
  }

  @override
  Future<void> logout() => _tokenStorage.clear();
}
