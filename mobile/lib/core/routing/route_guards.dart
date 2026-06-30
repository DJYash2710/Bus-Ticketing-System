import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../bootstrap/bootstrap_provider.dart';
import '../../features/auth/providers/auth_providers.dart';
import '../../shared/models/user_role.dart';
import 'route_paths.dart';

/// Redirect logic for authentication and role-based access control.
class RouteGuards {
  RouteGuards._();

  static String? authRedirect(BuildContext context, GoRouterState state) {
    final container = ProviderScope.containerOf(context, listen: false);
    final bootstrap = container.read(bootstrapProvider);
    final authState = container.read(authStateProvider);

    if (state.matchedLocation == RoutePaths.splash) {
      if (!bootstrap.isComplete) {
        return null;
      }
      return authState.isAuthenticated ? RoutePaths.search : RoutePaths.login;
    }

    final isAuthRoute = state.matchedLocation == RoutePaths.login ||
        state.matchedLocation == RoutePaths.register;

    if (!authState.isAuthenticated && !isAuthRoute) {
      return RoutePaths.login;
    }

    if (authState.isAuthenticated && isAuthRoute) {
      return RoutePaths.search;
    }

    return null;
  }

  static String? adminRedirect(BuildContext context, GoRouterState state) {
    final container = ProviderScope.containerOf(context, listen: false);
    final authState = container.read(authStateProvider);

    if (authState.user?.role != UserRole.admin) {
      return RoutePaths.search;
    }

    return null;
  }
}
