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

  bool _isRefreshing = false;

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

    try {
      if (_isRefreshing) {
        return handler.next(err);
      }

      _isRefreshing = true;
      final refreshToken = await _storage.refreshToken;
      if (refreshToken == null || refreshToken.isEmpty) {
        await _storage.clearTokens();
        return handler.next(err);
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
        return handler.next(err);
      }

      await _storage.saveTokens(
        accessToken: accessToken,
        refreshToken: newRefreshToken,
      );

      final retryOptions = err.requestOptions;
      retryOptions.headers['Authorization'] = 'Bearer $accessToken';

      final retryResponse = await _dio.fetch<dynamic>(retryOptions);
      return handler.resolve(retryResponse);
    } catch (e, st) {
      appLogger.e('Token refresh failed', error: e, stackTrace: st);
      await _storage.clearTokens();
      return handler.next(err);
    } finally {
      _isRefreshing = false;
    }
  }
}
