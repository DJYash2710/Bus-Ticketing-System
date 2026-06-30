import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/booking_constants.dart';
import '../../../core/routing/route_paths.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/app_header.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../../shared/widgets/bus_seat_diagram.dart';
import '../../bookings/providers/booking_flow_provider.dart';
import '../models/seat_layout_data.dart';
import '../providers/seats_providers.dart';
class SeatSelectionScreen extends ConsumerWidget {
  const SeatSelectionScreen({required this.scheduleId, super.key});

  final int scheduleId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final layoutAsync = ref.watch(seatLayoutProvider(scheduleId));
    final flow = ref.watch(bookingFlowProvider);
    final selectedIds = flow.selectedSeats.map((s) => s.id).toSet();

    ref.listen(seatLayoutProvider(scheduleId), (_, next) {
      next.whenData(
        (layout) => ref.read(bookingFlowProvider.notifier).setSeatLayout(layout),
      );
    });

    return Scaffold(
      appBar: const AppHeader(showBack: true),
      body: layoutAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Failed to load seats: $e')),
        data: (layout) {
          return Column(
            children: [
              _TripStrip(layout: layout),
              _Legend(),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: LayoutBuilder(
                    builder: (context, constraints) {
                      final geometry = layout.layout;
                      final gridWidth = geometry != null
                          ? geometry.seatsLeft + 1 + geometry.seatsRight
                          : 5;
                      final seatSize =
                          (constraints.maxWidth / (gridWidth + 2)).clamp(28.0, 44.0);
                      return BusSeatDiagram(
                        seats: layout.seats,
                        layout: layout.layout,
                        selectedIds: selectedIds,
                        seatSize: seatSize,
                        onSeatTap: (seat) {
                          final flow = ref.read(bookingFlowProvider);
                          final atLimit =
                              flow.selectedSeats.length >=
                                  BookingConstants.maxSeatsPerBooking &&
                              !selectedIds.contains(seat.id);
                          if (atLimit) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('You can select up to 5 seats'),
                              ),
                            );
                            return;
                          }
                          ref
                              .read(bookingFlowProvider.notifier)
                              .toggleSeat(seat);
                        },
                      );
                    },
                  ),
                ),
              ),
              _BottomBar(
                count: flow.selectedSeats.length,
                maxSeats: BookingConstants.maxSeatsPerBooking,
                seatsLabel: flow.seatNumbersLabel,
                total: flow.baseFare,
                onContinue: flow.selectedSeats.isEmpty
                    ? null
                    : () => context.push(RoutePaths.bookingReview),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _TripStrip extends StatelessWidget {
  const _TripStrip({required this.layout});
  final SeatLayoutData layout;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(
              '${layout.fromCityName} → ${layout.toCityName}\n${formatDate(layout.departureTime)} • ${layout.busType}',
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
          TextButton(onPressed: () => context.pop(), child: const Text('Edit')),
        ],
      ),
    );
  }
}

class _Legend extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Wrap(
        spacing: 12,
        children: const [
          _LegendItem(color: Colors.white, border: AppColors.primary, label: 'Available'),
          _LegendItem(color: AppColors.primary, label: 'Selected'),
          _LegendItem(color: Color(0xFFE5E7EB), label: 'Booked', strike: true),
          _LegendItem(color: AppColors.holdSeat, label: 'Held'),
        ],
      ),
    );
  }
}

class _LegendItem extends StatelessWidget {
  const _LegendItem({
    required this.color,
    required this.label,
    this.border,
    this.strike = false,
  });

  final Color color;
  final String label;
  final Color? border;
  final bool strike;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 18,
          height: 18,
          decoration: BoxDecoration(
            color: color,
            border: Border.all(color: border ?? Colors.grey.shade300),
            borderRadius: BorderRadius.circular(4),
          ),
          child: strike
              ? const Center(
                  child: RotatedBox(
                    quarterTurns: 1,
                    child: Divider(color: Colors.grey, height: 14),
                  ),
                )
              : null,
        ),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(fontSize: 12)),
      ],
    );
  }
}

class _BottomBar extends StatelessWidget {
  const _BottomBar({
    required this.count,
    required this.maxSeats,
    required this.seatsLabel,
    required this.total,
    required this.onContinue,
  });

  final int count;
  final int maxSeats;
  final String seatsLabel;
  final double total;
  final VoidCallback? onContinue;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: AppColors.border)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: Text('SELECTED $count/$maxSeats Seats ($seatsLabel)'),
              ),
              Text(
                'TOTAL ${formatCurrency(total)}',
                style: const TextStyle(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          PrimaryButton(
            label: 'Continue to Passenger Details',
            icon: Icons.arrow_forward_rounded,
            onPressed: onContinue,
          ),
        ],
      ),
    );
  }
}
