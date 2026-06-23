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

final seatLayoutProvider =
    FutureProvider.family<SeatLayoutData, int>((ref, scheduleId) async {
  final result =
      await ref.watch(seatsRepositoryProvider).getSeatLayout(scheduleId);
  return switch (result) {
    Success(:final value) => value,
    Error(:final failure) => throw failure,
  };
});
