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

final auditLogsPageProvider =
    FutureProvider.family<AuditLogsPage, int>((ref, page) async {
  final result =
      await ref.watch(adminRepositoryProvider).getAuditLogs(page: page);
  return switch (result) {
    Success(:final value) => value,
    Error(:final failure) => throw failure,
  };
});
