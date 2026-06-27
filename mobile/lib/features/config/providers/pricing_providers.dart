import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../config/pricing_config.dart';
import '../../../shared/providers/core_providers.dart';
import '../services/config_api_service.dart';

final configApiServiceProvider = Provider<ConfigApiService>(
  (ref) => ConfigApiService(ref.watch(dioProvider)),
);

class PricingConfigNotifier extends Notifier<PricingConfig> {
  @override
  PricingConfig build() => PricingConfig.defaults;

  Future<void> loadFromApi() async {
    try {
      state = await ref.read(configApiServiceProvider).fetchPricing();
    } catch (_) {
      // Keep defaults when offline or server unreachable.
    }
  }
}

final pricingConfigProvider =
    NotifierProvider<PricingConfigNotifier, PricingConfig>(
  PricingConfigNotifier.new,
);
