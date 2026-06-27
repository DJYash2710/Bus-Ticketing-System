import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../config/app_config.dart';
import '../../config/providers/pricing_providers.dart';
import '../../../core/constants/bus_facts.dart';
import '../../../core/routing/route_paths.dart';
import '../providers/auth_providers.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  static const _minDisplayDuration = Duration(seconds: 2);

  late final String _fact;

  @override
  void initState() {
    super.initState();
    _fact = BusFacts.random();
    WidgetsBinding.instance.addPostFrameCallback((_) => _bootstrap());
  }

  Future<void> _bootstrap() async {
    final startedAt = DateTime.now();
    await Future.wait([
      ref.read(pricingConfigProvider.notifier).loadFromApi(),
      ref.read(authStateProvider.notifier).restoreSession(),
    ]);

    final elapsed = DateTime.now().difference(startedAt);
    if (elapsed < _minDisplayDuration) {
      await Future<void>.delayed(_minDisplayDuration - elapsed);
    }

    if (!mounted) return;

    final isAuthenticated = ref.read(authStateProvider).isAuthenticated;
    context.go(isAuthenticated ? RoutePaths.search : RoutePaths.login);
  }

  @override
  Widget build(BuildContext context) {
    const teal = Color(0xFF008080);

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32),
          child: Column(
            children: [
              const Spacer(flex: 2),
              const Icon(Icons.directions_bus_rounded, size: 72, color: teal),
              const SizedBox(height: 16),
              Text(
                AppConfig.appName,
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      color: teal,
                      fontWeight: FontWeight.w700,
                      letterSpacing: -0.5,
                    ),
              ),
              const SizedBox(height: 40),
              const SizedBox(
                width: 28,
                height: 28,
                child: CircularProgressIndicator(
                  strokeWidth: 2.5,
                  color: teal,
                ),
              ),
              const SizedBox(height: 32),
              Text(
                _fact,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.grey.shade600,
                      height: 1.45,
                    ),
              ),
              const Spacer(flex: 3),
            ],
          ),
        ),
      ),
    );
  }
}
