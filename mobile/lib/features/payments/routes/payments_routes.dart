import 'package:go_router/go_router.dart';

import '../../../core/routing/route_paths.dart';
import '../../../shared/widgets/route_placeholder.dart';

final paymentsRoutes = <RouteBase>[
  GoRoute(
    path: RoutePaths.payment,
    name: 'payment',
    builder: (context, state) => RoutePlaceholder(
      feature: 'payments',
      screen: 'checkout:${state.pathParameters['bookingId']}',
    ),
  ),
  GoRoute(
    path: RoutePaths.paymentStatus,
    name: 'payment-status',
    builder: (context, state) => RoutePlaceholder(
      feature: 'payments',
      screen: 'status:${state.pathParameters['id']}',
    ),
  ),
];
