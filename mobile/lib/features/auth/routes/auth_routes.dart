import 'package:go_router/go_router.dart';

import '../../../core/routing/route_paths.dart';
import '../../../shared/widgets/route_placeholder.dart';

final authRoutes = <RouteBase>[
  GoRoute(
    path: RoutePaths.login,
    name: 'login',
    builder: (context, state) =>
        const RoutePlaceholder(feature: 'auth', screen: 'login'),
  ),
  GoRoute(
    path: RoutePaths.register,
    name: 'register',
    builder: (context, state) =>
        const RoutePlaceholder(feature: 'auth', screen: 'register'),
  ),
];
