import '../../../core/error/result.dart';
import '../../../core/repositories/base_repository.dart';
import '../models/booking_item.dart';
import '../services/bookings_api_service.dart';
import 'bookings_repository.dart';

class BookingsRepositoryImpl extends BaseRepository
    implements BookingsRepository {
  BookingsRepositoryImpl(this._apiService);

  final BookingsApiService _apiService;

  @override
  Future<Result<BookingItem>> cancelBooking(int id) =>
      guard(() => _apiService.cancel(id));

  @override
  Future<Result<BookingItem>> createBooking({
    required int scheduleId,
    required List<String> seatNumbers,
    required String boardingPoint,
    required String droppingPoint,
    String? couponCode,
    int? creditsToRedeem,
  }) =>
      guard(
        () => _apiService.create(
          scheduleId: scheduleId,
          seatNumbers: seatNumbers,
          boardingPoint: boardingPoint,
          droppingPoint: droppingPoint,
          couponCode: couponCode,
          creditsToRedeem: creditsToRedeem,
        ),
      );

  @override
  Future<Result<BookingItem>> getBooking(int id) =>
      guard(() => _apiService.getById(id));

  @override
  Future<Result<List<BookingItem>>> listMyBookings() =>
      guard(() => _apiService.listMine());
}
