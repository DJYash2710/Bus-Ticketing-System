import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../core/utils/json_converters.dart';
import 'seat.dart';

part 'seat_hold.freezed.dart';
part 'seat_hold.g.dart';

@freezed
sealed class SeatHold with _$SeatHold {
  const factory SeatHold({
    required String holdId,
    required int scheduleId,
    required List<int> seatIds,
    @DateTimeConverter() required DateTime expiresAt,
  }) = _SeatHold;

  factory SeatHold.fromJson(Map<String, dynamic> json) =>
      _$SeatHoldFromJson(json);
}

@freezed
sealed class SeatLayout with _$SeatLayout {
  const factory SeatLayout({
    required int scheduleId,
    required List<Seat> seats,
    SeatHold? activeHold,
  }) = _SeatLayout;

  factory SeatLayout.fromJson(Map<String, dynamic> json) =>
      _$SeatLayoutFromJson(json);
}
