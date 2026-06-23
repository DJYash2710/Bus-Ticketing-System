import 'package:go_router/go_router.dart';

import '../../../core/routing/route_paths.dart';
import '../../../shared/widgets/route_placeholder.dart';

final bookingsRoutes = <RouteBase>[
  GoRoute(
    path: RoutePaths.bookings,
    name: 'bookings',
    builder: (context, state) =>
        const RoutePlaceholder(feature: 'bookings', screen: 'list'),
  ),
  GoRoute(
    path: RoutePaths.bookingDetail,
    name: 'booking-detail',
    builder: (context, state) => RoutePlaceholder(
      feature: 'bookings',
      screen: 'detail:${state.pathParameters['id']}',
    ),
  ),
  GoRoute(
    path: RoutePaths.bookingReview,
    name: 'booking-review',
    builder: (context, state) =>
        const RoutePlaceholder(feature: 'bookings', screen: 'review'),
  ),
];
