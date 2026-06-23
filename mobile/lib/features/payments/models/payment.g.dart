// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'payment.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_Payment _$PaymentFromJson(Map<String, dynamic> json) => _Payment(
  id: (json['id'] as num).toInt(),
  bookingId: (json['bookingId'] as num).toInt(),
  amount: (json['amount'] as num).toDouble(),
  status: $enumDecode(_$PaymentStatusEnumMap, json['status']),
  method: $enumDecode(_$PaymentMethodEnumMap, json['method']),
  transactionId: json['transactionId'] as String?,
  paidAt: const NullableDateTimeConverter().fromJson(json['paidAt'] as String?),
);

Map<String, dynamic> _$PaymentToJson(_Payment instance) => <String, dynamic>{
  'id': instance.id,
  'bookingId': instance.bookingId,
  'amount': instance.amount,
  'status': _$PaymentStatusEnumMap[instance.status]!,
  'method': _$PaymentMethodEnumMap[instance.method]!,
  'transactionId': instance.transactionId,
  'paidAt': const NullableDateTimeConverter().toJson(instance.paidAt),
};

const _$PaymentStatusEnumMap = {
  PaymentStatus.pending: 'PENDING',
  PaymentStatus.success: 'SUCCESS',
  PaymentStatus.failed: 'FAILED',
  PaymentStatus.refunded: 'REFUNDED',
};

const _$PaymentMethodEnumMap = {
  PaymentMethod.upi: 'UPI',
  PaymentMethod.card: 'CARD',
  PaymentMethod.netBanking: 'NET_BANKING',
  PaymentMethod.wallet: 'WALLET',
};
