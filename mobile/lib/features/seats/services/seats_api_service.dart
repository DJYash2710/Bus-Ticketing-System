import '../../../core/constants/api_constants.dart';
import '../../../core/services/base_api_service.dart';
import '../models/seat_layout_data.dart';

class SeatsApiService extends BaseApiService {
  SeatsApiService(super.dio);

  Future<SeatLayoutData> getLayout(int scheduleId) => get(
        '${ApiConstants.seats}/schedule/$scheduleId',
        parser: (json) => SeatLayoutData.fromJson(json as Map<String, dynamic>),
      );
}
