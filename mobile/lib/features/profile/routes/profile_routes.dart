import 'package:go_router/go_router.dart';

import '../../../core/routing/route_paths.dart';
import '../../../shared/widgets/route_placeholder.dart';

final profileRoutes = <RouteBase>[
  GoRoute(
    path: RoutePaths.profile,
    name: 'profile',
    builder: (context, state) =>
        const RoutePlaceholder(feature: 'profile', screen: 'profile'),
  ),
  GoRoute(
    path: RoutePaths.profileEdit,
    name: 'profile-edit',
    builder: (context, state) =>
        const RoutePlaceholder(feature: 'profile', screen: 'edit'),
  ),
];
