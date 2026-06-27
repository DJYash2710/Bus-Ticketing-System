import 'package:flutter/material.dart';

import '../../config/pricing_config.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/formatters.dart';

class PriceBreakdownData {
  const PriceBreakdownData({
    required this.baseAmount,
    required this.taxAmount,
    required this.commissionAmount,
    required this.totalAmount,
    this.discountAmount = 0,
    this.couponDiscount = 0,
    this.loyaltyDiscount = 0,
    this.seatCount = 1,
    this.commissionRate,
    this.gstRate,
  });

  final double baseAmount;
  final double taxAmount;
  final double commissionAmount;
  final double discountAmount;
  final double couponDiscount;
  final double loyaltyDiscount;
  final double totalAmount;
  final int seatCount;
  final double? commissionRate;
  final double? gstRate;

  factory PriceBreakdownData.fromParts({
    required double baseAmount,
    required double taxAmount,
    required PricingConfig pricing,
    double couponDiscount = 0,
    double loyaltyDiscount = 0,
    int seatCount = 1,
    double? commissionRate,
  }) {
    final rate = commissionRate ?? pricing.platformCommissionRate;
    final commission = baseAmount * rate;
    final discount = couponDiscount + loyaltyDiscount;
    final total =
        (baseAmount + taxAmount - discount).clamp(0.0, double.infinity);
    return PriceBreakdownData(
      baseAmount: baseAmount,
      taxAmount: taxAmount,
      commissionAmount: commission,
      commissionRate: rate,
      gstRate: pricing.gstRate,
      discountAmount: discount,
      couponDiscount: couponDiscount,
      loyaltyDiscount: loyaltyDiscount,
      totalAmount: total,
      seatCount: seatCount,
    );
  }
}

class PriceBreakdownRows extends StatelessWidget {
  const PriceBreakdownRows({
    required this.data,
    required this.pricing,
    this.showTotal = true,
    super.key,
  });

  final PriceBreakdownData data;
  final PricingConfig pricing;
  final bool showTotal;

  @override
  Widget build(BuildContext context) {
    final gstPct = ((data.gstRate ?? pricing.gstRate) * 100).toInt();
    final commissionRate = data.commissionRate ?? pricing.platformCommissionRate;
    final commissionPct = (commissionRate * 100).toInt();

    return Column(
      children: [
        _PriceRow(
          label:
              'Base Fare (${data.seatCount} ${data.seatCount == 1 ? 'Seat' : 'Seats'})',
          value: formatCurrency(data.baseAmount),
        ),
        _PriceRow(
          label: 'GST ($gstPct%)',
          value: formatCurrency(data.taxAmount),
        ),
        _PriceRow(
          label: 'Platform commission ($commissionPct%)',
          value: formatCurrency(data.commissionAmount),
        ),
        if (data.couponDiscount > 0)
          _PriceRow(
            label: 'Coupon discount',
            value: '-${formatCurrency(data.couponDiscount)}',
          ),
        if (data.loyaltyDiscount > 0)
          _PriceRow(
            label: 'Loyalty redemption',
            value: '-${formatCurrency(data.loyaltyDiscount)}',
          ),
        if (showTotal) ...[
          const Divider(height: 24),
          _PriceRow(
            label: 'Total Amount',
            value: formatCurrency(data.totalAmount),
            bold: true,
          ),
        ],
      ],
    );
  }
}

Future<void> showPriceDistributionSheet(
  BuildContext context,
  PriceBreakdownData data,
  PricingConfig pricing,
) {
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
    ),
    builder: (context) => Padding(
      padding: EdgeInsets.fromLTRB(
        20,
        16,
        20,
        20 + MediaQuery.paddingOf(context).bottom,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Price Distribution',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 4),
          const Text(
            'How your fare is calculated',
            style: TextStyle(color: AppColors.textSecondary),
          ),
          const SizedBox(height: 16),
          PriceBreakdownRows(data: data, pricing: pricing),
        ],
      ),
    ),
  );
}

class _PriceRow extends StatelessWidget {
  const _PriceRow({
    required this.label,
    required this.value,
    this.bold = false,
  });

  final String label;
  final String value;
  final bool bold;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Expanded(
            child: Text(
              label,
              style: TextStyle(
                fontWeight: bold ? FontWeight.w700 : FontWeight.normal,
                color: bold ? AppColors.primary : null,
              ),
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontWeight: FontWeight.w700,
              color: bold ? AppColors.primary : null,
              fontSize: bold ? 18 : 14,
            ),
          ),
        ],
      ),
    );
  }
}
