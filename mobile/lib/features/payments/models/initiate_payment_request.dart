import 'package:freezed_annotation/freezed_annotation.dart';

import 'payment.dart';

part 'initiate_payment_request.freezed.dart';
part 'initiate_payment_request.g.dart';

@freezed
sealed class InitiatePaymentRequest with _$InitiatePaymentRequest {
  const factory InitiatePaymentRequest({
    required int bookingId,
    required PaymentMethod method,
  }) = _InitiatePaymentRequest;

  factory InitiatePaymentRequest.fromJson(Map<String, dynamic> json) =>
      _$InitiatePaymentRequestFromJson(json);
}
