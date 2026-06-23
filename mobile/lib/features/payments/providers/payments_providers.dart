import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/error/result.dart';
import '../../../shared/providers/core_providers.dart';
import '../models/payment_item.dart';
import '../repositories/payments_repository.dart';
import '../repositories/payments_repository_impl.dart';
import '../services/payments_api_service.dart';

final paymentsApiServiceProvider = Provider(
  (ref) => PaymentsApiService(ref.watch(dioProvider)),
);

final paymentsRepositoryProvider = Provider<PaymentsRepository>(
  (ref) => PaymentsRepositoryImpl(ref.watch(paymentsApiServiceProvider)),
);

final initiatePaymentProvider =
    Provider<Future<Result<PaymentItem>> Function(int bookingId)>((ref) {
  final repository = ref.watch(paymentsRepositoryProvider);
  return (bookingId) => repository.initiatePayment(bookingId);
});
