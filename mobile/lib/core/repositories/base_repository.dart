import 'package:dio/dio.dart';

import '../error/api_exception.dart';
import '../error/failure.dart';
import '../error/result.dart';
import '../extensions/dio_extensions.dart';

/// Base class for repositories. Wraps API calls with consistent error mapping.
abstract class BaseRepository {
  const BaseRepository();

  Future<Result<T>> guard<T>(Future<T> Function() action) async {
    try {
      final value = await action();
      return Success(value);
    } on ApiException catch (e) {
      return Error(_mapApiException(e));
    } on DioException catch (e) {
      return Error(_mapApiException(e.toApiException()));
    } catch (e) {
      return Error(Failure.unknown(message: e.toString()));
    }
  }

  Failure _mapApiException(ApiException e) {
    return switch (e.statusCode) {
      400 => Failure.validation(
          message: e.message,
          details: e.details is Map<String, dynamic>
              ? e.details as Map<String, dynamic>
              : null,
        ),
      401 => Failure.unauthorized(message: e.message),
      403 => Failure.forbidden(message: e.message),
      404 => Failure.notFound(message: e.message),
      null => Failure.network(message: e.message),
      _ => Failure.server(message: e.message, statusCode: e.statusCode),
    };
  }
}
