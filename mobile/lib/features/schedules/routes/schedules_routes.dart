import 'package:go_router/go_router.dart';

import '../../../core/routing/route_paths.dart';
import '../../../shared/widgets/route_placeholder.dart';

final schedulesRoutes = <RouteBase>[
  GoRoute(
    path: RoutePaths.schedules,
    name: 'schedules',
    builder: (context, state) =>
        const RoutePlaceholder(feature: 'schedules', screen: 'list'),
  ),
  GoRoute(
    path: RoutePaths.scheduleDetail,
    name: 'schedule-detail',
    builder: (context, state) => RoutePlaceholder(
      feature: 'schedules',
      screen: 'detail:${state.pathParameters['id']}',
    ),
  ),
];
