import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../core/utils/json_converters.dart';

part 'schedule.freezed.dart';
part 'schedule.g.dart';

@freezed
sealed class Schedule with _$Schedule {
  const factory Schedule({
    required int id,
    required int routeId,
    required int busId,
    @DateTimeConverter() required DateTime departureTime,
    @DateTimeConverter() required DateTime arrivalTime,
    required double baseFare,
    required String status,
    String? routeName,
    String? busName,
    int? availableSeats,
  }) = _Schedule;

  factory Schedule.fromJson(Map<String, dynamic> json) =>
      _$ScheduleFromJson(json);
}
