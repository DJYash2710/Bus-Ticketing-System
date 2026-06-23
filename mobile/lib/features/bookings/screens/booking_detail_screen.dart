import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/app_header.dart';
import '../providers/bookings_providers.dart';
class BookingDetailScreen extends ConsumerWidget {
  const BookingDetailScreen({required this.bookingId, super.key});

  final int bookingId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final booking = ref.watch(bookingDetailProvider(bookingId));

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
                    Text(item.busName),
                    Text(formatDateTime(item.departureTime)),
                    const SizedBox(height: 8),
                    Text('Seats: ${item.seatNumbers.join(', ')}'),
                    Text('Amount: ${formatCurrency(item.totalAmount)}'),
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
