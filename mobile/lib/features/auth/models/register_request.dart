import 'package:freezed_annotation/freezed_annotation.dart';

part 'register_request.freezed.dart';
part 'register_request.g.dart';

@freezed
sealed class RegisterRequest with _$RegisterRequest {
  const factory RegisterRequest({
    required String name,
    required String email,
    required String password,
    required String phone,
    @JsonKey(includeIfNull: false) String? referralCode,
  }) = _RegisterRequest;

  factory RegisterRequest.fromJson(Map<String, dynamic> json) =>
      _$RegisterRequestFromJson(json);
}
