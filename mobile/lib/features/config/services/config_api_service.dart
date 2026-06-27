import '../../../config/pricing_config.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/services/base_api_service.dart';

class ConfigApiService extends BaseApiService {
  ConfigApiService(super.dio);

  Future<PricingConfig> fetchPricing() => get(
        ApiConstants.config,
        parser: (json) =>
            PricingConfig.fromJson(json as Map<String, dynamic>),
      );
}
