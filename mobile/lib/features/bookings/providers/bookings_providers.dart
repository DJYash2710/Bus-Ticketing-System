import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/error/result.dart';
import '../../../shared/providers/core_providers.dart';
import '../models/booking_item.dart';
import '../repositories/bookings_repository.dart';
import '../repositories/bookings_repository_impl.dart';
import '../services/bookings_api_service.dart';

final bookingsApiServiceProvider = Provider(
  (ref) => BookingsApiService(ref.watch(dioProvider)),
);

final bookingsRepositoryProvider = Provider<BookingsRepository>(
  (ref) => BookingsRepositoryImpl(ref.watch(bookingsApiServiceProvider)),
);

final myBookingsProvider = FutureProvider<List<BookingItem>>((ref) async {
  final result = await ref.watch(bookingsRepositoryProvider).listMyBookings();
  return switch (result) {
    Success(:final value) => value,
    Error(:final failure) => throw failure,
  };
});

final bookingDetailProvider =
    FutureProvider.family<BookingItem, int>((ref, id) async {
  final result = await ref.watch(bookingsRepositoryProvider).getBooking(id);
  return switch (result) {
    Success(:final value) => value,
    Error(:final failure) => throw failure,
  };
});
