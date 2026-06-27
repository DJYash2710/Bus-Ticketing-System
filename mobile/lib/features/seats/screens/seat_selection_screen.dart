import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/routing/route_paths.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/app_header.dart';
import '../../../shared/widgets/primary_button.dart';
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
                      final seatSize =
                          (constraints.maxWidth / 8).clamp(32.0, 44.0);
                      return _SeatGrid(
                        seats: layout.seats,
                        selectedIds: selectedIds,
                        seatSize: seatSize,
                        onTap: (seat) => ref
                            .read(bookingFlowProvider.notifier)
                            .toggleSeat(seat),
                      );
                    },
                  ),
                ),
              ),
              _BottomBar(
                count: flow.selectedSeats.length,
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

class _SeatGrid extends StatelessWidget {
  const _SeatGrid({
    required this.seats,
    required this.selectedIds,
    required this.onTap,
    required this.seatSize,
  });

  final List<SeatMapItem> seats;
  final Set<int> selectedIds;
  final ValueChanged<SeatMapItem> onTap;
  final double seatSize;

  @override
  Widget build(BuildContext context) {
    final rows = <int, List<SeatMapItem>>{};
    for (final seat in seats) {
      rows.putIfAbsent(seat.row ?? 0, () => []).add(seat);
    }

    final sortedRows = rows.keys.toList()..sort();

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            const Align(
              alignment: Alignment.centerRight,
              child: Icon(Icons.settings_rounded, color: AppColors.textSecondary),
            ),
            const Text('LOWER DECK',
                style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
            const SizedBox(height: 12),
            ...sortedRows.map((rowNum) {
              final rowSeats = rows[rowNum] ?? [];
              rowSeats.sort((a, b) => (a.col ?? 0).compareTo(b.col ?? 0));
              final displayRow = rowNum + 1;
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(
                  children: [
                    Expanded(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: rowSeats
                            .where((s) => (s.col ?? 0) <= 2)
                            .map((s) => _SeatCell(
                                  seat: s,
                                  selected: selectedIds.contains(s.id),
                                  size: seatSize,
                                  onTap: () => onTap(s),
                                ))
                            .toList(),
                      ),
                    ),
                    SizedBox(
                      width: 28,
                      child: Text('$displayRow',
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 12)),
                    ),
                    Expanded(
                      child: Row(
                        children: rowSeats
                            .where((s) => (s.col ?? 0) > 2)
                            .map((s) => _SeatCell(
                                  seat: s,
                                  selected: selectedIds.contains(s.id),
                                  size: seatSize,
                                  onTap: () => onTap(s),
                                ))
                            .toList(),
                      ),
                    ),
                  ],
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}

class _SeatCell extends StatelessWidget {
  const _SeatCell({
    required this.seat,
    required this.selected,
    required this.onTap,
    required this.size,
  });

  final SeatMapItem seat;
  final bool selected;
  final VoidCallback onTap;
  final double size;

  @override
  Widget build(BuildContext context) {
    final disabled = seat.status != SeatMapStatus.available && !selected;
    Color bg = Colors.white;
    Color border = AppColors.primary;
    if (selected) {
      bg = AppColors.primary;
    } else if (seat.status == SeatMapStatus.booked) {
      bg = const Color(0xFFE5E7EB);
      border = Colors.grey.shade300;
    } else if (seat.status == SeatMapStatus.held) {
      bg = AppColors.holdSeat;
      border = AppColors.holdSeat;
    }

    return Padding(
      padding: const EdgeInsets.all(3),
      child: InkWell(
        onTap: disabled ? null : onTap,
        child: Container(
          width: size,
          height: size,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: bg,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: border),
          ),
          child: Text(
            seat.seatNumber,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: selected ? Colors.white : AppColors.textPrimary,
            ),
          ),
        ),
      ),
    );
  }
}

class _BottomBar extends StatelessWidget {
  const _BottomBar({
    required this.count,
    required this.seatsLabel,
    required this.total,
    required this.onContinue,
  });

  final int count;
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
                child: Text('SELECTED $count Seats ($seatsLabel)'),
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
