// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_user.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_AuthUser _$AuthUserFromJson(Map<String, dynamic> json) => _AuthUser(
  id: (json['id'] as num).toInt(),
  name: json['name'] as String,
  email: json['email'] as String,
  role: $enumDecode(_$UserRoleEnumMap, json['role']),
  phone: json['phone'] as String?,
  busOperatorId: (json['busOperatorId'] as num?)?.toInt(),
);

Map<String, dynamic> _$AuthUserToJson(_AuthUser instance) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'email': instance.email,
  'role': _$UserRoleEnumMap[instance.role]!,
  'phone': instance.phone,
  'busOperatorId': instance.busOperatorId,
};

const _$UserRoleEnumMap = {
  UserRole.user: 'USER',
  UserRole.admin: 'ADMIN',
  UserRole.operator: 'OPERATOR',
};
