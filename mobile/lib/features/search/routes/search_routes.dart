import 'package:go_router/go_router.dart';

import '../../../core/routing/route_paths.dart';
import '../../../shared/widgets/route_placeholder.dart';

final searchRoutes = <RouteBase>[
  GoRoute(
    path: RoutePaths.search,
    name: 'search',
    builder: (context, state) =>
        const RoutePlaceholder(feature: 'search', screen: 'search'),
  ),
];
