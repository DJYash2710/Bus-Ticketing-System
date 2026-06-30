import 'package:flutter/scheduler.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/auth/providers/auth_providers.dart';
import '../../features/config/providers/pricing_providers.dart';

enum BootstrapStatus { idle, loading, complete }

class BootstrapState {
  const BootstrapState({this.status = BootstrapStatus.idle});

  final BootstrapStatus status;

  bool get isComplete => status == BootstrapStatus.complete;
}

class BootstrapNotifier extends Notifier<BootstrapState> {
  static const _minDisplayDuration = Duration(seconds: 2);

  @override
  BootstrapState build() => const BootstrapState();

  Future<void> run() async {
    if (state.status != BootstrapStatus.idle) return;

    state = const BootstrapState(status: BootstrapStatus.loading);
    final startedAt = DateTime.now();

    await Future.wait([
      ref.read(pricingConfigProvider.notifier).loadFromApi(),
      ref.read(authStateProvider.notifier).restoreSession(),
    ]);

    final elapsed = DateTime.now().difference(startedAt);
    if (elapsed < _minDisplayDuration) {
      await Future<void>.delayed(_minDisplayDuration - elapsed);
    }

    // Finish on the next frame so splash is not torn down mid-layout.
    await SchedulerBinding.instance.endOfFrame;

    state = const BootstrapState(status: BootstrapStatus.complete);
  }
}

final bootstrapProvider =
    NotifierProvider<BootstrapNotifier, BootstrapState>(BootstrapNotifier.new);
