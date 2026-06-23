import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/error/result.dart';
import '../../../shared/providers/core_providers.dart';
import '../models/schedule.dart';
import '../repositories/schedules_repository.dart';
import '../repositories/schedules_repository_impl.dart';
import '../services/schedules_api_service.dart';

final schedulesApiServiceProvider = Provider<SchedulesApiService>(
  (ref) => SchedulesApiService(ref.watch(dioProvider)),
);

final schedulesRepositoryProvider = Provider<SchedulesRepository>(
  (ref) => SchedulesRepositoryImpl(ref.watch(schedulesApiServiceProvider)),
);

final scheduleDetailProvider = FutureProvider.family<Schedule, int>(
  (ref, id) async {
    final result =
        await ref.watch(schedulesRepositoryProvider).getSchedule(id);
    return switch (result) {
      Success(:final value) => value,
      Error(:final failure) => throw failure,
    };
  },
);
