/// REST path segments relative to [AppConfig.apiBaseUrl].
class ApiConstants {
  ApiConstants._();

  // Cities
  static const String cities = '/cities';

  // Auth
  static const String authRegister = '/auth/register';
  static const String authLogin = '/auth/login';
  static const String authRefresh = '/auth/refresh';
  static const String authLogout = '/auth/logout';
  static const String authMe = '/auth/me';

  // Search
  static const String search = '/search';

  // Schedules
  static const String schedules = '/schedules';

  // Seats
  static const String seats = '/seats';

  // Bookings
  static const String bookings = '/bookings';
  static const String myBookings = '/bookings/my-bookings';

  // Payments
  static const String payments = '/payments';

  // Profile / Users
  static const String users = '/users';
  static const String usersMe = '/users/me';

  // Admin
  static const String admin = '/admin';
  static const String adminAuditLogs = 'audit-logs';
}
