import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../bootstrap/bootstrap_provider.dart';
import '../../features/auth/providers/auth_providers.dart';

/// Notifies [GoRouter] when auth or bootstrap state changes so redirects re-run.
final routerRefreshListenableProvider = Provider<Listenable>((ref) {
  final notifier = ValueNotifier<int>(0);

  void bump() => notifier.value++;

  ref.listen<bool>(
    bootstrapProvider.select((s) => s.isComplete),
    (_, _) => bump(),
  );
  ref.listen<int?>(
    authStateProvider.select((s) => s.user?.id),
    (_, _) => bump(),
  );

  ref.onDispose(notifier.dispose);
  return notifier;
});
