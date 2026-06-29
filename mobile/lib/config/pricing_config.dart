/// Server-driven pricing settings with safe local fallbacks.
class PricingConfig {
  const PricingConfig({
    required this.platformCommissionRate,
    required this.gstRate,
    required this.loyaltyPointValue,
    required this.loyaltyEarnRate,
    required this.referralBonusCredits,
    required this.paymentProvider,
    required this.stripePublishableKey,
  });

  final double platformCommissionRate;
  final double gstRate;
  final double loyaltyPointValue;
  final double loyaltyEarnRate;
  final int referralBonusCredits;
  final String paymentProvider;
  final String stripePublishableKey;

  bool get usesStripe => paymentProvider.toUpperCase() == 'STRIPE';

  static const defaults = PricingConfig(
    platformCommissionRate: 0.05,
    gstRate: 0.18,
    loyaltyPointValue: 0.1,
    loyaltyEarnRate: 0.075,
    referralBonusCredits: 300,
    paymentProvider: 'MOCK',
    stripePublishableKey: '',
  );

  factory PricingConfig.fromJson(Map<String, dynamic> json) {
    return PricingConfig(
      platformCommissionRate:
          double.parse(json['platformCommissionRate'].toString()),
      gstRate: double.parse(json['gstRate'].toString()),
      loyaltyPointValue: double.parse(json['loyaltyPointValue'].toString()),
      loyaltyEarnRate: double.parse(json['loyaltyEarnRate'].toString()),
      referralBonusCredits:
          int.parse(json['referralBonusCredits'].toString()),
      paymentProvider: json['paymentProvider'] as String? ?? 'MOCK',
      stripePublishableKey: json['stripePublishableKey'] as String? ?? '',
    );
  }
}
