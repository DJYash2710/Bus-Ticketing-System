import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../core/utils/json_converters.dart';

part 'booking.freezed.dart';
part 'booking.g.dart';

@JsonEnum(alwaysCreate: true)
enum BookingStatus {
  @JsonValue('PENDING')
  pending,
  @JsonValue('CONFIRMED')
  confirmed,
  @JsonValue('CANCELLED')
  cancelled,
  @JsonValue('COMPLETED')
  completed,
}

@freezed
sealed class Booking with _$Booking {
  const factory Booking({
    required int id,
    required int scheduleId,
    required BookingStatus status,
    required double totalAmount,
    required List<int> seatIds,
    String? holdId,
    String? pnr,
    @NullableDateTimeConverter() DateTime? createdAt,
  }) = _Booking;

  factory Booking.fromJson(Map<String, dynamic> json) =>
      _$BookingFromJson(json);
}
