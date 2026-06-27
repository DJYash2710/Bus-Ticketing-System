import '../../../core/constants/api_constants.dart';
import '../../../core/services/base_api_service.dart';
import '../models/loyalty_event.dart';

class LoyaltyApiService extends BaseApiService {
  LoyaltyApiService(super.dio);

  Future<List<LoyaltyEvent>> history() => get(
        '${ApiConstants.loyalty}/history',
        parser: (json) => (json as List<dynamic>)
            .map((e) => LoyaltyEvent.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}
