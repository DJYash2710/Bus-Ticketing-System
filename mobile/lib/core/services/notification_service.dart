import 'package:flutter/foundation.dart';

/// Lightweight in-app notification helper (SnackBar-style alerts).
/// Platform push can be wired here later; booking flows call these hooks.
class NotificationService {
  NotificationService._();

  static final NotificationService instance = NotificationService._();

  final ValueNotifier<String?> ticketEvent = ValueNotifier(null);

  Future<void> init() async {}

  void notifyTicketConfirmed({required String pnr}) {
    ticketEvent.value = 'Ticket $pnr confirmed';
  }

  void notifyTicketCancelled({required String pnr}) {
    ticketEvent.value = 'Ticket $pnr cancelled';
  }

  void clear() => ticketEvent.value = null;
}
