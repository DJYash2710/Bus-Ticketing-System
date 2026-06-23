import '../../../core/constants/api_constants.dart';
import '../../../core/services/base_api_service.dart';
import '../models/schedule.dart';

class SchedulesApiService extends BaseApiService {
  SchedulesApiService(super.dio);

  Future<Schedule> getById(int id) => get(
        '${ApiConstants.schedules}/$id',
        parser: (json) => Schedule.fromJson(json as Map<String, dynamic>),
      );

  Future<List<Schedule>> list({
    Map<String, dynamic>? queryParameters,
  }) =>
      get(
        ApiConstants.schedules,
        queryParameters: queryParameters,
        parser: (json) => (json as List<dynamic>)
            .map((e) => Schedule.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}
