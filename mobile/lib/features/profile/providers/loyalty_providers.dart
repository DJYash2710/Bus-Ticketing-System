import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/providers/core_providers.dart';
import '../models/loyalty_event.dart';
import '../services/loyalty_api_service.dart';

final loyaltyApiServiceProvider = Provider(
  (ref) => LoyaltyApiService(ref.watch(dioProvider)),
);

final loyaltyHistoryProvider = FutureProvider<List<LoyaltyEvent>>((ref) {
  return ref.watch(loyaltyApiServiceProvider).history();
});
