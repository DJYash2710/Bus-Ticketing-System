import '../../../core/constants/api_constants.dart';
import '../../../core/services/base_api_service.dart';
import '../models/audit_logs_page.dart';

class AdminApiService extends BaseApiService {
  AdminApiService(super.dio);

  Future<AuditLogsPage> getAuditLogs({
    int page = 1,
    int limit = 20,
    String? action,
    String? entityType,
    int? actorId,
    String? fromDate,
    String? toDate,
  }) =>
      get(
        '${ApiConstants.admin}/audit-logs',
        queryParameters: {
          'page': page,
          'limit': limit,
          'action': ?action,
          'entityType': ?entityType,
          'actorId': ?actorId,
          'fromDate': ?fromDate,
          'toDate': ?toDate,
        },
        parser: (json) => AuditLogsPage.fromJson(json as Map<String, dynamic>),
      );
}
