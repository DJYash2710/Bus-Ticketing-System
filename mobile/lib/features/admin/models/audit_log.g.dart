// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'audit_log.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_AuditLog _$AuditLogFromJson(Map<String, dynamic> json) => _AuditLog(
  id: (json['id'] as num).toInt(),
  action: json['action'] as String,
  entityType: json['entityType'] as String,
  entityId: (json['entityId'] as num?)?.toInt(),
  actorId: (json['actorId'] as num?)?.toInt(),
  metadata: json['metadata'] as Map<String, dynamic>?,
  createdAt: const NullableDateTimeConverter().fromJson(
    json['createdAt'] as String?,
  ),
);

Map<String, dynamic> _$AuditLogToJson(_AuditLog instance) => <String, dynamic>{
  'id': instance.id,
  'action': instance.action,
  'entityType': instance.entityType,
  'entityId': instance.entityId,
  'actorId': instance.actorId,
  'metadata': instance.metadata,
  'createdAt': const NullableDateTimeConverter().toJson(instance.createdAt),
};
