// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'initiate_payment_request.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_InitiatePaymentRequest _$InitiatePaymentRequestFromJson(
  Map<String, dynamic> json,
) => _InitiatePaymentRequest(
  bookingId: (json['bookingId'] as num).toInt(),
  method: $enumDecode(_$PaymentMethodEnumMap, json['method']),
);

Map<String, dynamic> _$InitiatePaymentRequestToJson(
  _InitiatePaymentRequest instance,
) => <String, dynamic>{
  'bookingId': instance.bookingId,
  'method': _$PaymentMethodEnumMap[instance.method]!,
};

const _$PaymentMethodEnumMap = {
  PaymentMethod.upi: 'UPI',
  PaymentMethod.card: 'CARD',
  PaymentMethod.netBanking: 'NET_BANKING',
  PaymentMethod.wallet: 'WALLET',
};
