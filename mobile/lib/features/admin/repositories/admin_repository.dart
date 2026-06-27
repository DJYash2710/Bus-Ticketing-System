import '../../../core/error/result.dart';
import '../models/audit_logs_page.dart';

abstract interface class AdminRepository {
  Future<Result<AuditLogsPage>> getAuditLogs({
    int page,
    int limit,
    String? action,
    String? entityType,
    int? actorId,
    String? fromDate,
    String? toDate,
  });
}
