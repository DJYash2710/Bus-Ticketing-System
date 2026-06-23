class PaymentItem {
  const PaymentItem({
    required this.id,
    required this.bookingId,
    required this.amount,
    required this.status,
    required this.provider,
  });

  final int id;
  final int bookingId;
  final double amount;
  final String status;
  final String provider;

  factory PaymentItem.fromJson(Map<String, dynamic> json) => PaymentItem(
        id: (json['id'] as num).toInt(),
        bookingId: (json['bookingId'] as num).toInt(),
        amount: double.parse(json['amount'].toString()),
        status: json['status'] as String,
        provider: json['provider'] as String? ?? 'MOCK',
      );
}
