import '../../../core/error/result.dart';
import '../../../core/repositories/base_repository.dart';
import '../models/schedule.dart';
import '../services/schedules_api_service.dart';
import 'schedules_repository.dart';

class SchedulesRepositoryImpl extends BaseRepository
    implements SchedulesRepository {
  SchedulesRepositoryImpl(this._apiService);

  final SchedulesApiService _apiService;

  @override
  Future<Result<Schedule>> getSchedule(int id) =>
      guard(() => _apiService.getById(id));

  @override
  Future<Result<List<Schedule>>> listSchedules({
    Map<String, dynamic>? filters,
  }) =>
      guard(() => _apiService.list(queryParameters: filters));
}
