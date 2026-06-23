import 'package:go_router/go_router.dart';

import '../../../core/routing/route_guards.dart';
import '../../../core/routing/route_paths.dart';
import '../../../shared/widgets/route_placeholder.dart';

final adminRoutes = <RouteBase>[
  GoRoute(
    path: RoutePaths.admin,
    name: 'admin',
    redirect: RouteGuards.adminRedirect,
    builder: (context, state) =>
        const RoutePlaceholder(feature: 'admin', screen: 'dashboard'),
    routes: [
      GoRoute(
        path: 'audit-logs',
        name: 'admin-audit-logs',
        builder: (context, state) =>
            const RoutePlaceholder(feature: 'admin', screen: 'audit-logs'),
      ),
    ],
  ),
];
