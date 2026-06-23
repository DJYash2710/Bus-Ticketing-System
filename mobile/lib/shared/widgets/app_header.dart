import 'package:flutter/material.dart';

import '../../config/app_config.dart';
import '../../core/theme/app_colors.dart';

class AppHeader extends StatelessWidget implements PreferredSizeWidget {
  const AppHeader({
    this.showBack = false,
    this.title,
    this.onBack,
    super.key,
  });

  final bool showBack;
  final String? title;
  final VoidCallback? onBack;

  @override
  Size get preferredSize => const Size.fromHeight(56);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      automaticallyImplyLeading: false,
      title: Row(
        children: [
          if (showBack)
            IconButton(
              icon: const Icon(Icons.arrow_back_rounded, color: AppColors.primary),
              onPressed: onBack ?? () => Navigator.of(context).maybePop(),
            ),
          const Icon(Icons.directions_bus_rounded, color: AppColors.primary),
          const SizedBox(width: 8),
          Text(
            title ?? AppConfig.appName,
            style: const TextStyle(
              color: AppColors.primary,
              fontWeight: FontWeight.w700,
              fontSize: 18,
            ),
          ),
        ],
      ),
      actions: const [
        Icon(Icons.notifications_none_rounded, color: AppColors.textPrimary),
        SizedBox(width: 8),
      ],
    );
  }
}
