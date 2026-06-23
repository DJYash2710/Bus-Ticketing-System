// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'booking.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_Booking _$BookingFromJson(Map<String, dynamic> json) => _Booking(
  id: (json['id'] as num).toInt(),
  scheduleId: (json['scheduleId'] as num).toInt(),
  status: $enumDecode(_$BookingStatusEnumMap, json['status']),
  totalAmount: (json['totalAmount'] as num).toDouble(),
  seatIds: (json['seatIds'] as List<dynamic>)
      .map((e) => (e as num).toInt())
      .toList(),
  holdId: json['holdId'] as String?,
  pnr: json['pnr'] as String?,
  createdAt: const NullableDateTimeConverter().fromJson(
    json['createdAt'] as String?,
  ),
);

Map<String, dynamic> _$BookingToJson(_Booking instance) => <String, dynamic>{
  'id': instance.id,
  'scheduleId': instance.scheduleId,
  'status': _$BookingStatusEnumMap[instance.status]!,
  'totalAmount': instance.totalAmount,
  'seatIds': instance.seatIds,
  'holdId': instance.holdId,
  'pnr': instance.pnr,
  'createdAt': const NullableDateTimeConverter().toJson(instance.createdAt),
};

const _$BookingStatusEnumMap = {
  BookingStatus.pending: 'PENDING',
  BookingStatus.confirmed: 'CONFIRMED',
  BookingStatus.cancelled: 'CANCELLED',
  BookingStatus.completed: 'COMPLETED',
};
