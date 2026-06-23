import 'package:dio/dio.dart';

import '../../config/app_config.dart';
import 'interceptors/auth_interceptor.dart';
import 'interceptors/logging_interceptor.dart';
import 'interceptors/refresh_token_interceptor.dart';
import '../storage/secure_storage_service.dart';

/// Factory for a configured [Dio] instance with auth and refresh interceptors.
class DioClient {
  DioClient({
    required SecureStorageService storage,
    LoggingInterceptor? loggingInterceptor,
  }) {
    _dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.apiBaseUrl,
        connectTimeout: AppConfig.connectTimeout,
        receiveTimeout: AppConfig.receiveTimeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    _dio.interceptors.addAll([
      AuthInterceptor(storage),
      RefreshTokenInterceptor(storage: storage, dio: _dio),
      loggingInterceptor ?? LoggingInterceptor(),
    ]);
  }

  late final Dio _dio;

  Dio get instance => _dio;
}
