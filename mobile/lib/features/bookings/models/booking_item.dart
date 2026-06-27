class BookingItem {
  const BookingItem({
    required this.id,
    required this.status,
    required this.paymentStatus,
    required this.totalAmount,
    required this.taxAmount,
    required this.baseAmount,
    required this.discountAmount,
    this.commissionAmount = 0,
    this.commissionRate,
    required this.seatNumbers,
    required this.fromCityName,
    required this.toCityName,
    required this.departureTime,
    required this.busName,
    this.passengerName,
    this.passengerEmail,
    this.boardingPoint,
    this.droppingPoint,
    this.holdExpiresAt,
    this.cancelledAt,
  });

  final int id;
  final String status;
  final String paymentStatus;
  final double totalAmount;
  final double taxAmount;
  final double baseAmount;
  final double discountAmount;
  final double commissionAmount;
  final double? commissionRate;
  final List<String> seatNumbers;
  final String fromCityName;
  final String toCityName;
  final DateTime departureTime;
  final String busName;
  final String? passengerName;
  final String? passengerEmail;
  final String? boardingPoint;
  final String? droppingPoint;
  final DateTime? holdExpiresAt;
  final DateTime? cancelledAt;

  String get pnr => 'TT$id';

  bool get isCancelled => status == 'CANCELLED' || status == 'EXPIRED';

  /// Active bookings — includes unpaid PENDING tickets.
  bool get isUpcoming =>
      !isCancelled &&
      status != 'COMPLETED' &&
      (status == 'PENDING' || departureTime.isAfter(DateTime.now()));

  bool get isPast =>
      !isCancelled &&
      (status == 'COMPLETED' ||
          (departureTime.isBefore(DateTime.now()) && status == 'CONFIRMED'));

  factory BookingItem.fromJson(Map<String, dynamic> json) {
    final schedule = json['schedule'] as Map<String, dynamic>;
    final route = schedule['route'] as Map<String, dynamic>;
    final bus = schedule['bus'] as Map<String, dynamic>;
    final user = json['user'] as Map<String, dynamic>?;
    final seats = (json['seats'] as List<dynamic>? ?? [])
        .map((e) => (e as Map<String, dynamic>)['seat'] as Map<String, dynamic>)
        .map((s) => s['seatNumber'] as String)
        .toList();
    return BookingItem(
      id: (json['id'] as num).toInt(),
      status: json['status'] as String,
      paymentStatus: json['paymentStatus'] as String,
      totalAmount: double.parse(json['totalAmount'].toString()),
      taxAmount: double.parse((json['taxAmount'] ?? 0).toString()),
      baseAmount: double.parse((json['baseAmount'] ?? 0).toString()),
      discountAmount: double.parse((json['discountAmount'] ?? 0).toString()),
      commissionAmount:
          double.parse((json['commissionAmount'] ?? 0).toString()),
      commissionRate: json['commissionRate'] != null
          ? double.parse(json['commissionRate'].toString())
          : null,
      seatNumbers: seats,
      fromCityName: (route['fromCity'] as Map)['name'] as String,
      toCityName: (route['toCity'] as Map)['name'] as String,
      departureTime:
          DateTime.parse(schedule['departureTime'] as String).toLocal(),
      busName: bus['name'] as String,
      passengerName: user?['name'] as String?,
      passengerEmail: user?['email'] as String?,
      boardingPoint: json['boardingPoint'] as String?,
      droppingPoint: json['droppingPoint'] as String?,
      holdExpiresAt: json['holdExpiresAt'] != null
          ? DateTime.parse(json['holdExpiresAt'] as String).toLocal()
          : null,
      cancelledAt: json['cancelledAt'] != null
          ? DateTime.parse(json['cancelledAt'] as String).toLocal()
          : null,
    );
  }
}
