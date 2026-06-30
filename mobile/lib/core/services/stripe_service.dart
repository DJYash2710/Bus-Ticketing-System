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
      _initialized = false;
      return;
    }

    if (_initialized && Stripe.publishableKey == key) {
      return;
    }

    Stripe.publishableKey = key;
    await Stripe.instance.applySettings();
    _initialized = true;

    if (kDebugMode) {
      debugPrint('Stripe SDK configured (${key.substring(0, 12)}...)');
    }
  }

  /// Ensures the native Stripe SDK has a publishable key before Payment Sheet.
  Future<void> ensureConfigured(PricingConfig config) async {
    if (_initialized && Stripe.publishableKey.isNotEmpty) {
      return;
    }
    await configure(config);
    if (!_initialized || Stripe.publishableKey.isEmpty) {
      throw StateError(_missingKeyMessage(config));
    }
  }

  static String _missingKeyMessage(PricingConfig config) {
    if (config.paymentProvider.toUpperCase() != 'STRIPE') {
      return 'Server is not using Stripe (PAYMENT_PROVIDER=${config.paymentProvider}). '
          'Use mock checkout or set PAYMENT_PROVIDER=STRIPE in the API .env.';
    }
    return 'Stripe publishable key is missing. Add STRIPE_PUBLISHABLE_KEY=pk_test_... '
        'to the API .env, restart npm run dev, then fully restart the app.';
  }

  Future<void> presentPaymentSheet({required String clientSecret}) async {
    if (!isStripeNativePlatform) {
      throw UnsupportedError(
        'Stripe Payment Sheet requires an Android or iOS device. '
        'Run the app on a phone/emulator, not Windows or web.',
      );
    }

    if (!_initialized || Stripe.publishableKey.isEmpty) {
      throw StateError(
        'Stripe SDK is not configured. Restart the app after the API is reachable '
        'and STRIPE_PUBLISHABLE_KEY is set.',
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
