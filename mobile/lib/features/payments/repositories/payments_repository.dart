import '../../../core/error/result.dart';
import '../models/payment_item.dart';

abstract interface class PaymentsRepository {
  Future<Result<PaymentItem>> initiatePayment(int bookingId);
  Future<Result<PaymentItem>> confirmPayment(int paymentId);
  Future<Result<PaymentItem>> getPaymentByBooking(int bookingId);
}
