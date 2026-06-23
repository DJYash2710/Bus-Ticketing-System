import 'package:flutter_riverpod/flutter_riverpod.dart';

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
    this.travelDate,
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
  final String? travelDate;

  double get baseFare =>
      (schedule?.basePrice ?? seatLayout?.basePrice ?? 0) *
      selectedSeats.length;

  double get payableTotal => totalAmount ?? (baseFare + (taxAmount ?? 0));

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
    String? travelDate,
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
        travelDate: travelDate ?? this.travelDate,
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
    String? travelDate,
  }) {
    state = BookingFlowState(
      schedule: schedule,
      fromCityName: fromCityName,
      toCityName: toCityName,
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

  void reset() => state = const BookingFlowState();
}
