import 'package:freezed_annotation/freezed_annotation.dart';

part 'seat.freezed.dart';
part 'seat.g.dart';

@JsonEnum(alwaysCreate: true)
enum SeatStatus {
  @JsonValue('AVAILABLE')
  available,
  @JsonValue('HELD')
  held,
  @JsonValue('BOOKED')
  booked,
  @JsonValue('BLOCKED')
  blocked,
}

@freezed
sealed class Seat with _$Seat {
  const factory Seat({
    required int id,
    required String seatNumber,
    required int row,
    required int column,
    required SeatStatus status,
    double? fare,
  }) = _Seat;

  factory Seat.fromJson(Map<String, dynamic> json) => _$SeatFromJson(json);
}
