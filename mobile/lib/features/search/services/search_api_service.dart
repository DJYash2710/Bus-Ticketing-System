import '../../../core/constants/api_constants.dart';
import '../../../core/services/base_api_service.dart';
import '../models/search_result.dart';

class SearchApiService extends BaseApiService {
  SearchApiService(super.dio);

  Future<SearchResult> searchSchedules({
    required int fromCityId,
    required int toCityId,
    required String date,
  }) =>
      get(
        ApiConstants.search,
        queryParameters: {
          'fromCityId': fromCityId,
          'toCityId': toCityId,
          'date': date,
        },
        parser: (json) => SearchResult.fromJson(json as Map<String, dynamic>),
      );
}
