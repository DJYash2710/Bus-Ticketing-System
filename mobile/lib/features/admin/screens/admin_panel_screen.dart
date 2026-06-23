import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/routing/route_paths.dart';
import '../../../core/theme/app_colors.dart';

class AdminPanelScreen extends StatelessWidget {
  const AdminPanelScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Admin Panel')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const Text(
            'Securely monitor system activity and manage platform configurations.',
            style: TextStyle(color: AppColors.textSecondary),
          ),
          const SizedBox(height: 20),
          Card(
            child: ListTile(
              leading: const CircleAvatar(
                backgroundColor: AppColors.primary,
                child: Icon(Icons.history_rounded, color: Colors.white),
              ),
              title: const Text('Audit Logs',
                  style: TextStyle(fontWeight: FontWeight.w700)),
              subtitle: const Text(
                'Review administrative actions, system events, and security access logs.',
              ),
              trailing: const Icon(Icons.chevron_right_rounded),
              onTap: () => context.push('${RoutePaths.admin}/audit-logs'),
            ),
          ),
          const SizedBox(height: 12),
          const _ComingSoonCard(
            title: 'All Bookings',
            subtitle: 'Global oversight of passenger reservations.',
          ),
          const SizedBox(height: 12),
          const _ComingSoonCard(
            title: 'Reports',
            subtitle: 'Financial analytics and operational insights.',
          ),
        ],
      ),
    );
  }
}

class _ComingSoonCard extends StatelessWidget {
  const _ComingSoonCard({required this.title, required this.subtitle});

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Card(
      color: AppColors.surface,
      child: ListTile(
        leading: const Icon(Icons.lock_outline, color: AppColors.textSecondary),
        title: Row(
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text('COMING SOON', style: TextStyle(fontSize: 10)),
            ),
          ],
        ),
        subtitle: Text(subtitle),
      ),
    );
  }
}
