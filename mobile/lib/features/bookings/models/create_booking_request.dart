import 'package:freezed_annotation/freezed_annotation.dart';

part 'create_booking_request.freezed.dart';
part 'create_booking_request.g.dart';

@freezed
sealed class CreateBookingRequest with _$CreateBookingRequest {
  const factory CreateBookingRequest({
    required int scheduleId,
    required String holdId,
    required List<int> seatIds,
    String? couponCode,
  }) = _CreateBookingRequest;

  factory CreateBookingRequest.fromJson(Map<String, dynamic> json) =>
      _$CreateBookingRequestFromJson(json);
}
