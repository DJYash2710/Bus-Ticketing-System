enum SeatMapStatus { available, held, booked, blocked, selected }

class SeatMapItem {
  const SeatMapItem({
    required this.id,
    required this.seatNumber,
    required this.row,
    required this.col,
    required this.status,
  });

  final int id;
  final String seatNumber;
  final int? row;
  final int? col;
  final SeatMapStatus status;

  factory SeatMapItem.fromJson(Map<String, dynamic> json) {
    final raw = (json['status'] as String).toUpperCase();
    return SeatMapItem(
      id: (json['id'] as num).toInt(),
      seatNumber: json['seatNumber'] as String,
      row: (json['row'] as num?)?.toInt(),
      col: (json['col'] as num?)?.toInt(),
      status: switch (raw) {
        'HELD' => SeatMapStatus.held,
        'BOOKED' => SeatMapStatus.booked,
        'BLOCKED' => SeatMapStatus.blocked,
        _ => SeatMapStatus.available,
      },
    );
  }
}

class SeatLayoutData {
  const SeatLayoutData({
    required this.scheduleId,
    required this.departureTime,
    required this.arrivalTime,
    required this.basePrice,
    required this.busName,
    required this.busType,
    required this.fromCityName,
    required this.toCityName,
    required this.seats,
    required this.availableCount,
  });

  final int scheduleId;
  final DateTime departureTime;
  final DateTime arrivalTime;
  final double basePrice;
  final String busName;
  final String busType;
  final String fromCityName;
  final String toCityName;
  final List<SeatMapItem> seats;
  final int availableCount;

  factory SeatLayoutData.fromJson(Map<String, dynamic> json) {
    final schedule = json['schedule'] as Map<String, dynamic>;
    final route = schedule['route'] as Map<String, dynamic>;
    final bus = schedule['bus'] as Map<String, dynamic>;
    final summary = json['summary'] as Map<String, dynamic>;
    final seats = (json['seats'] as List<dynamic>)
        .map((e) => SeatMapItem.fromJson(e as Map<String, dynamic>))
        .toList();
    return SeatLayoutData(
      scheduleId: (schedule['id'] as num).toInt(),
      departureTime:
          DateTime.parse(schedule['departureTime'] as String).toLocal(),
      arrivalTime: DateTime.parse(schedule['arrivalTime'] as String).toLocal(),
      basePrice: double.parse(schedule['basePrice'].toString()),
      busName: bus['name'] as String,
      busType: bus['type'] as String,
      fromCityName: (route['fromCity'] as Map)['name'] as String,
      toCityName: (route['toCity'] as Map)['name'] as String,
      seats: seats,
      availableCount: (summary['available'] as num).toInt(),
    );
  }
}
