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
