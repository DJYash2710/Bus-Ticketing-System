class PaymentItem {
  const PaymentItem({
    required this.id,
    required this.bookingId,
    required this.amount,
    required this.status,
    required this.provider,
    this.clientSecret,
    this.paymentIntentId,
    this.paymentState,
  });

  final int id;
  final int bookingId;
  final double amount;
  final String status;
  final String provider;
  final String? clientSecret;
  final String? paymentIntentId;
  final String? paymentState;

  bool get isStripe => provider.toUpperCase() == 'STRIPE';

  bool get isReadyForStripeSheet =>
      isStripe && paymentState == 'ready' && (clientSecret?.isNotEmpty ?? false);

  bool get isProcessing =>
      paymentState == 'processing' || status == 'REFUND_PENDING';

  bool get isCompleted =>
      paymentState == 'completed' ||
      status == 'SUCCESS' ||
      status == 'REFUNDED';

  factory PaymentItem.fromJson(Map<String, dynamic> json) {
    final rawId = json['paymentId'] ?? json['id'];
    return PaymentItem(
      id: (rawId as num).toInt(),
      bookingId: (json['bookingId'] as num).toInt(),
      amount: double.parse(json['amount'].toString()),
      status: json['status'] as String? ?? 'PENDING',
      provider: json['provider'] as String? ?? 'MOCK',
      clientSecret: json['clientSecret'] as String?,
      paymentIntentId: json['paymentIntentId'] as String?,
      paymentState: json['paymentState'] as String?,
    );
  }
}
