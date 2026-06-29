import 'package:flutter/foundation.dart';
import 'package:flutter_stripe/flutter_stripe.dart';

import '../../config/pricing_config.dart';

bool get isStripeNativePlatform {
  if (kIsWeb) return false;
  return switch (defaultTargetPlatform) {
    TargetPlatform.android || TargetPlatform.iOS => true,
    _ => false,
  };
}

class StripeService {
  StripeService._();

  static final StripeService instance = StripeService._();

  bool _initialized = false;

  bool get isInitialized => _initialized;

  Future<void> configure(PricingConfig config) async {
    final key = config.stripePublishableKey.trim();
    if (config.paymentProvider.toUpperCase() != 'STRIPE' || key.isEmpty) {
      return;
    }

    if (_initialized && Stripe.publishableKey == key) {
      return;
    }

    Stripe.publishableKey = key;
    await Stripe.instance.applySettings();
    _initialized = true;

    if (kDebugMode) {
      debugPrint('Stripe SDK configured for ${config.paymentProvider}');
    }
  }

  Future<void> presentPaymentSheet({required String clientSecret}) async {
    if (!isStripeNativePlatform) {
      throw UnsupportedError(
        'Stripe Payment Sheet requires an Android or iOS device. '
        'Run the app on a phone/emulator, not Windows or web.',
      );
    }

    await Stripe.instance.initPaymentSheet(
      paymentSheetParameters: SetupPaymentSheetParameters(
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'TealTransit',
      ),
    );
    await Stripe.instance.presentPaymentSheet();
  }
}
