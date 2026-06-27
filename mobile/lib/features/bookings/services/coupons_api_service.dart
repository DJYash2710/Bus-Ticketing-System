import '../../../core/constants/api_constants.dart';
import '../../../core/services/base_api_service.dart';

class CouponPreview {
  const CouponPreview({
    required this.code,
    required this.discountAmount,
  });

  final String code;
  final double discountAmount;

  factory CouponPreview.fromJson(Map<String, dynamic> json) {
    final data = json.containsKey('discountAmount')
        ? json
        : (json['data'] as Map<String, dynamic>? ?? json);
    return CouponPreview(
      code: data['code'] as String? ?? '',
      discountAmount: double.parse(data['discountAmount'].toString()),
    );
  }
}

class CouponsApiService extends BaseApiService {
  CouponsApiService(super.dio);

  Future<CouponPreview> validate({
    required String code,
    required double baseAmount,
  }) =>
      get(
        '${ApiConstants.coupons}/validate/$code',
        queryParameters: {'baseAmount': baseAmount},
        parser: (json) {
          final data = json is Map<String, dynamic> && json.containsKey('data')
              ? json['data'] as Map<String, dynamic>
              : json as Map<String, dynamic>;
          return CouponPreview.fromJson(data);
        },
      );
}
