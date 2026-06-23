import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';

class StatusBadge extends StatelessWidget {
  const StatusBadge({required this.label, required this.color, super.key});

  final String label;
  final Color color;

  factory StatusBadge.confirmed() =>
      const StatusBadge(label: 'CONFIRMED', color: AppColors.success);

  factory StatusBadge.pending() =>
      const StatusBadge(label: 'PENDING', color: AppColors.tertiary);

  factory StatusBadge.cancelled() =>
      const StatusBadge(label: 'CANCELLED', color: AppColors.textSecondary);

  factory StatusBadge.completed() =>
      const StatusBadge(label: 'COMPLETED', color: AppColors.textSecondary);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}
