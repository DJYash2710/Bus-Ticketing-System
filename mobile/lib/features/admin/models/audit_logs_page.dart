class AuditLogItem {
  const AuditLogItem({
    required this.id,
    required this.action,
    required this.entityType,
    this.entityId,
    this.actorId,
    this.createdAt,
    this.metadata,
  });

  final int id;
  final String action;
  final String entityType;
  final int? entityId;
  final int? actorId;
  final DateTime? createdAt;
  final Map<String, dynamic>? metadata;

  factory AuditLogItem.fromJson(Map<String, dynamic> json) => AuditLogItem(
        id: (json['id'] as num).toInt(),
        action: json['action'] as String,
        entityType: json['entityType'] as String,
        entityId: (json['entityId'] as num?)?.toInt(),
        actorId: (json['actorId'] as num?)?.toInt(),
        createdAt: json['createdAt'] != null
            ? DateTime.parse(json['createdAt'] as String).toLocal()
            : null,
        metadata: json['metadata'] as Map<String, dynamic>?,
      );
}

class AuditLogsPage {
  const AuditLogsPage({
    required this.logs,
    required this.page,
    required this.total,
    required this.totalPages,
  });

  final List<AuditLogItem> logs;
  final int page;
  final int total;
  final int totalPages;

  factory AuditLogsPage.fromJson(Map<String, dynamic> json) {
    final pagination = json['pagination'] as Map<String, dynamic>;
    return AuditLogsPage(
      logs: (json['logs'] as List<dynamic>)
          .map((e) => AuditLogItem.fromJson(e as Map<String, dynamic>))
          .toList(),
      page: (pagination['page'] as num).toInt(),
      total: (pagination['total'] as num).toInt(),
      totalPages: (pagination['totalPages'] as num).toInt(),
    );
  }
}
