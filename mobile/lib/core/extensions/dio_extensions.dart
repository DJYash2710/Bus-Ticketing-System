import 'package:dio/dio.dart';

import '../error/api_exception.dart';

extension DioExceptionX on DioException {
  ApiException toApiException() {
    final responseData = response?.data;
    final statusCode = response?.statusCode;

    String message = 'Network request failed';
    dynamic details;

    if (responseData is Map<String, dynamic>) {
      message = responseData['message'] as String? ?? message;
      details = responseData['details'] ?? responseData['errors'];
    } else if (type == DioExceptionType.connectionTimeout ||
        type == DioExceptionType.receiveTimeout ||
        type == DioExceptionType.sendTimeout) {
      message = 'Request timed out';
    } else if (type == DioExceptionType.connectionError) {
      message = 'No internet connection';
    }

    return ApiException(
      message: message,
      statusCode: statusCode,
      details: details,
    );
  }
}

extension ResponseX on Response<dynamic> {
  T requireData<T>() {
    final body = data;
    if (body is Map<String, dynamic> && body.containsKey('data')) {
      return body['data'] as T;
    }
    return body as T;
  }
}
