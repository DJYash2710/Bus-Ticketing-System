// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_profile.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_UserProfile _$UserProfileFromJson(Map<String, dynamic> json) => _UserProfile(
  id: (json['id'] as num).toInt(),
  name: json['name'] as String,
  email: json['email'] as String,
  phone: json['phone'] as String?,
  creditsBalance: (json['creditsBalance'] as num?)?.toDouble() ?? 0,
  referralCode: json['referralCode'] as String?,
);

Map<String, dynamic> _$UserProfileToJson(_UserProfile instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'email': instance.email,
      'phone': instance.phone,
      'creditsBalance': instance.creditsBalance,
      'referralCode': instance.referralCode,
    };
