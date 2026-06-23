import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/routing/route_paths.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/models/user_role.dart';
import '../../../shared/widgets/app_header.dart';
import '../../auth/providers/auth_providers.dart';
import '../providers/profile_providers.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authStateProvider);
    final profile = ref.watch(userProfileProvider);

    return Scaffold(
      appBar: const AppHeader(),
      body: profile.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (user) => ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 40,
                      backgroundColor: AppColors.primary.withValues(alpha: 0.15),
                      child: Text(
                        user.name.isNotEmpty ? user.name[0].toUpperCase() : '?',
                        style: const TextStyle(
                          fontSize: 28,
                          color: AppColors.primary,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(user.name,
                        style: Theme.of(context).textTheme.titleLarge),
                    Text(user.email),
                    if (user.phone != null) ...[
                      const SizedBox(height: 8),
                      Chip(label: Text(user.phone!)),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            _MenuTile(
              icon: Icons.edit_outlined,
              label: 'Edit Profile',
              onTap: () => context.push(RoutePaths.profileEdit),
            ),
            _MenuTile(
              icon: Icons.confirmation_number_outlined,
              label: 'My Trips',
              onTap: () => context.go(RoutePaths.bookings),
            ),
            _MenuTile(
              icon: Icons.wallet_outlined,
              label: 'Loyalty Balance',
              trailing: Text(
                '₹${user.creditsBalance.toInt()}',
                style: const TextStyle(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w700,
                ),
              ),
              onTap: () {},
            ),
            if (auth.user?.role == UserRole.admin)
              _MenuTile(
                icon: Icons.admin_panel_settings_outlined,
                label: 'Admin Panel',
                highlight: true,
                onTap: () => context.push(RoutePaths.admin),
              ),
            const SizedBox(height: 8),
            _MenuTile(
              icon: Icons.logout_rounded,
              label: 'Logout',
              destructive: true,
              onTap: () async {
                await ref.read(authStateProvider.notifier).logout();
                if (context.mounted) context.go(RoutePaths.login);
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _MenuTile extends StatelessWidget {
  const _MenuTile({
    required this.icon,
    required this.label,
    required this.onTap,
    this.trailing,
    this.highlight = false,
    this.destructive = false,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final Widget? trailing;
  final bool highlight;
  final bool destructive;

  @override
  Widget build(BuildContext context) {
    final bg = highlight
        ? AppColors.primary
        : destructive
            ? const Color(0xFFFEE2E2)
            : Colors.white;
    final fg = highlight
        ? Colors.white
        : destructive
            ? AppColors.error
            : AppColors.textPrimary;

    return Card(
      color: bg,
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(icon, color: fg),
        title: Text(label, style: TextStyle(color: fg, fontWeight: FontWeight.w600)),
        trailing: trailing ?? Icon(Icons.chevron_right_rounded, color: fg),
        onTap: onTap,
      ),
    );
  }
}
