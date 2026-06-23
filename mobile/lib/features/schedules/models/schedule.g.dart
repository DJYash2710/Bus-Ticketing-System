// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'schedule.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_Schedule _$ScheduleFromJson(Map<String, dynamic> json) => _Schedule(
  id: (json['id'] as num).toInt(),
  routeId: (json['routeId'] as num).toInt(),
  busId: (json['busId'] as num).toInt(),
  departureTime: const DateTimeConverter().fromJson(
    json['departureTime'] as String,
  ),
  arrivalTime: const DateTimeConverter().fromJson(
    json['arrivalTime'] as String,
  ),
  baseFare: (json['baseFare'] as num).toDouble(),
  status: json['status'] as String,
  routeName: json['routeName'] as String?,
  busName: json['busName'] as String?,
  availableSeats: (json['availableSeats'] as num?)?.toInt(),
);

Map<String, dynamic> _$ScheduleToJson(_Schedule instance) => <String, dynamic>{
  'id': instance.id,
  'routeId': instance.routeId,
  'busId': instance.busId,
  'departureTime': const DateTimeConverter().toJson(instance.departureTime),
  'arrivalTime': const DateTimeConverter().toJson(instance.arrivalTime),
  'baseFare': instance.baseFare,
  'status': instance.status,
  'routeName': instance.routeName,
  'busName': instance.busName,
  'availableSeats': instance.availableSeats,
};
