import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../core/utils/json_converters.dart';

part 'schedule_summary.freezed.dart';
part 'schedule_summary.g.dart';

@freezed
sealed class ScheduleSummary with _$ScheduleSummary {
  const factory ScheduleSummary({
    required int id,
    required String routeName,
    required String fromCity,
    required String toCity,
    @DateTimeConverter() required DateTime departureTime,
    @DateTimeConverter() required DateTime arrivalTime,
    required double fare,
    required int availableSeats,
    String? busName,
    String? busType,
  }) = _ScheduleSummary;

  factory ScheduleSummary.fromJson(Map<String, dynamic> json) =>
      _$ScheduleSummaryFromJson(json);
}
