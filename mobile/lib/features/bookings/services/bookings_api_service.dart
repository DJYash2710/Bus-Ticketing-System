import '../../../core/constants/api_constants.dart';
import '../../../core/services/base_api_service.dart';
import '../models/booking_item.dart';

class BookingsApiService extends BaseApiService {
  BookingsApiService(super.dio);

  Future<BookingItem> create({
    required int scheduleId,
    required List<String> seatNumbers,
    required String boardingPoint,
    required String droppingPoint,
    String? couponCode,
  }) =>
      post(
        ApiConstants.bookings,
        data: {
          'scheduleId': scheduleId,
          'seatNumbers': seatNumbers,
          'boardingPoint': boardingPoint,
          'droppingPoint': droppingPoint,
          if (couponCode != null) 'couponCode': couponCode,
        },
        parser: (json) => BookingItem.fromJson(json as Map<String, dynamic>),
      );

  Future<List<BookingItem>> listMine() => get(
        ApiConstants.myBookings,
        parser: (json) => (json as List<dynamic>)
            .map((e) => BookingItem.fromJson(e as Map<String, dynamic>))
            .toList(),
      );

  Future<BookingItem> getById(int id) => get(
        '${ApiConstants.bookings}/$id',
        parser: (json) => BookingItem.fromJson(json as Map<String, dynamic>),
      );

  Future<BookingItem> cancel(int id) => patch(
        '${ApiConstants.bookings}/$id/cancel',
        parser: (json) => BookingItem.fromJson(json as Map<String, dynamic>),
      );
}
