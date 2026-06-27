import '../../../core/error/result.dart';
import '../models/booking_item.dart';

abstract interface class BookingsRepository {
  Future<Result<BookingItem>> createBooking({
    required int scheduleId,
    required List<String> seatNumbers,
    required String boardingPoint,
    required String droppingPoint,
    String? couponCode,
    int? creditsToRedeem,
  });
  Future<Result<BookingItem>> getBooking(int id);
  Future<Result<List<BookingItem>>> listMyBookings();
  Future<Result<BookingItem>> cancelBooking(int id);
}
