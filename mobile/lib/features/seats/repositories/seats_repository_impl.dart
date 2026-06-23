import '../../../core/error/result.dart';
import '../../../core/repositories/base_repository.dart';
import '../models/seat_layout_data.dart';
import '../services/seats_api_service.dart';
import 'seats_repository.dart';

class SeatsRepositoryImpl extends BaseRepository implements SeatsRepository {
  SeatsRepositoryImpl(this._apiService);

  final SeatsApiService _apiService;

  @override
  Future<Result<SeatLayoutData>> getSeatLayout(int scheduleId) =>
      guard(() => _apiService.getLayout(scheduleId));
}
