// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'schedule_summary.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_ScheduleSummary _$ScheduleSummaryFromJson(Map<String, dynamic> json) =>
    _ScheduleSummary(
      id: (json['id'] as num).toInt(),
      routeName: json['routeName'] as String,
      fromCity: json['fromCity'] as String,
      toCity: json['toCity'] as String,
      departureTime: const DateTimeConverter().fromJson(
        json['departureTime'] as String,
      ),
      arrivalTime: const DateTimeConverter().fromJson(
        json['arrivalTime'] as String,
      ),
      fare: (json['fare'] as num).toDouble(),
      availableSeats: (json['availableSeats'] as num).toInt(),
      busName: json['busName'] as String?,
      busType: json['busType'] as String?,
    );

Map<String, dynamic> _$ScheduleSummaryToJson(_ScheduleSummary instance) =>
    <String, dynamic>{
      'id': instance.id,
      'routeName': instance.routeName,
      'fromCity': instance.fromCity,
      'toCity': instance.toCity,
      'departureTime': const DateTimeConverter().toJson(instance.departureTime),
      'arrivalTime': const DateTimeConverter().toJson(instance.arrivalTime),
      'fare': instance.fare,
      'availableSeats': instance.availableSeats,
      'busName': instance.busName,
      'busType': instance.busType,
    };
