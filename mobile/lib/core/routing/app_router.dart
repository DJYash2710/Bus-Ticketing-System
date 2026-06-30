import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/admin/screens/admin_panel_screen.dart';
import '../../features/admin/screens/audit_logs_screen.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/register_screen.dart';
import '../../features/auth/screens/splash_screen.dart';
import '../../features/bookings/screens/booking_detail_screen.dart';
import '../../features/bookings/screens/my_trips_screen.dart';
import '../../features/bookings/screens/review_booking_screen.dart';
import '../../features/payments/screens/payment_screen.dart';
import '../../features/payments/screens/payment_success_screen.dart';
import '../../features/profile/screens/edit_profile_screen.dart';
import '../../features/profile/screens/change_password_screen.dart';
import '../../features/profile/screens/loyalty_history_screen.dart';
import '../../features/profile/screens/profile_screen.dart';
import '../../features/search/screens/search_results_screen.dart';
import '../../features/search/screens/search_screen.dart';
import '../../features/seats/screens/seat_selection_screen.dart';
import '../../shared/widgets/main_shell.dart';
import 'route_guards.dart';
import 'route_paths.dart';
import 'router_refresh.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final refresh = ref.watch(routerRefreshListenableProvider);

  final router = GoRouter(
    initialLocation: RoutePaths.splash,
    debugLogDiagnostics: kDebugMode,
    refreshListenable: refresh,
    redirect: RouteGuards.authRedirect,
    routes: [
      GoRoute(
        path: RoutePaths.splash,
        name: 'splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: RoutePaths.login,
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: RoutePaths.register,
        name: 'register',
        builder: (context, state) => const RegisterScreen(),
      ),
      ShellRoute(
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(
            path: RoutePaths.search,
            name: 'search',
            builder: (context, state) => const SearchScreen(),
          ),
          GoRoute(
            path: RoutePaths.bookings,
            name: 'bookings',
            builder: (context, state) => const MyTripsScreen(),
          ),
          GoRoute(
            path: RoutePaths.profile,
            name: 'profile',
            builder: (context, state) => const ProfileScreen(),
          ),
        ],
      ),
      GoRoute(
        path: RoutePaths.schedules,
        name: 'schedules',
        builder: (context, state) {
          final q = state.uri.queryParameters;
          return SearchResultsScreen(
            fromCityId: int.parse(q['fromCityId']!),
            toCityId: int.parse(q['toCityId']!),
            date: q['date']!,
          );
        },
      ),
      GoRoute(
        path: RoutePaths.seats,
        name: 'seats',
        builder: (context, state) => SeatSelectionScreen(
          scheduleId: int.parse(state.pathParameters['scheduleId']!),
        ),
      ),
      GoRoute(
        path: RoutePaths.bookingReview,
        name: 'booking-review',
        builder: (context, state) => const ReviewBookingScreen(),
      ),
      GoRoute(
        path: RoutePaths.bookingDetail,
        name: 'booking-detail',
        builder: (context, state) => BookingDetailScreen(
          bookingId: int.parse(state.pathParameters['id']!),
        ),
      ),
      GoRoute(
        path: RoutePaths.payment,
        name: 'payment',
        builder: (context, state) => PaymentScreen(
          bookingId: int.parse(state.pathParameters['bookingId']!),
        ),
      ),
      GoRoute(
        path: RoutePaths.paymentStatus,
        name: 'payment-status',
        builder: (context, state) => PaymentSuccessScreen(
          paymentId: int.parse(state.pathParameters['id']!),
        ),
      ),
      GoRoute(
        path: RoutePaths.profileEdit,
        name: 'profile-edit',
        builder: (context, state) => const EditProfileScreen(),
      ),
      GoRoute(
        path: RoutePaths.changePassword,
        name: 'change-password',
        builder: (context, state) => const ChangePasswordScreen(),
      ),
      GoRoute(
        path: RoutePaths.loyaltyHistory,
        name: 'loyalty-history',
        builder: (context, state) => const LoyaltyHistoryScreen(),
      ),
      GoRoute(
        path: RoutePaths.admin,
        name: 'admin',
        redirect: RouteGuards.adminRedirect,
        builder: (context, state) => const AdminPanelScreen(),
        routes: [
          GoRoute(
            path: 'audit-logs',
            name: 'admin-audit-logs',
            builder: (context, state) => const AuditLogsScreen(),
          ),
        ],
      ),
    ],
  );

  ref.onDispose(router.dispose);
  return router;
});
