import '../../../core/error/result.dart';
import '../../seats/models/seat_layout_data.dart';

abstract interface class SeatsRepository {
  Future<Result<SeatLayoutData>> getSeatLayout(int scheduleId);
}
