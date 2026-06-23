class BookingItem {
  const BookingItem({
    required this.id,
    required this.status,
    required this.paymentStatus,
    required this.totalAmount,
    required this.seatNumbers,
    required this.fromCityName,
    required this.toCityName,
    required this.departureTime,
    required this.busName,
    this.holdExpiresAt,
    this.cancelledAt,
  });

  final int id;
  final String status;
  final String paymentStatus;
  final double totalAmount;
  final List<String> seatNumbers;
  final String fromCityName;
  final String toCityName;
  final DateTime departureTime;
  final String busName;
  final DateTime? holdExpiresAt;
  final DateTime? cancelledAt;

  String get pnr => 'TT$id';

  bool get isUpcoming =>
      status != 'CANCELLED' &&
      status != 'COMPLETED' &&
      departureTime.isAfter(DateTime.now());

  factory BookingItem.fromJson(Map<String, dynamic> json) {
    final schedule = json['schedule'] as Map<String, dynamic>;
    final route = schedule['route'] as Map<String, dynamic>;
    final bus = schedule['bus'] as Map<String, dynamic>;
    final seats = (json['seats'] as List<dynamic>? ?? [])
        .map((e) => (e as Map<String, dynamic>)['seat'] as Map<String, dynamic>)
        .map((s) => s['seatNumber'] as String)
        .toList();
    return BookingItem(
      id: (json['id'] as num).toInt(),
      status: json['status'] as String,
      paymentStatus: json['paymentStatus'] as String,
      totalAmount: double.parse(json['totalAmount'].toString()),
      seatNumbers: seats,
      fromCityName: (route['fromCity'] as Map)['name'] as String,
      toCityName: (route['toCity'] as Map)['name'] as String,
      departureTime:
          DateTime.parse(schedule['departureTime'] as String).toLocal(),
      busName: bus['name'] as String,
      holdExpiresAt: json['holdExpiresAt'] != null
          ? DateTime.parse(json['holdExpiresAt'] as String).toLocal()
          : null,
      cancelledAt: json['cancelledAt'] != null
          ? DateTime.parse(json['cancelledAt'] as String).toLocal()
          : null,
    );
  }
}
