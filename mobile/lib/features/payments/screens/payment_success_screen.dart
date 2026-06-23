import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/routing/route_paths.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../bookings/providers/booking_flow_provider.dart';

class PaymentSuccessScreen extends ConsumerWidget {
  const PaymentSuccessScreen({required this.paymentId, super.key});

  final int paymentId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final flow = ref.watch(bookingFlowProvider);
    final bookingId = flow.bookingId;

    return Scaffold(
      backgroundColor: const Color(0xFF111827),
      body: SafeArea(
        child: Center(
          child: Card(
            margin: const EdgeInsets.all(24),
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const CircleAvatar(
                    radius: 40,
                    backgroundColor: AppColors.success,
                    child: Icon(Icons.check_rounded, color: Colors.white, size: 40),
                  ),
                  const SizedBox(height: 16),
                  Text('Booking Confirmed!',
                      style: Theme.of(context).textTheme.headlineSmall),
                  if (bookingId != null) ...[
                    const SizedBox(height: 8),
                    Text(
                      'PNR: ${flow.pnrFor(bookingId)}',
                      style: const TextStyle(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w700,
                        fontSize: 16,
                      ),
                    ),
                  ],
                  const SizedBox(height: 20),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      border: Border.all(color: AppColors.border),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('From ${flow.fromCityName ?? ''}'),
                            const Icon(Icons.arrow_forward_rounded, size: 16),
                            Text('To ${flow.toCityName ?? ''}'),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(flow.schedule?.busName ?? flow.seatLayout?.busName ?? ''),
                        if (flow.schedule != null)
                          Text(
                            '${formatTime(flow.schedule!.departureTime)} • ${formatDate(flow.schedule!.departureTime)}',
                            style: const TextStyle(fontWeight: FontWeight.w700),
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  PrimaryButton(
                    label: 'View Ticket',
                    onPressed: bookingId == null
                        ? null
                        : () => context.push(
                              RoutePaths.bookingDetail
                                  .replaceFirst(':id', '$bookingId'),
                            ),
                  ),
                  const SizedBox(height: 12),
                  OutlinedAppButton(
                    label: 'Back to Home',
                    onPressed: () {
                      ref.read(bookingFlowProvider.notifier).reset();
                      context.go(RoutePaths.search);
                    },
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
