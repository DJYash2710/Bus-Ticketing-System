import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/error/result.dart';
import '../../../shared/providers/core_providers.dart';
import '../models/audit_logs_page.dart';
import '../repositories/admin_repository.dart';
import '../repositories/admin_repository_impl.dart';
import '../services/admin_api_service.dart';

final adminApiServiceProvider = Provider(
  (ref) => AdminApiService(ref.watch(dioProvider)),
);

final adminRepositoryProvider = Provider<AdminRepository>(
  (ref) => AdminRepositoryImpl(ref.watch(adminApiServiceProvider)),
);

class AuditLogsQuery {
  const AuditLogsQuery({
    required this.page,
    this.action,
    this.entityType,
    this.actorId,
    this.fromDate,
    this.toDate,
  });

  final int page;
  final String? action;
  final String? entityType;
  final int? actorId;
  final String? fromDate;
  final String? toDate;

  @override
  bool operator ==(Object other) =>
      other is AuditLogsQuery &&
      page == other.page &&
      action == other.action &&
      entityType == other.entityType &&
      actorId == other.actorId &&
      fromDate == other.fromDate &&
      toDate == other.toDate;

  @override
  int get hashCode =>
      Object.hash(page, action, entityType, actorId, fromDate, toDate);
}

final auditLogsProvider =
    FutureProvider.family<AuditLogsPage, AuditLogsQuery>((ref, query) async {
  final result = await ref.watch(adminRepositoryProvider).getAuditLogs(
        page: query.page,
        action: query.action,
        entityType: query.entityType,
        actorId: query.actorId,
        fromDate: query.fromDate,
        toDate: query.toDate,
      );
  return switch (result) {
    Success(:final value) => value,
    Error(:final failure) => throw failure,
  };
});

// Backwards-compatible alias
final auditLogsPageProvider =
    FutureProvider.family<AuditLogsPage, int>((ref, page) async {
  return ref.watch(auditLogsProvider(AuditLogsQuery(page: page)).future);
});
