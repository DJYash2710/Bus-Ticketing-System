import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/app_header.dart';
import '../providers/loyalty_providers.dart';

class LoyaltyHistoryScreen extends ConsumerWidget {
  const LoyaltyHistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final history = ref.watch(loyaltyHistoryProvider);

    return Scaffold(
      appBar: const AppHeader(showBack: true, title: 'Loyalty History'),
      body: history.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (events) => events.isEmpty
            ? const Center(child: Text('No loyalty activity yet'))
            : ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: events.length,
                itemBuilder: (context, i) {
                  final event = events[i];
                  final earned = event.credits > 0;
                  return Card(
                    child: ListTile(
                      leading: Icon(
                        earned ? Icons.add_circle_outline : Icons.remove_circle_outline,
                        color: earned ? Colors.green : Colors.orange,
                      ),
                      title: Text(
                        '${earned ? '+' : ''}${event.credits} points',
                        style: const TextStyle(fontWeight: FontWeight.w700),
                      ),
                      subtitle: Text(
                        event.description ?? event.type.replaceAll('_', ' '),
                      ),
                      trailing: event.createdAt != null
                          ? Text(
                              formatDateTime(event.createdAt!),
                              style: const TextStyle(fontSize: 11),
                            )
                          : null,
                    ),
                  );
                },
              ),
      ),
    );
  }
}
