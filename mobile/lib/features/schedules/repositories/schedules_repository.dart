import '../../../core/error/result.dart';
import '../models/schedule.dart';

abstract interface class SchedulesRepository {
  Future<Result<Schedule>> getSchedule(int id);
  Future<Result<List<Schedule>>> listSchedules({
    Map<String, dynamic>? filters,
  });
}
