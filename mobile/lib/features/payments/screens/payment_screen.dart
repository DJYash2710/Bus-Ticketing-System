import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/error/result.dart';
import '../../../core/routing/route_paths.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../bookings/providers/booking_flow_provider.dart';
import '../models/payment_item.dart';
import '../providers/payments_providers.dart';

enum PaymentMethodOption { upi, card, netBanking, wallet }

class PaymentScreen extends ConsumerStatefulWidget {
  const PaymentScreen({required this.bookingId, super.key});

  final int bookingId;

  @override
  ConsumerState<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends ConsumerState<PaymentScreen> {
  PaymentMethodOption _method = PaymentMethodOption.upi;
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
      final result =
          await ref.read(paymentsRepositoryProvider).initiatePayment(widget.bookingId);
      switch (result) {
        case Success(:final value):
          ref.read(bookingFlowProvider.notifier).setPaymentId(value.id);
          setState(() {
            _payment = value;
            _loading = false;
          });
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
      final result =
          await ref.read(paymentsRepositoryProvider).confirmPayment(_payment!.id);
      switch (result) {
        case Success():
          if (mounted) {
            context.go(
              RoutePaths.paymentStatus.replaceFirst(':id', '${_payment!.id}'),
            );
          }
        case Error(:final failure):
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Payment failed: $failure')),
            );
          }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Payment failed: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _paying = false);
    }
  }

  String get _timerLabel {
    final m = _remaining.inMinutes.remainder(60).toString().padLeft(2, '0');
    final s = _remaining.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  @override
  Widget build(BuildContext context) {
    final flow = ref.watch(bookingFlowProvider);
    final amount = _payment?.amount ?? flow.payableTotal;

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
                const SizedBox(height: 24),
                Text('Payment Method',
                    style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 12),
                _MethodTile(
                  title: 'UPI',
                  subtitle: 'Google Pay, PhonePe, Paytm',
                  icon: Icons.qr_code_rounded,
                  selected: _method == PaymentMethodOption.upi,
                  onTap: () =>
                      setState(() => _method = PaymentMethodOption.upi),
                ),
                _MethodTile(
                  title: 'Credit / Debit Card',
                  subtitle: 'Visa, Mastercard, RuPay',
                  icon: Icons.credit_card_rounded,
                  selected: _method == PaymentMethodOption.card,
                  onTap: () =>
                      setState(() => _method = PaymentMethodOption.card),
                ),
                _MethodTile(
                  title: 'Net Banking',
                  subtitle: 'All major Indian banks',
                  icon: Icons.account_balance_rounded,
                  selected: _method == PaymentMethodOption.netBanking,
                  onTap: () =>
                      setState(() => _method = PaymentMethodOption.netBanking),
                ),
                _MethodTile(
                  title: 'Wallets',
                  subtitle: 'Amazon Pay, Mobikwik',
                  icon: Icons.account_balance_wallet_outlined,
                  selected: _method == PaymentMethodOption.wallet,
                  onTap: () =>
                      setState(() => _method = PaymentMethodOption.wallet),
                ),
              ],
            ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            PrimaryButton(
              label: 'Pay ${formatCurrency(amount)}',
              icon: Icons.arrow_forward_rounded,
              isLoading: _paying,
              onPressed: _pay,
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

class _MethodTile extends StatelessWidget {
  const _MethodTile({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.selected,
    required this.onTap,
  });

  final String title;
  final String subtitle;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: selected ? AppColors.primary : AppColors.border,
          width: selected ? 1.5 : 1,
        ),
      ),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: AppColors.surface,
          child: Icon(icon, color: AppColors.primary),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(subtitle),
        trailing: Icon(
          selected ? Icons.radio_button_checked : Icons.radio_button_off,
          color: selected ? AppColors.primary : AppColors.textSecondary,
        ),
        onTap: onTap,
      ),
    );
  }
}
