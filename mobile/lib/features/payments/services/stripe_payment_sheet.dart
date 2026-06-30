import 'package:flutter/services.dart';
import 'package:flutter_stripe/flutter_stripe.dart';

import '../../../core/services/stripe_service.dart';

Future<void> presentStripePaymentSheet(String clientSecret) =>
    StripeService.instance.presentPaymentSheet(clientSecret: clientSecret);

bool isStripeUserCancellation(Object error) {
  if (error is StripeException) {
    final code = error.error.code;
    return code == FailureCode.Canceled;
  }
  return false;
}

String stripePaymentErrorMessage(Object error) {
  final message = error.toString();
  if (message.contains('StripeConfigException') ||
      message.contains('Stripe SDK is not configured') ||
      message.contains('publishable key')) {
    return 'Stripe is not set up on this device. Add STRIPE_PUBLISHABLE_KEY to '
        'the API .env, restart the server, reopen the app, then try again. '
        'Or set PAYMENT_PROVIDER=MOCK for local testing.';
  }
  if (error is StripeException) {
    return error.error.localizedMessage ??
        error.error.message ??
        'Payment failed';
  }
  if (error is PlatformException) {
    return error.message ?? 'Payment failed';
  }
  return error.toString();
}
