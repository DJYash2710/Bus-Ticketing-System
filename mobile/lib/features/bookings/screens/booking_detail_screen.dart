import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../config/providers/pricing_providers.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/app_header.dart';
import '../../../shared/widgets/price_breakdown.dart';
import '../providers/bookings_providers.dart';

class BookingDetailScreen extends ConsumerWidget {
  const BookingDetailScreen({required this.bookingId, super.key});

  final int bookingId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final booking = ref.watch(bookingDetailProvider(bookingId));
    final pricing = ref.watch(pricingConfigProvider);

    return Scaffold(
      appBar: const AppHeader(showBack: true, title: 'Ticket'),
      body: booking.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (item) => ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('PNR: ${item.pnr}',
                        style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 8),
                    Text('${item.fromCityName} → ${item.toCityName}',
                        style: const TextStyle(fontSize: 18)),
                    const Divider(height: 24),
                    Text('Passenger', style: Theme.of(context).textTheme.titleSmall),
                    if (item.passengerName != null) Text(item.passengerName!),
                    if (item.passengerEmail != null)
                      Text(item.passengerEmail!,
                          style: const TextStyle(color: Colors.grey)),
                    const SizedBox(height: 12),
                    Text(item.busName),
                    Text(formatDateTime(item.departureTime)),
                    if (item.boardingPoint != null) ...[
                      const SizedBox(height: 8),
                      Text('Boarding: ${item.boardingPoint}'),
                    ],
                    if (item.droppingPoint != null)
                      Text('Dropping: ${item.droppingPoint}'),
                    const SizedBox(height: 8),
                    Text('Seats: ${item.seatNumbers.join(', ')}'),
                    const Divider(height: 24),
                    Text('Price Distribution',
                        style: Theme.of(context).textTheme.titleSmall),
                    const SizedBox(height: 8),
                    PriceBreakdownRows(
                      data: PriceBreakdownData(
                        baseAmount: item.baseAmount,
                        taxAmount: item.taxAmount,
                        commissionAmount: item.commissionAmount > 0
                            ? item.commissionAmount
                            : item.baseAmount *
                                (item.commissionRate ??
                                    pricing.platformCommissionRate),
                        commissionRate: item.commissionRate ??
                            pricing.platformCommissionRate,
                        gstRate: pricing.gstRate,
                        discountAmount: item.discountAmount,
                        couponDiscount: item.discountAmount,
                        totalAmount: item.totalAmount,
                        seatCount: item.seatNumbers.length,
                      ),
                      pricing: pricing,
                    ),
                    Text('Status: ${item.status}'),
                    Text('Payment: ${item.paymentStatus}'),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
