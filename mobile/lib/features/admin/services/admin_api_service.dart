import '../../../core/constants/api_constants.dart';
import '../../../core/services/base_api_service.dart';
import '../models/audit_logs_page.dart';

class AdminApiService extends BaseApiService {
  AdminApiService(super.dio);

  Future<AuditLogsPage> getAuditLogs({int page = 1, int limit = 20}) => get(
        '${ApiConstants.admin}/audit-logs',
        queryParameters: {'page': page, 'limit': limit},
        parser: (json) => AuditLogsPage.fromJson(json as Map<String, dynamic>),
      );
}
