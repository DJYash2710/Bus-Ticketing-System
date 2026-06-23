import '../../../core/error/result.dart';
import '../../../core/repositories/base_repository.dart';
import '../models/search_result.dart';
import '../services/search_api_service.dart';
import 'search_repository.dart';

class SearchRepositoryImpl extends BaseRepository implements SearchRepository {
  SearchRepositoryImpl(this._apiService);

  final SearchApiService _apiService;

  @override
  Future<Result<SearchResult>> searchSchedules({
    required int fromCityId,
    required int toCityId,
    required String date,
  }) =>
      guard(
        () => _apiService.searchSchedules(
          fromCityId: fromCityId,
          toCityId: toCityId,
          date: date,
        ),
      );
}
