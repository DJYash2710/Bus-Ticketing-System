enum SeatMapStatus { available, held, booked, blocked, selected }

class LayoutCapElement {
  const LayoutCapElement({
    required this.type,
    required this.row,
    required this.col,
    this.label,
  });

  final String type;
  final int row;
  final int col;
  final String? label;

  factory LayoutCapElement.fromJson(Map<String, dynamic> json) {
    return LayoutCapElement(
      type: json['type'] as String,
      row: (json['row'] as num).toInt(),
      col: (json['col'] as num).toInt(),
      label: json['label'] as String?,
    );
  }
}

class SeatLayoutSnapshot {
  const SeatLayoutSnapshot({
    required this.seatsLeft,
    required this.seatsRight,
    required this.version,
    required this.capElements,
    this.fromSnapshot = true,
    this.hasUpperDeck = false,
  });

  final int seatsLeft;
  final int seatsRight;
  final int version;
  final List<LayoutCapElement> capElements;
  final bool fromSnapshot;
  final bool hasUpperDeck;

  factory SeatLayoutSnapshot.fromJson(Map<String, dynamic> json) {
    final caps = (json['capElements'] as List<dynamic>? ?? const [])
        .map((e) => LayoutCapElement.fromJson(e as Map<String, dynamic>))
        .toList();
    return SeatLayoutSnapshot(
      seatsLeft: (json['seatsLeft'] as num).toInt(),
      seatsRight: (json['seatsRight'] as num).toInt(),
      version: (json['version'] as num).toInt(),
      capElements: caps,
      fromSnapshot: json['fromSnapshot'] as bool? ?? true,
      hasUpperDeck: json['hasUpperDeck'] as bool? ?? false,
    );
  }
}

class SeatMapItem {
  const SeatMapItem({
    required this.id,
    required this.seatNumber,
    required this.row,
    required this.col,
    required this.status,
    this.deck,
  });

  final int id;
  final String seatNumber;
  final int? row;
  final int? col;
  final SeatMapStatus status;
  final String? deck;

  factory SeatMapItem.fromJson(Map<String, dynamic> json) {
    final raw = (json['status'] as String).toUpperCase();
    return SeatMapItem(
      id: (json['id'] as num).toInt(),
      seatNumber: json['seatNumber'] as String,
      row: (json['row'] as num?)?.toInt(),
      col: (json['col'] as num?)?.toInt(),
      deck: json['deck'] as String?,
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
    this.layout,
  });

  final int scheduleId;
  final DateTime departureTime;
  final DateTime? arrivalTime;
  final double basePrice;
  final String busName;
  final String busType;
  final String fromCityName;
  final String toCityName;
  final List<SeatMapItem> seats;
  final int availableCount;
  final SeatLayoutSnapshot? layout;

  factory SeatLayoutData.fromJson(Map<String, dynamic> json) {
    final schedule = json['schedule'] as Map<String, dynamic>;
    final route = schedule['route'] as Map<String, dynamic>;
    final bus = schedule['bus'] as Map<String, dynamic>;
    final summary = json['summary'] as Map<String, dynamic>;
    final seats = (json['seats'] as List<dynamic>)
        .map((e) => SeatMapItem.fromJson(e as Map<String, dynamic>))
        .toList();
    final layoutJson = json['layout'] as Map<String, dynamic>?;
    final arrivalRaw = schedule['arrivalTime'];
    return SeatLayoutData(
      scheduleId: (schedule['id'] as num).toInt(),
      departureTime:
          DateTime.parse(schedule['departureTime'] as String).toLocal(),
      arrivalTime: arrivalRaw == null
          ? null
          : DateTime.parse(arrivalRaw as String).toLocal(),
      basePrice: double.parse(schedule['basePrice'].toString()),
      busName: bus['name'] as String,
      busType: _formatBusType(bus),
      fromCityName: (route['fromCity'] as Map)['name'] as String,
      toCityName: (route['toCity'] as Map)['name'] as String,
      seats: seats,
      availableCount: (summary['available'] as num).toInt(),
      layout: layoutJson == null ? null : SeatLayoutSnapshot.fromJson(layoutJson),
    );
  }

  static String _formatBusType(Map<String, dynamic> bus) {
    final body = (bus['bodyType'] as String?) ?? (bus['type'] as String?) ?? 'SEATER';
    final hasAc = bus['hasAc'] as bool? ?? false;
    final label = body.replaceAll('_', ' ');
    return hasAc ? '$label AC' : label;
  }
}
