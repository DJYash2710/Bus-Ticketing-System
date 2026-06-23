/// Maps HTTP status codes and Dio errors into domain-friendly exceptions.
class ApiException implements Exception {
  const ApiException({
    required this.message,
    this.statusCode,
    this.details,
  });

  final String message;
  final int? statusCode;
  final dynamic details;

  bool get isUnauthorized => statusCode == 401;
  bool get isForbidden => statusCode == 403;
  bool get isNotFound => statusCode == 404;
  bool get isValidationError => statusCode == 400;

  @override
  String toString() =>
      'ApiException(statusCode: $statusCode, message: $message)';
}
