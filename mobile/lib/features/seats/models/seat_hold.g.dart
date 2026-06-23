// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'seat_hold.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_SeatHold _$SeatHoldFromJson(Map<String, dynamic> json) => _SeatHold(
  holdId: json['holdId'] as String,
  scheduleId: (json['scheduleId'] as num).toInt(),
  seatIds: (json['seatIds'] as List<dynamic>)
      .map((e) => (e as num).toInt())
      .toList(),
  expiresAt: const DateTimeConverter().fromJson(json['expiresAt'] as String),
);

Map<String, dynamic> _$SeatHoldToJson(_SeatHold instance) => <String, dynamic>{
  'holdId': instance.holdId,
  'scheduleId': instance.scheduleId,
  'seatIds': instance.seatIds,
  'expiresAt': const DateTimeConverter().toJson(instance.expiresAt),
};

_SeatLayout _$SeatLayoutFromJson(Map<String, dynamic> json) => _SeatLayout(
  scheduleId: (json['scheduleId'] as num).toInt(),
  seats: (json['seats'] as List<dynamic>)
      .map((e) => Seat.fromJson(e as Map<String, dynamic>))
      .toList(),
  activeHold: json['activeHold'] == null
      ? null
      : SeatHold.fromJson(json['activeHold'] as Map<String, dynamic>),
);

Map<String, dynamic> _$SeatLayoutToJson(_SeatLayout instance) =>
    <String, dynamic>{
      'scheduleId': instance.scheduleId,
      'seats': instance.seats,
      'activeHold': instance.activeHold,
    };
