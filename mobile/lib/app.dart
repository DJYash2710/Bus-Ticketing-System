import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/routing/app_router.dart';
import 'core/theme/app_theme.dart';
import 'core/widgets/app_lifecycle_wrapper.dart';
import 'core/services/notification_service.dart';

class App extends ConsumerStatefulWidget {
  const App({super.key});

  @override
  ConsumerState<App> createState() => _AppState();
}

class _AppState extends ConsumerState<App> {
  @override
  void initState() {
    super.initState();
    NotificationService.instance.init();
    NotificationService.instance.ticketEvent.addListener(_onTicketEvent);
  }

  @override
  void dispose() {
    NotificationService.instance.ticketEvent.removeListener(_onTicketEvent);
    super.dispose();
  }

  void _onTicketEvent() {
    final msg = NotificationService.instance.ticketEvent.value;
    if (msg == null || !mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg)),
    );
    NotificationService.instance.clear();
  }

  @override
  Widget build(BuildContext context) {
    final router = ref.watch(appRouterProvider);

    return AppLifecycleWrapper(
      child: MaterialApp.router(
        title: 'TealTransit',
        debugShowCheckedModeBanner: false,
        routerConfig: router,
        theme: AppTheme.light,
      ),
    );
  }
}
