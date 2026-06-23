import 'package:freezed_annotation/freezed_annotation.dart';

part 'failure.freezed.dart';

@freezed
sealed class Failure with _$Failure {
  const factory Failure.network({required String message}) = NetworkFailure;

  const factory Failure.unauthorized({String? message}) = UnauthorizedFailure;

  const factory Failure.forbidden({String? message}) = ForbiddenFailure;

  const factory Failure.notFound({String? message}) = NotFoundFailure;

  const factory Failure.validation({
    required String message,
    Map<String, dynamic>? details,
  }) = ValidationFailure;

  const factory Failure.server({required String message, int? statusCode}) =
      ServerFailure;

  const factory Failure.unknown({String? message}) = UnknownFailure;
}
