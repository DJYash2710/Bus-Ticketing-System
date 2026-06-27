import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/utils/debounce.dart';
import '../../../shared/widgets/app_header.dart';
import '../models/audit_logs_page.dart';
import '../providers/admin_providers.dart';

class AuditLogsScreen extends ConsumerStatefulWidget {
  const AuditLogsScreen({super.key});

  @override
  ConsumerState<AuditLogsScreen> createState() => _AuditLogsScreenState();
}

class _AuditLogsScreenState extends ConsumerState<AuditLogsScreen> {
  int _page = 1;
  final _searchController = TextEditingController();
  final _debouncer = Debouncer();
  String _searchQuery = '';
  String? _actionFilter;
  String? _entityFilter;

  @override
  void dispose() {
    _debouncer.dispose();
    _searchController.dispose();
    super.dispose();
  }

  AuditLogsQuery get _query => AuditLogsQuery(
        page: _page,
        action: _actionFilter,
        entityType: _entityFilter,
      );

  Future<void> _openFilters() async {
    final action = TextEditingController(text: _actionFilter ?? '');
    final entity = TextEditingController(text: _entityFilter ?? '');
    await showModalBottomSheet<void>(
      context: context,
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: action,
              decoration: const InputDecoration(labelText: 'Action filter'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: entity,
              decoration: const InputDecoration(labelText: 'Entity type filter'),
            ),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: () {
                setState(() {
                  _actionFilter =
                      action.text.trim().isEmpty ? null : action.text.trim();
                  _entityFilter =
                      entity.text.trim().isEmpty ? null : entity.text.trim();
                  _page = 1;
                });
                Navigator.pop(ctx);
              },
              child: const Text('Apply filters'),
            ),
          ],
        ),
      ),
    );
  }

  bool _matchesSearch(AuditLogItem log) {
    if (_searchQuery.isEmpty) return true;
    final q = _searchQuery.toLowerCase();
    return log.action.toLowerCase().contains(q) ||
        log.entityType.toLowerCase().contains(q) ||
        '${log.entityId ?? ''}'.contains(q) ||
        '${log.id}'.contains(q);
  }

  @override
  Widget build(BuildContext context) {
    final logsAsync = ref.watch(auditLogsProvider(_query));

    return Scaffold(
      appBar: const AppHeader(showBack: true),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
            child: Text('Audit Logs',
                style: Theme.of(context).textTheme.headlineMedium),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search logs by ID, Actor, or Entity...',
                prefixIcon: const Icon(Icons.search_rounded),
                suffixIcon: IconButton(
                  onPressed: _openFilters,
                  icon: const Icon(Icons.tune_rounded),
                ),
              ),
              onChanged: (value) {
                _debouncer.call(() {
                  if (mounted) {
                    setState(() => _searchQuery = value.trim());
                  }
                });
              },
            ),
          ),
          Expanded(
            child: logsAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Error: $e')),
              data: (page) {
                final visible =
                    page.logs.where(_matchesSearch).toList();
                return Column(
                  children: [
                    Expanded(
                      child: ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: visible.length,
                        itemBuilder: (context, i) {
                          final log = visible[i];
                          return Card(
                            margin: const EdgeInsets.only(bottom: 8),
                            child: ListTile(
                              leading: CircleAvatar(
                                backgroundColor:
                                    AppColors.primary.withValues(alpha: 0.12),
                                child: const Icon(Icons.history,
                                    color: AppColors.primary, size: 20),
                              ),
                              title: Text(
                                log.action,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(fontWeight: FontWeight.w600),
                              ),
                              subtitle: Text(
                                'ENTITY: ${log.entityType} • ID: ${log.entityId ?? '-'}',
                              ),
                              trailing: const Icon(Icons.expand_more_rounded),
                            ),
                          );
                        },
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          Text(
                            'Showing ${visible.length} of ${page.total} entries',
                            style: const TextStyle(fontSize: 12),
                          ),
                          const Spacer(),
                          IconButton(
                            onPressed: _page > 1
                                ? () => setState(() => _page--)
                                : null,
                            icon: const Icon(Icons.chevron_left_rounded),
                          ),
                          Text('$_page'),
                          IconButton(
                            onPressed: _page < page.totalPages
                                ? () => setState(() => _page++)
                                : null,
                            icon: const Icon(Icons.chevron_right_rounded),
                          ),
                        ],
                      ),
                    ),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
