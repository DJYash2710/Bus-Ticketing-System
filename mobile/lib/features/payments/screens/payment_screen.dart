import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../config/providers/pricing_providers.dart';
import '../../../core/error/result.dart';
import '../../../core/routing/route_paths.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/price_breakdown.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../bookings/providers/booking_flow_provider.dart';
import '../models/payment_item.dart';
import '../providers/payments_providers.dart';
import '../services/stripe_payment_sheet.dart';
import '../../../core/services/stripe_service.dart';

class PaymentScreen extends ConsumerStatefulWidget {
  const PaymentScreen({required this.bookingId, super.key});

  final int bookingId;

  @override
  ConsumerState<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends ConsumerState<PaymentScreen> {
  PaymentItem? _payment;
  bool _loading = true;
  bool _paying = false;
  Timer? _timer;
  Duration _remaining = const Duration(minutes: 10);

  @override
  void initState() {
    super.initState();
    _init();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      final hold = ref.read(bookingFlowProvider).holdExpiresAt;
      if (hold != null && mounted) {
        setState(() {
          _remaining = hold.difference(DateTime.now());
          if (_remaining.isNegative) _remaining = Duration.zero;
        });
      }
    });
  }

  Future<void> _init() async {
    try {
      final result = await ref
          .read(paymentsRepositoryProvider)
          .initiatePayment(widget.bookingId);
      switch (result) {
        case Success(:final value):
          ref.read(bookingFlowProvider.notifier).setPaymentId(value.id);
          if (!mounted) return;

          if (value.isCompleted) {
            _goToSuccess(value.id);
            return;
          }

          setState(() {
            _payment = value;
            _loading = false;
          });

          if (value.isProcessing) {
            unawaited(_pollForConfirmation(value.id));
          }
        case Error(:final failure):
          setState(() => _loading = false);
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Failed to initiate payment: $failure')),
            );
          }
      }
    } catch (e) {
      setState(() => _loading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to initiate payment: $e')),
        );
      }
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _pay() async {
    if (_payment == null) return;
    setState(() => _paying = true);

    try {
      if (_payment!.isStripe) {
        await _payWithStripe(_payment!);
        return;
      }

      final result =
          await ref.read(paymentsRepositoryProvider).confirmPayment(_payment!.id);
      switch (result) {
        case Success():
          if (mounted) _goToSuccess(_payment!.id);
        case Error(:final failure):
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Payment failed: $failure')),
            );
          }
      }
    } catch (e) {
      if (mounted && !isStripeUserCancellation(e)) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Payment failed: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _paying = false);
    }
  }

  Future<void> _payWithStripe(PaymentItem payment) async {
    if (!isStripeNativePlatform) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Stripe checkout needs Android or iOS. '
              'Connect a phone or start an Android emulator, then run '
              'flutter run -d android.',
            ),
            duration: Duration(seconds: 6),
          ),
        );
      }
      return;
    }

    if (!payment.isReadyForStripeSheet) {
      if (payment.isProcessing) {
        await _pollForConfirmation(payment.id);
        return;
      }

      throw StateError('Stripe payment is not ready for checkout');
    }

    try {
      await ref.read(pricingConfigProvider.notifier).loadFromApi();
      final pricing = ref.read(pricingConfigProvider);
      await StripeService.instance.ensureConfigured(pricing);
      await presentStripePaymentSheet(payment.clientSecret!);
    } catch (e) {
      if (!isStripeUserCancellation(e) && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(stripePaymentErrorMessage(e))),
        );
      }
      return;
    }

    await _syncStripePaymentAfterSheet(payment.id);
  }

  /// Reconcile with Stripe when the webhook has not updated the DB yet.
  Future<void> _syncStripePaymentAfterSheet(int paymentId) async {
    final syncResult = await ref
        .read(paymentsRepositoryProvider)
        .initiatePayment(widget.bookingId);

    if (syncResult case Success(:final value)) {
      if (value.isCompleted) {
        if (mounted) _goToSuccess(paymentId);
        return;
      }
    }

    await _pollForConfirmation(paymentId);
  }

  Future<void> _pollForConfirmation(int paymentId) async {
    if (!mounted) return;

    setState(() => _paying = true);

    try {
      for (var attempt = 0; attempt < 15; attempt++) {
        await Future<void>.delayed(const Duration(seconds: 2));
        if (!mounted) return;

        final result = await ref
            .read(paymentsRepositoryProvider)
            .getPaymentByBooking(widget.bookingId);

        switch (result) {
          case Success(:final value):
            if (value.status == 'SUCCESS') {
              if (mounted) _goToSuccess(paymentId);
              return;
            }
            if (value.status == 'REFUNDED') {
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text(
                      'Your hold expired before payment completed. '
                      'A refund has been issued.',
                    ),
                  ),
                );
              }
              return;
            }
          case Error():
            break;
        }
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Payment received. Confirmation is still processing — '
              'check My Trips shortly.',
            ),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _paying = false);
    }
  }

  void _goToSuccess(int paymentId) {
    context.go(RoutePaths.paymentStatus.replaceFirst(':id', '$paymentId'));
  }

  String get _timerLabel {
    final m = _remaining.inMinutes.remainder(60).toString().padLeft(2, '0');
    final s = _remaining.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  @override
  Widget build(BuildContext context) {
    final flow = ref.watch(bookingFlowProvider);
    final pricing = ref.watch(pricingConfigProvider);
    final usesStripe = pricing.usesStripe || (_payment?.isStripe ?? false);
    final amount =
        _payment?.amount ?? flow.totalAmount ?? flow.estimatedTotalFor(pricing);
    final breakdown = PriceBreakdownData.fromParts(
      baseAmount: flow.baseFare,
      taxAmount: flow.taxAmount ?? flow.gstAmountFor(pricing),
      pricing: pricing,
      couponDiscount: flow.couponDiscount,
      loyaltyDiscount: flow.creditsToRedeem * pricing.loyaltyPointValue,
      seatCount: flow.selectedSeats.length,
    );

    return Scaffold(
      appBar: AppBar(title: const Text('Complete Payment')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.timerBanner,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.timer_outlined, color: AppColors.tertiary),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Seats reserved — pay within $_timerLabel',
                          style: const TextStyle(fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                const Text('Total Amount Due',
                    style: TextStyle(color: AppColors.textSecondary)),
                Text(
                  formatCurrency(amount),
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        color: AppColors.primary,
                      ),
                ),
                TextButton(
                  onPressed: () =>
                      showPriceDistributionSheet(context, breakdown, pricing),
                  child: const Text('View details'),
                ),
                const SizedBox(height: 16),
                if (usesStripe) ...[
                  Text('Secure checkout',
                      style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 12),
                  Card(
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: AppColors.surface,
                        child: Icon(Icons.lock_rounded, color: AppColors.primary),
                      ),
                      title: const Text('Pay with Stripe',
                          style: TextStyle(fontWeight: FontWeight.w600)),
                      subtitle: Text(
                        _payment?.isProcessing ?? false
                            ? 'Confirming your payment…'
                            : 'UPI, cards, and net banking via Stripe',
                      ),
                    ),
                  ),
                ] else ...[
                  Text('Payment Method',
                      style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 12),
                  const _MockMethodHint(),
                ],
              ],
            ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            PrimaryButton(
              label: _payment?.isProcessing ?? false
                  ? 'Confirming payment…'
                  : 'Pay ${formatCurrency(amount)}',
              icon: Icons.arrow_forward_rounded,
              isLoading: _paying,
              onPressed: (_payment?.isProcessing ?? false) ? null : _pay,
            ),
            const SizedBox(height: 8),
            const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.lock_outline, size: 14, color: AppColors.textSecondary),
                SizedBox(width: 4),
                Text('100% SECURE PAYMENT',
                    style: TextStyle(
                        fontSize: 11, color: AppColors.textSecondary)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _MockMethodHint extends StatelessWidget {
  const _MockMethodHint();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: AppColors.surface,
          child: Icon(Icons.payments_outlined, color: AppColors.primary),
        ),
        title: const Text('Mock payment',
            style: TextStyle(fontWeight: FontWeight.w600)),
        subtitle: const Text('Development mode — instant confirmation'),
      ),
    );
  }
}
