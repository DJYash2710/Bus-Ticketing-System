import 'package:dio/dio.dart';

import '../extensions/dio_extensions.dart';

/// Base class for thin API service wrappers around Dio.
abstract class BaseApiService {
  const BaseApiService(this._dio);

  final Dio _dio;

  Dio get dio => _dio;

  Future<T> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    T Function(dynamic json)? parser,
  }) async {
    try {
      final response = await _dio.get<dynamic>(
        path,
        queryParameters: queryParameters,
      );
      final data = response.requireData<dynamic>();
      if (parser != null) return parser(data);
      return data as T;
    } on DioException catch (e) {
      throw e.toApiException();
    }
  }

  Future<T> post<T>(
    String path, {
    Object? data,
    Map<String, dynamic>? queryParameters,
    T Function(dynamic json)? parser,
  }) async {
    try {
      final response = await _dio.post<dynamic>(
        path,
        data: data,
        queryParameters: queryParameters,
      );
      final body = response.requireData<dynamic>();
      if (parser != null) return parser(body);
      return body as T;
    } on DioException catch (e) {
      throw e.toApiException();
    }
  }

  Future<T> patch<T>(
    String path, {
    Object? data,
    T Function(dynamic json)? parser,
  }) async {
    try {
      final response = await _dio.patch<dynamic>(path, data: data);
      final body = response.requireData<dynamic>();
      if (parser != null) return parser(body);
      return body as T;
    } on DioException catch (e) {
      throw e.toApiException();
    }
  }

  Future<T> delete<T>(
    String path, {
    T Function(dynamic json)? parser,
  }) async {
    try {
      final response = await _dio.delete<dynamic>(path);
      final body = response.requireData<dynamic>();
      if (parser != null) return parser(body);
      return body as T;
    } on DioException catch (e) {
      throw e.toApiException();
    }
  }
}
