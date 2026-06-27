import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/error/result.dart';
import '../../../shared/providers/core_providers.dart';
import '../models/seat_layout_data.dart';
import '../repositories/seats_repository.dart';
import '../repositories/seats_repository_impl.dart';
import '../services/seats_api_service.dart';

final seatsApiServiceProvider = Provider(
  (ref) => SeatsApiService(ref.watch(dioProvider)),
);

final seatsRepositoryProvider = Provider<SeatsRepository>(
  (ref) => SeatsRepositoryImpl(ref.watch(seatsApiServiceProvider)),
);

/// Initial load shows a spinner; subsequent refreshes update seats in place.
final seatLayoutProvider =
    AutoDisposeAsyncNotifierProviderFamily<SeatLayoutNotifier, SeatLayoutData, int>(
  SeatLayoutNotifier.new,
);

class SeatLayoutNotifier
    extends AutoDisposeFamilyAsyncNotifier<SeatLayoutData, int> {
  Timer? _pollTimer;

  @override
  Future<SeatLayoutData> build(int scheduleId) async {
    ref.onDispose(() => _pollTimer?.cancel());
    final layout = await _fetch(scheduleId);
    _pollTimer = Timer.periodic(const Duration(seconds: 4), (_) {
      unawaited(_refreshSilently(scheduleId));
    });
    return layout;
  }

  Future<SeatLayoutData> _fetch(int scheduleId) async {
    final result =
        await ref.read(seatsRepositoryProvider).getSeatLayout(scheduleId);
    return switch (result) {
      Success(:final value) => value,
      Error(:final failure) => throw failure,
    };
  }

  Future<void> _refreshSilently(int scheduleId) async {
    try {
      final next = await _fetch(scheduleId);
      state = AsyncData(next);
    } catch (_) {
      // Keep last known layout on transient network errors.
    }
  }
}
