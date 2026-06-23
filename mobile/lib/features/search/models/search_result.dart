import 'city.dart';

class ScheduleSearchItem {
  const ScheduleSearchItem({
    required this.scheduleId,
    required this.departureTime,
    required this.arrivalTime,
    required this.basePrice,
    required this.busName,
    required this.busType,
    required this.amenities,
    required this.availableSeats,
    required this.totalSeats,
    required this.fromCityName,
    required this.toCityName,
    required this.durationMin,
  });

  final int scheduleId;
  final DateTime departureTime;
  final DateTime arrivalTime;
  final double basePrice;
  final String busName;
  final String busType;
  final List<String> amenities;
  final int availableSeats;
  final int totalSeats;
  final String fromCityName;
  final String toCityName;
  final int durationMin;

  bool get isSoldOut => availableSeats <= 0;
  bool get isFastFilling => !isSoldOut && availableSeats <= 5;

  factory ScheduleSearchItem.fromJson(Map<String, dynamic> json) {
    final bus = json['bus'] as Map<String, dynamic>;
    final route = json['route'] as Map<String, dynamic>;
    final summary = json['seatSummary'] as Map<String, dynamic>;
    final amenities = bus['amenities'];
    return ScheduleSearchItem(
      scheduleId: (json['scheduleId'] as num).toInt(),
      departureTime: DateTime.parse(json['departureTime'] as String).toLocal(),
      arrivalTime: DateTime.parse(json['arrivalTime'] as String).toLocal(),
      basePrice: double.parse(json['basePrice'].toString()),
      busName: bus['name'] as String,
      busType: bus['type'] as String,
      amenities: amenities is List
          ? amenities.map((e) => e.toString()).toList()
          : const [],
      availableSeats: (summary['availableSeats'] as num).toInt(),
      totalSeats: (summary['totalSeats'] as num).toInt(),
      fromCityName: (route['fromCity'] as Map)['name'] as String,
      toCityName: (route['toCity'] as Map)['name'] as String,
      durationMin: (route['durationMin'] as num?)?.toInt() ?? 0,
    );
  }
}

class SearchResult {
  const SearchResult({
    required this.fromCity,
    required this.toCity,
    required this.date,
    required this.schedules,
  });

  final City fromCity;
  final City toCity;
  final String date;
  final List<ScheduleSearchItem> schedules;

  factory SearchResult.fromJson(Map<String, dynamic> json) {
    final search = json['search'] as Map<String, dynamic>;
    final schedules = (json['schedules'] as List<dynamic>)
        .map((e) => ScheduleSearchItem.fromJson(e as Map<String, dynamic>))
        .toList();
    return SearchResult(
      fromCity: City.fromJson(search['fromCity'] as Map<String, dynamic>),
      toCity: City.fromJson(search['toCity'] as Map<String, dynamic>),
      date: search['date'] as String,
      schedules: schedules,
    );
  }
}
