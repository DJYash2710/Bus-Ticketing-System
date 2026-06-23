import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../core/utils/json_converters.dart';

part 'payment.freezed.dart';
part 'payment.g.dart';

@JsonEnum(alwaysCreate: true)
enum PaymentStatus {
  @JsonValue('PENDING')
  pending,
  @JsonValue('SUCCESS')
  success,
  @JsonValue('FAILED')
  failed,
  @JsonValue('REFUNDED')
  refunded,
}

@JsonEnum(alwaysCreate: true)
enum PaymentMethod {
  @JsonValue('UPI')
  upi,
  @JsonValue('CARD')
  card,
  @JsonValue('NET_BANKING')
  netBanking,
  @JsonValue('WALLET')
  wallet,
}

@freezed
sealed class Payment with _$Payment {
  const factory Payment({
    required int id,
    required int bookingId,
    required double amount,
    required PaymentStatus status,
    required PaymentMethod method,
    String? transactionId,
    @NullableDateTimeConverter() DateTime? paidAt,
  }) = _Payment;

  factory Payment.fromJson(Map<String, dynamic> json) =>
      _$PaymentFromJson(json);
}
