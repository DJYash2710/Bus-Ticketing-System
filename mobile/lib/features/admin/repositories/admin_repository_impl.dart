import '../../../core/error/result.dart';
import '../../../core/repositories/base_repository.dart';
import '../models/audit_logs_page.dart';
import '../services/admin_api_service.dart';
import 'admin_repository.dart';

class AdminRepositoryImpl extends BaseRepository implements AdminRepository {
  AdminRepositoryImpl(this._apiService);

  final AdminApiService _apiService;

  @override
  Future<Result<AuditLogsPage>> getAuditLogs({
    int page = 1,
    int limit = 20,
    String? action,
    String? entityType,
    int? actorId,
    String? fromDate,
    String? toDate,
  }) =>
      guard(
        () => _apiService.getAuditLogs(
          page: page,
          limit: limit,
          action: action,
          entityType: entityType,
          actorId: actorId,
          fromDate: fromDate,
          toDate: toDate,
        ),
      );
}
