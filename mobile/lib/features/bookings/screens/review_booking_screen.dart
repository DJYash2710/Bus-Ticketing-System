import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/error/result.dart';
import '../../../core/routing/route_paths.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/app_header.dart';
import '../../../shared/widgets/primary_button.dart';
import '../providers/booking_flow_provider.dart';
import '../providers/bookings_providers.dart';

class ReviewBookingScreen extends ConsumerStatefulWidget {
  const ReviewBookingScreen({super.key});

  @override
  ConsumerState<ReviewBookingScreen> createState() =>
      _ReviewBookingScreenState();
}

class _ReviewBookingScreenState extends ConsumerState<ReviewBookingScreen> {
  final _boarding = TextEditingController();
  final _dropping = TextEditingController();
  bool _loading = false;

  @override
  void dispose() {
    _boarding.dispose();
    _dropping.dispose();
    super.dispose();
  }

  Future<void> _confirm() async {
    final flow = ref.read(bookingFlowProvider);
    final schedule = flow.schedule ?? flow.seatLayout;
    if (schedule == null) return;

    if (_boarding.text.trim().isEmpty || _dropping.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Boarding and dropping points are required')),
      );
      return;
    }

    setState(() => _loading = true);
    try {
      final scheduleId = flow.schedule?.scheduleId ?? flow.seatLayout!.scheduleId;
      final booking = await ref.read(bookingsRepositoryProvider).createBooking(
            scheduleId: scheduleId,
            seatNumbers: flow.selectedSeats.map((s) => s.seatNumber).toList(),
            boardingPoint: _boarding.text.trim(),
            droppingPoint: _dropping.text.trim(),
          );
      switch (booking) {
        case Success(:final value):
          ref.read(bookingFlowProvider.notifier)
            ..setBoardingPoint(_boarding.text.trim())
            ..setDroppingPoint(_dropping.text.trim())
            ..setBookingResult(
              bookingId: value.id,
              totalAmount: value.totalAmount,
              taxAmount: 0,
              holdExpiresAt: value.holdExpiresAt,
            );
          if (mounted) {
            context.push(
              RoutePaths.payment.replaceFirst(':bookingId', '${value.id}'),
            );
          }
        case Error(:final failure):
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Booking failed: $failure')),
            );
          }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Booking failed: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final flow = ref.watch(bookingFlowProvider);
    final schedule = flow.schedule;
    final layout = flow.seatLayout;
    final base = flow.baseFare;
    const tax = 50.0;
    final total = base + tax;

    return Scaffold(
      appBar: const AppHeader(showBack: true, title: 'TealTransit'),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    schedule?.busName ?? layout?.busName ?? 'Bus',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  Text(
                    '${flow.fromCityName ?? layout?.fromCityName} → ${flow.toCityName ?? layout?.toCityName}',
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      _TimeCol(
                        label: 'Departure',
                        time: formatTime(
                          schedule?.departureTime ?? layout!.departureTime,
                        ),
                      ),
                      const Expanded(child: Divider()),
                      _TimeCol(
                        label: 'Arrival',
                        time: formatTime(
                          schedule?.arrivalTime ?? layout!.arrivalTime,
                        ),
                        alignEnd: true,
                      ),
                    ],
                  ),
                  Align(
                    alignment: Alignment.centerRight,
                    child: Chip(
                      label: Text(flow.seatNumbersLabel),
                      backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text('Boarding & Dropping Details',
              style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          TextField(
            controller: _boarding,
            decoration: const InputDecoration(labelText: 'Boarding Point'),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _dropping,
            decoration: const InputDecoration(labelText: 'Dropping Point'),
          ),
          const SizedBox(height: 20),
          Text('Fare Details', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          _FareRow(
            label: 'Base Fare (${flow.selectedSeats.length} Seats)',
            value: formatCurrency(base),
          ),
          _FareRow(label: 'Taxes & Fees', value: formatCurrency(tax)),
          const Divider(),
          _FareRow(
            label: 'Total Amount',
            value: formatCurrency(total),
            bold: true,
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.navActiveBg,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Row(
              children: [
                Icon(Icons.timer_outlined, color: AppColors.primary),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Hold tight! Seats reserved for 10 minutes while you complete your payment.',
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(16),
        child: PrimaryButton(
          label: 'Confirm Booking',
          icon: Icons.arrow_forward_rounded,
          isLoading: _loading,
          onPressed: _confirm,
        ),
      ),
    );
  }
}

class _TimeCol extends StatelessWidget {
  const _TimeCol({
    required this.label,
    required this.time,
    this.alignEnd = false,
  });

  final String label;
  final String time;
  final bool alignEnd;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment:
          alignEnd ? CrossAxisAlignment.end : CrossAxisAlignment.start,
      children: [
        Text(time, style: const TextStyle(fontWeight: FontWeight.w700)),
        Text(label, style: const TextStyle(fontSize: 12)),
      ],
    );
  }
}

class _FareRow extends StatelessWidget {
  const _FareRow({
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
