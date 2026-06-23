import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/providers/core_providers.dart';
import '../models/city.dart';
import '../models/search_result.dart';
import '../services/cities_api_service.dart';
import '../services/search_api_service.dart';

final citiesApiServiceProvider = Provider(
  (ref) => CitiesApiService(ref.watch(dioProvider)),
);

final searchApiServiceProvider = Provider(
  (ref) => SearchApiService(ref.watch(dioProvider)),
);

final citiesProvider = FutureProvider<List<City>>((ref) async {
  return ref.watch(citiesApiServiceProvider).list();
});

class SearchQueryParams {
  const SearchQueryParams({
    required this.fromCityId,
    required this.toCityId,
    required this.date,
  });

  final int fromCityId;
  final int toCityId;
  final String date;

  @override
  bool operator ==(Object other) =>
      other is SearchQueryParams &&
      fromCityId == other.fromCityId &&
      toCityId == other.toCityId &&
      date == other.date;

  @override
  int get hashCode => Object.hash(fromCityId, toCityId, date);
}

final searchResultsProvider =
    FutureProvider.family<SearchResult, SearchQueryParams>((ref, params) {
  return ref.watch(searchApiServiceProvider).searchSchedules(
        fromCityId: params.fromCityId,
        toCityId: params.toCityId,
        date: params.date,
      );
});

final searchFormProvider =
    NotifierProvider<SearchFormNotifier, SearchFormState>(SearchFormNotifier.new);

class SearchFormState {
  const SearchFormState({
    this.fromCity,
    this.toCity,
    this.travelDate,
    this.recentSearches = const [],
  });

  final City? fromCity;
  final City? toCity;
  final DateTime? travelDate;
  final List<({City from, City to, DateTime date})> recentSearches;

  SearchFormState copyWith({
    City? fromCity,
    City? toCity,
    DateTime? travelDate,
    List<({City from, City to, DateTime date})>? recentSearches,
  }) =>
      SearchFormState(
        fromCity: fromCity ?? this.fromCity,
        toCity: toCity ?? this.toCity,
        travelDate: travelDate ?? this.travelDate,
        recentSearches: recentSearches ?? this.recentSearches,
      );
}

class SearchFormNotifier extends Notifier<SearchFormState> {
  @override
  SearchFormState build() =>
      SearchFormState(travelDate: DateTime.now());

  void setFromCity(City? city) => state = state.copyWith(fromCity: city);
  void setToCity(City? city) => state = state.copyWith(toCity: city);
  void setTravelDate(DateTime date) =>
      state = state.copyWith(travelDate: date);

  void swapCities() => state = SearchFormState(
        fromCity: state.toCity,
        toCity: state.fromCity,
        travelDate: state.travelDate,
        recentSearches: state.recentSearches,
      );

  void addRecentSearch(City from, City to, DateTime date) {
    final entry = (from: from, to: to, date: date);
    final updated = [
      entry,
      ...state.recentSearches.where(
        (r) => !(r.from.id == from.id && r.to.id == to.id),
      ),
    ].take(5).toList();
    state = state.copyWith(recentSearches: updated);
  }
}
