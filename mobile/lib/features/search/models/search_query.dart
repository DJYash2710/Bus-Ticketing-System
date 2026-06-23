import 'package:freezed_annotation/freezed_annotation.dart';

part 'search_query.freezed.dart';
part 'search_query.g.dart';

@freezed
sealed class SearchQuery with _$SearchQuery {
  const factory SearchQuery({
    required int fromCityId,
    required int toCityId,
    required DateTime travelDate,
    int? passengers,
  }) = _SearchQuery;

  factory SearchQuery.fromJson(Map<String, dynamic> json) =>
      _$SearchQueryFromJson(json);
}
