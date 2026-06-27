import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../config/pricing_config.dart';
import '../../search/models/search_result.dart';
import '../../seats/models/seat_layout_data.dart';

class BookingFlowState {
  const BookingFlowState({
    this.schedule,
    this.seatLayout,
    this.selectedSeats = const [],
    this.boardingPoint,
    this.droppingPoint,
    this.bookingId,
    this.paymentId,
    this.totalAmount,
    this.taxAmount,
    this.holdExpiresAt,
    this.fromCityName,
    this.toCityName,
    this.fromCityId,
    this.toCityId,
    this.travelDate,
    this.couponCode,
    this.couponDiscount = 0,
    this.creditsToRedeem = 0,
  });

  final ScheduleSearchItem? schedule;
  final SeatLayoutData? seatLayout;
  final List<SeatMapItem> selectedSeats;
  final String? boardingPoint;
  final String? droppingPoint;
  final int? bookingId;
  final int? paymentId;
  final double? totalAmount;
  final double? taxAmount;
  final DateTime? holdExpiresAt;
  final String? fromCityName;
  final String? toCityName;
  final int? fromCityId;
  final int? toCityId;
  final String? travelDate;
  final String? couponCode;
  final double couponDiscount;
  final int creditsToRedeem;

  double get baseFare =>
      (schedule?.basePrice ?? seatLayout?.basePrice ?? 0) *
      selectedSeats.length;

  double gstAmountFor(PricingConfig pricing) => baseFare * pricing.gstRate;

  double discountTotalFor(PricingConfig pricing) =>
      couponDiscount + (creditsToRedeem * pricing.loyaltyPointValue);

  double estimatedTotalFor(PricingConfig pricing) =>
      (baseFare + gstAmountFor(pricing) - discountTotalFor(pricing))
          .clamp(0, double.infinity);

  double commissionAmountFor(PricingConfig pricing) =>
      baseFare * pricing.platformCommissionRate;

  String get seatNumbersLabel =>
      selectedSeats.map((s) => s.seatNumber).join(', ');

  String pnrFor(int id) => 'TT$id';

  BookingFlowState copyWith({
    ScheduleSearchItem? schedule,
    SeatLayoutData? seatLayout,
    List<SeatMapItem>? selectedSeats,
    String? boardingPoint,
    String? droppingPoint,
    int? bookingId,
    int? paymentId,
    double? totalAmount,
    double? taxAmount,
    DateTime? holdExpiresAt,
    String? fromCityName,
    String? toCityName,
    int? fromCityId,
    int? toCityId,
    String? travelDate,
    String? couponCode,
    double? couponDiscount,
    int? creditsToRedeem,
  }) =>
      BookingFlowState(
        schedule: schedule ?? this.schedule,
        seatLayout: seatLayout ?? this.seatLayout,
        selectedSeats: selectedSeats ?? this.selectedSeats,
        boardingPoint: boardingPoint ?? this.boardingPoint,
        droppingPoint: droppingPoint ?? this.droppingPoint,
        bookingId: bookingId ?? this.bookingId,
        paymentId: paymentId ?? this.paymentId,
        totalAmount: totalAmount ?? this.totalAmount,
        taxAmount: taxAmount ?? this.taxAmount,
        holdExpiresAt: holdExpiresAt ?? this.holdExpiresAt,
        fromCityName: fromCityName ?? this.fromCityName,
        toCityName: toCityName ?? this.toCityName,
        fromCityId: fromCityId ?? this.fromCityId,
        toCityId: toCityId ?? this.toCityId,
        travelDate: travelDate ?? this.travelDate,
        couponCode: couponCode ?? this.couponCode,
        couponDiscount: couponDiscount ?? this.couponDiscount,
        creditsToRedeem: creditsToRedeem ?? this.creditsToRedeem,
      );
}

final bookingFlowProvider =
    NotifierProvider<BookingFlowNotifier, BookingFlowState>(
  BookingFlowNotifier.new,
);

class BookingFlowNotifier extends Notifier<BookingFlowState> {
  @override
  BookingFlowState build() => const BookingFlowState();

  void setScheduleContext({
    required ScheduleSearchItem schedule,
    String? fromCityName,
    String? toCityName,
    int? fromCityId,
    int? toCityId,
    String? travelDate,
  }) {
    state = BookingFlowState(
      schedule: schedule,
      fromCityName: fromCityName,
      toCityName: toCityName,
      fromCityId: fromCityId,
      toCityId: toCityId,
      travelDate: travelDate,
    );
  }

  void setSeatLayout(SeatLayoutData layout) =>
      state = state.copyWith(seatLayout: layout);

  void toggleSeat(SeatMapItem seat) {
    final selected = List<SeatMapItem>.from(state.selectedSeats);
    final exists = selected.any((s) => s.id == seat.id);
    if (exists) {
      selected.removeWhere((s) => s.id == seat.id);
    } else if (seat.status == SeatMapStatus.available) {
      selected.add(seat);
    }
    state = state.copyWith(selectedSeats: selected);
  }

  void setBoardingPoint(String value) =>
      state = state.copyWith(boardingPoint: value);

  void setDroppingPoint(String value) =>
      state = state.copyWith(droppingPoint: value);

  void setBookingResult({
    required int bookingId,
    required double totalAmount,
    required double taxAmount,
    DateTime? holdExpiresAt,
  }) =>
      state = state.copyWith(
        bookingId: bookingId,
        totalAmount: totalAmount,
        taxAmount: taxAmount,
        holdExpiresAt: holdExpiresAt,
      );

  void setPaymentId(int paymentId) =>
      state = state.copyWith(paymentId: paymentId);

  void setCoupon({String? code, double discount = 0}) =>
      state = state.copyWith(couponCode: code, couponDiscount: discount);

  void setCreditsToRedeem(int credits) =>
      state = state.copyWith(creditsToRedeem: credits);

  void reset() => state = const BookingFlowState();
}
