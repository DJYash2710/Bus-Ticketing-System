import 'package:freezed_annotation/freezed_annotation.dart';

part 'user_profile.freezed.dart';
part 'user_profile.g.dart';

@freezed
sealed class UserProfile with _$UserProfile {
  const factory UserProfile({
    required int id,
    required String name,
    required String email,
    String? phone,
    @Default(0) double creditsBalance,
    String? referralCode,
  }) = _UserProfile;

  factory UserProfile.fromJson(Map<String, dynamic> json) =>
      _$UserProfileFromJson(json);
}
