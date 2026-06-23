/// Named route paths used by GoRouter and deep links.
abstract class RoutePaths {
  RoutePaths._();

  static const String splash = '/';
  static const String login = '/login';
  static const String register = '/register';

  static const String search = '/search';
  static const String schedules = '/schedules';
  static const String scheduleDetail = '/schedules/:id';

  static const String seats = '/seats/:scheduleId';
  static const String bookingReview = '/bookings/review';
  static const String bookings = '/bookings';
  static const String bookingDetail = '/bookings/:id';

  static const String payment = '/payments/:bookingId';
  static const String paymentStatus = '/payments/:id/status';

  static const String profile = '/profile';
  static const String profileEdit = '/profile/edit';

  static const String admin = '/admin';
  static const String adminAuditLogs = '/admin/audit-logs';
}
