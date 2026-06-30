import 'package:dio/dio.dart';

import '../../constants/api_constants.dart';
import '../../storage/secure_storage_service.dart';
import '../../utils/logger.dart';

/// Queues failed requests while refreshing an expired access token.
class RefreshTokenInterceptor extends QueuedInterceptor {
  RefreshTokenInterceptor({
    required this._storage,
    required this._dio,
  });

  final SecureStorageService _storage;
  final Dio _dio;

  Future<String>? _refreshFuture;

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (err.response?.statusCode != 401) {
      return handler.next(err);
    }

    final path = err.requestOptions.path;
    if (path.contains(ApiConstants.authLogin) ||
        path.contains(ApiConstants.authRefresh)) {
      return handler.next(err);
    }

    if (err.requestOptions.extra['skipAuthRefresh'] == true) {
      return handler.next(err);
    }

    try {
      final accessToken = await _refreshAccessToken();

      final retryOptions = err.requestOptions;
      retryOptions.headers['Authorization'] = 'Bearer $accessToken';

      final retryResponse = await _dio.fetch<dynamic>(retryOptions);
      return handler.resolve(retryResponse);
    } catch (e, st) {
      appLogger.e('Token refresh failed', error: e, stackTrace: st);
      final keepSession = e is DioException &&
          (e.type == DioExceptionType.connectionError ||
              e.type == DioExceptionType.connectionTimeout ||
              e.type == DioExceptionType.receiveTimeout ||
              e.type == DioExceptionType.sendTimeout);
      if (!keepSession) {
        await _storage.clearTokens();
      }
      return handler.next(err);
    }
  }

  Future<String> _refreshAccessToken() {
    return _refreshFuture ??= _performRefresh().whenComplete(() {
      _refreshFuture = null;
    });
  }

  Future<String> _performRefresh() async {
    final refreshToken = await _storage.refreshToken;
    if (refreshToken == null || refreshToken.isEmpty) {
      await _storage.clearTokens();
      throw StateError('No refresh token');
    }

    final response = await _dio.post<Map<String, dynamic>>(
      ApiConstants.authRefresh,
      data: {'refreshToken': refreshToken},
      options: Options(extra: {'skipAuthRefresh': true}),
    );

    final data = response.data?['data'] as Map<String, dynamic>?;
    final tokens = data?['tokens'] as Map<String, dynamic>?;
    final accessToken = tokens?['accessToken'] as String?;
    final newRefreshToken = tokens?['refreshToken'] as String?;

    if (accessToken == null || newRefreshToken == null) {
      await _storage.clearTokens();
      throw StateError('Refresh response missing tokens');
    }

    await _storage.saveTokens(
      accessToken: accessToken,
      refreshToken: newRefreshToken,
    );

    return accessToken;
  }
}
