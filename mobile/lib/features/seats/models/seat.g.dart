// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'seat.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_Seat _$SeatFromJson(Map<String, dynamic> json) => _Seat(
  id: (json['id'] as num).toInt(),
  seatNumber: json['seatNumber'] as String,
  row: (json['row'] as num).toInt(),
  column: (json['column'] as num).toInt(),
  status: $enumDecode(_$SeatStatusEnumMap, json['status']),
  fare: (json['fare'] as num?)?.toDouble(),
);

Map<String, dynamic> _$SeatToJson(_Seat instance) => <String, dynamic>{
  'id': instance.id,
  'seatNumber': instance.seatNumber,
  'row': instance.row,
  'column': instance.column,
  'status': _$SeatStatusEnumMap[instance.status]!,
  'fare': instance.fare,
};

const _$SeatStatusEnumMap = {
  SeatStatus.available: 'AVAILABLE',
  SeatStatus.held: 'HELD',
  SeatStatus.booked: 'BOOKED',
  SeatStatus.blocked: 'BLOCKED',
};
