import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../constants/app_constants.dart';
import '../storage/secure_token_storage.dart';
import '../storage/storage_providers.dart';

final dioProvider = Provider<Dio>((ref) {
  final tokenStorage = ref.watch(secureTokenStorageProvider);
  final dio = Dio(
    BaseOptions(
      baseUrl: AppConstants.apiBaseUrl,
      connectTimeout: const Duration(seconds: 20),
      receiveTimeout: const Duration(seconds: 30),
      headers: {'Accept': 'application/json'},
    ),
  );

  dio.interceptors.add(
    LogInterceptor(
      requestBody: true,
      responseBody: true,
      error: true,
      logPrint: (object) {
        assert(() {
          // Visible only in debug/profile console output. Helps verify that
          // add-school calls are reaching the API instead of local mocks.
          // ignore: avoid_print
          print(object);
          return true;
        }());
      },
    ),
  );
  dio.interceptors.add(AuthInterceptor(dio, tokenStorage));
  return dio;
});

class AuthInterceptor extends Interceptor {
  AuthInterceptor(this._dio, this._tokenStorage);

  final Dio _dio;
  final SecureTokenStorage _tokenStorage;
  Future<_AuthTokens>? _refreshFuture;

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final accessToken = await _tokenStorage.readAccessToken();
    if (accessToken != null && options.extra['skipAuth'] != true) {
      options.headers['Authorization'] = 'Bearer $accessToken';
    }
    handler.next(options);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (err.requestOptions.extra['skipAuth'] == true) {
      if (err.response?.statusCode == 401) await _tokenStorage.clear();
      handler.next(err);
      return;
    }

    if (err.response?.statusCode != 401 ||
        err.requestOptions.extra['retried'] == true) {
      handler.next(err);
      return;
    }

    final refreshToken = await _tokenStorage.readRefreshToken();
    if (refreshToken == null) {
      handler.next(err);
      return;
    }

    try {
      final tokens = await _refreshTokens(refreshToken);

      final retryOptions = err.requestOptions;
      retryOptions.extra['retried'] = true;
      retryOptions.headers['Authorization'] = 'Bearer ${tokens.accessToken}';
      final retryResponse = await _dio.fetch<dynamic>(retryOptions);
      handler.resolve(retryResponse);
    } catch (_) {
      await _tokenStorage.clear();
      handler.next(err);
    }
  }

  Future<_AuthTokens> _refreshTokens(String refreshToken) {
    return _refreshFuture ??= _requestRefresh(
      refreshToken,
    ).whenComplete(() => _refreshFuture = null);
  }

  Future<_AuthTokens> _requestRefresh(String refreshToken) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/auth/refresh',
      data: {'refreshToken': refreshToken},
      options: Options(extra: {'skipAuth': true}),
    );
    final data = response.data ?? {};
    final accessToken = data['accessToken'] as String;
    final nextRefreshToken = data['refreshToken'] as String? ?? refreshToken;
    await _tokenStorage.updateTokens(
      accessToken: accessToken,
      refreshToken: nextRefreshToken,
    );
    return _AuthTokens(accessToken);
  }
}

class _AuthTokens {
  const _AuthTokens(this.accessToken);

  final String accessToken;
}
