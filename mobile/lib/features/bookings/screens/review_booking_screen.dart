import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../config/providers/pricing_providers.dart';
import '../../../core/routing/route_paths.dart';
import '../../../core/error/result.dart';
import '../../../shared/widgets/price_breakdown.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/providers/core_providers.dart';
import '../../../shared/widgets/app_header.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../profile/providers/profile_providers.dart';
import '../../search/services/bus_stops_api_service.dart';
import '../services/coupons_api_service.dart';
import '../providers/booking_flow_provider.dart';
import '../providers/bookings_providers.dart';
import '../../seats/providers/seats_providers.dart';

class ReviewBookingScreen extends ConsumerStatefulWidget {
  const ReviewBookingScreen({super.key});

  @override
  ConsumerState<ReviewBookingScreen> createState() =>
      _ReviewBookingScreenState();
}

class _ReviewBookingScreenState extends ConsumerState<ReviewBookingScreen> {
  final _couponController = TextEditingController();
  String? _boarding;
  String? _dropping;
  List<BusStop> _boardingStops = [];
  List<BusStop> _droppingStops = [];
  bool _loading = false;
  bool _loadingStops = true;
  bool _applyingCoupon = false;
  int _creditsToRedeem = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadStops());
  }

  @override
  void dispose() {
    _couponController.dispose();
    super.dispose();
  }

  Future<void> _loadStops() async {
    final flow = ref.read(bookingFlowProvider);
    final fromId = flow.fromCityId;
    final toId = flow.toCityId;
    if (fromId == null || toId == null) {
      setState(() => _loadingStops = false);
      return;
    }
    try {
      final api = BusStopsApiService(ref.read(dioProvider));
      final results = await Future.wait([
        api.listByCity(fromId),
        api.listByCity(toId),
      ]);
      if (!mounted) return;
      setState(() {
        _boardingStops = results[0];
        _droppingStops = results[1];
        _boarding = _boardingStops.isNotEmpty ? _boardingStops.first.label : flow.fromCityName;
        _dropping = _droppingStops.isNotEmpty ? _droppingStops.first.label : flow.toCityName;
        _loadingStops = false;
      });
    } catch (_) {
      if (mounted) {
        setState(() {
          _boarding = flow.fromCityName;
          _dropping = flow.toCityName;
          _loadingStops = false;
        });
      }
    }
  }

  Future<void> _applyCoupon() async {
    final code = _couponController.text.trim();
    if (code.isEmpty) return;
    setState(() => _applyingCoupon = true);
    try {
      final flow = ref.read(bookingFlowProvider);
      final preview = await CouponsApiService(ref.read(dioProvider)).validate(
        code: code,
        baseAmount: flow.baseFare,
      );
      ref.read(bookingFlowProvider.notifier).setCoupon(
            code: preview.code,
            discount: preview.discountAmount,
          );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Coupon applied: -${formatCurrency(preview.discountAmount)}')),
        );
      }
    } catch (e) {
      ref.read(bookingFlowProvider.notifier).setCoupon(code: null, discount: 0);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Invalid coupon: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _applyingCoupon = false);
    }
  }

  Future<void> _confirm() async {
    final flow = ref.read(bookingFlowProvider);
    final boarding = _boarding?.trim() ?? '';
    final dropping = _dropping?.trim() ?? '';

    if (boarding.isEmpty || dropping.isEmpty) {
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
            boardingPoint: boarding,
            droppingPoint: dropping,
            couponCode: flow.couponCode,
            creditsToRedeem: _creditsToRedeem > 0 ? _creditsToRedeem : null,
          );
      switch (booking) {
        case Success(:final value):
          ref.read(bookingFlowProvider.notifier)
            ..setBoardingPoint(boarding)
            ..setDroppingPoint(dropping)
            ..setBookingResult(
              bookingId: value.id,
              totalAmount: value.totalAmount,
              taxAmount: value.taxAmount,
              holdExpiresAt: value.holdExpiresAt,
            );
          ref.invalidate(myBookingsProvider);
          ref.invalidate(seatLayoutProvider(scheduleId));
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
    final profile = ref.watch(userProfileProvider);
    final pricing = ref.watch(pricingConfigProvider);
    final schedule = flow.schedule;
    final layout = flow.seatLayout;
    final base = flow.baseFare;
    final tax = flow.gstAmountFor(pricing);
    final breakdown = PriceBreakdownData.fromParts(
      baseAmount: base,
      taxAmount: tax,
      pricing: pricing,
      couponDiscount: flow.couponDiscount,
      loyaltyDiscount: _creditsToRedeem * pricing.loyaltyPointValue,
      seatCount: flow.selectedSeats.length,
    );
    final maxCredits = profile.maybeWhen(
      data: (u) => u.creditsBalance,
      orElse: () => 0,
    );

    return Scaffold(
      appBar: const AppHeader(showBack: true, title: 'Review Booking'),
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
          Text('Boarding & Dropping', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          if (_loadingStops)
            const LinearProgressIndicator()
          else ...[
            DropdownButtonFormField<String>(
              initialValue: _boarding,
              decoration: const InputDecoration(labelText: 'Boarding Point'),
              items: (_boardingStops.isNotEmpty
                      ? _boardingStops.map((s) => s.label)
                      : [_boarding ?? ''])
                  .map((label) => DropdownMenuItem(value: label, child: Text(label)))
                  .toList(),
              onChanged: (v) => setState(() => _boarding = v),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              initialValue: _dropping,
              decoration: const InputDecoration(labelText: 'Dropping Point'),
              items: (_droppingStops.isNotEmpty
                      ? _droppingStops.map((s) => s.label)
                      : [_dropping ?? ''])
                  .map((label) => DropdownMenuItem(value: label, child: Text(label)))
                  .toList(),
              onChanged: (v) => setState(() => _dropping = v),
            ),
          ],
          const SizedBox(height: 20),
          Text('Coupons & Loyalty', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _couponController,
                  decoration: InputDecoration(
                    labelText: 'Coupon code',
                    hintText: 'SAVE10',
                    hintStyle: TextStyle(
                      color: AppColors.textSecondary.withValues(alpha: 0.2),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              FilledButton(
                onPressed: _applyingCoupon ? null : _applyCoupon,
                child: _applyingCoupon
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Apply'),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: Text('Redeem loyalty points (max $maxCredits)'),
              ),
              SizedBox(
                width: 80,
                child: TextField(
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(hintText: '0'),
                  onChanged: (v) {
                    final parsed = int.tryParse(v) ?? 0;
                    setState(() {
                      _creditsToRedeem = parsed.clamp(0, maxCredits).toInt();
                    });
                    ref.read(bookingFlowProvider.notifier)
                        .setCreditsToRedeem(_creditsToRedeem);
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Text('Price Distribution', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          PriceBreakdownRows(data: breakdown, pricing: pricing),
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
