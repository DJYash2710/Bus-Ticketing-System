import '../../../core/error/result.dart';
import '../../../core/repositories/base_repository.dart';
import '../models/payment_item.dart';
import '../services/payments_api_service.dart';
import 'payments_repository.dart';

class PaymentsRepositoryImpl extends BaseRepository
    implements PaymentsRepository {
  PaymentsRepositoryImpl(this._apiService);

  final PaymentsApiService _apiService;

  @override
  Future<Result<PaymentItem>> confirmPayment(int paymentId) =>
      guard(() => _apiService.confirm(paymentId));

  @override
  Future<Result<PaymentItem>> initiatePayment(int bookingId) =>
      guard(() => _apiService.initiate(bookingId));

  @override
  Future<Result<PaymentItem>> getPaymentByBooking(int bookingId) =>
      guard(() => _apiService.getByBooking(bookingId));
}
