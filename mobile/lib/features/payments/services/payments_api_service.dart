import '../../../core/constants/api_constants.dart';
import '../../../core/services/base_api_service.dart';
import '../models/payment_item.dart';

class PaymentsApiService extends BaseApiService {
  PaymentsApiService(super.dio);

  Future<PaymentItem> initiate(int bookingId) => post(
        '${ApiConstants.payments}/initiate/$bookingId',
        parser: (json) => PaymentItem.fromJson(json as Map<String, dynamic>),
      );

  Future<PaymentItem> confirm(int paymentId) => patch(
        '${ApiConstants.payments}/confirm/$paymentId',
        parser: (json) => PaymentItem.fromJson(json as Map<String, dynamic>),
      );
}
