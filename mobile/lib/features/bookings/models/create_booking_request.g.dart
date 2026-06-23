// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'create_booking_request.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_CreateBookingRequest _$CreateBookingRequestFromJson(
  Map<String, dynamic> json,
) => _CreateBookingRequest(
  scheduleId: (json['scheduleId'] as num).toInt(),
  holdId: json['holdId'] as String,
  seatIds: (json['seatIds'] as List<dynamic>)
      .map((e) => (e as num).toInt())
      .toList(),
  couponCode: json['couponCode'] as String?,
);

Map<String, dynamic> _$CreateBookingRequestToJson(
  _CreateBookingRequest instance,
) => <String, dynamic>{
  'scheduleId': instance.scheduleId,
  'holdId': instance.holdId,
  'seatIds': instance.seatIds,
  'couponCode': instance.couponCode,
};
