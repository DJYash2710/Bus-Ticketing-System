import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/routing/route_paths.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/app_header.dart';
import '../../../shared/widgets/status_badge.dart';
import '../models/booking_item.dart';
import '../providers/bookings_providers.dart';

/// Refreshes trip list whenever the user opens My Trips.
class MyTripsScreen extends ConsumerStatefulWidget {
  const MyTripsScreen({super.key});

  @override
  ConsumerState<MyTripsScreen> createState() => _MyTripsScreenState();
}

class _MyTripsScreenState extends ConsumerState<MyTripsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.invalidate(myBookingsProvider);
    });
  }

  @override
  Widget build(BuildContext context) {
    final bookings = ref.watch(myBookingsProvider);

    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: const AppHeader(),
        body: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
              child: Text('My Trips', style: Theme.of(context).textTheme.headlineMedium),
            ),
            const TabBar(
              labelColor: AppColors.primary,
              unselectedLabelColor: AppColors.textSecondary,
              indicatorColor: AppColors.primary,
              tabs: [
                Tab(text: 'Upcoming'),
                Tab(text: 'Past'),
                Tab(text: 'Cancelled'),
              ],
            ),
            Expanded(
              child: bookings.when(
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (e, _) => Center(child: Text('Error: $e')),
                data: (items) => TabBarView(
                  children: [
                    _BookingList(
                      items: items.where((b) => b.isUpcoming).toList(),
                      empty: 'No upcoming trips',
                    ),
                    _BookingList(
                      items: items.where((b) => b.isPast).toList(),
                      empty: 'No past trips',
                    ),
                    _BookingList(
                      items: items.where((b) => b.isCancelled).toList(),
                      empty: 'No cancelled trips',
                    ),
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

class _BookingList extends StatelessWidget {
  const _BookingList({required this.items, required this.empty});

  final List<BookingItem> items;
  final String empty;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return Center(child: Text(empty));
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: items.length,
      itemBuilder: (context, i) => _BookingCard(item: items[i]),
    );
  }
}

class _BookingCard extends StatelessWidget {
  const _BookingCard({required this.item});

  final BookingItem item;

  StatusBadge _badge() {
    return switch (item.status) {
      'CONFIRMED' => StatusBadge.confirmed(),
      'PENDING' => StatusBadge.pending(),
      'CANCELLED' => StatusBadge.cancelled(),
      'COMPLETED' => StatusBadge.completed(),
      _ => StatusBadge(label: item.status, color: AppColors.textSecondary),
    };
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    '${item.fromCityName} → ${item.toCityName}',
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 16,
                    ),
                  ),
                ),
                _badge(),
              ],
            ),
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(formatDateTime(item.departureTime)),
                  Text(
                    item.seatNumbers.join(', '),
                    style: const TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Text('PNR: ${item.pnr}'),
                const Spacer(),
                if (item.status == 'PENDING' && item.paymentStatus != 'SUCCESS')
                  TextButton(
                    onPressed: () => context.push(
                      RoutePaths.payment
                          .replaceFirst(':bookingId', '${item.id}'),
                    ),
                    child: const Text('Pay Now'),
                  )
                else
                  OutlinedButton(
                    onPressed: () => context.push(
                      RoutePaths.bookingDetail.replaceFirst(':id', '${item.id}'),
                    ),
                    child: const Text('View Ticket'),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
