import '../../../core/error/result.dart';
import '../models/search_result.dart';

abstract interface class SearchRepository {
  Future<Result<SearchResult>> searchSchedules({
    required int fromCityId,
    required int toCityId,
    required String date,
  });
}
