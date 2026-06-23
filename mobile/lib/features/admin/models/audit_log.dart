import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../core/utils/json_converters.dart';

part 'audit_log.freezed.dart';
part 'audit_log.g.dart';

@freezed
sealed class AuditLog with _$AuditLog {
  const factory AuditLog({
    required int id,
    required String action,
    required String entityType,
    int? entityId,
    int? actorId,
    Map<String, dynamic>? metadata,
    @NullableDateTimeConverter() DateTime? createdAt,
  }) = _AuditLog;

  factory AuditLog.fromJson(Map<String, dynamic> json) =>
      _$AuditLogFromJson(json);
}
