import 'package:go_router/go_router.dart';

import '../../../core/routing/route_paths.dart';
import '../../../shared/widgets/route_placeholder.dart';

final seatsRoutes = <RouteBase>[
  GoRoute(
    path: RoutePaths.seats,
    name: 'seats',
    builder: (context, state) => RoutePlaceholder(
      feature: 'seats',
      screen: 'layout:${state.pathParameters['scheduleId']}',
    ),
  ),
];
