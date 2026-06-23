// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'search_query.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_SearchQuery _$SearchQueryFromJson(Map<String, dynamic> json) => _SearchQuery(
  fromCityId: (json['fromCityId'] as num).toInt(),
  toCityId: (json['toCityId'] as num).toInt(),
  travelDate: DateTime.parse(json['travelDate'] as String),
  passengers: (json['passengers'] as num?)?.toInt(),
);

Map<String, dynamic> _$SearchQueryToJson(_SearchQuery instance) =>
    <String, dynamic>{
      'fromCityId': instance.fromCityId,
      'toCityId': instance.toCityId,
      'travelDate': instance.travelDate.toIso8601String(),
      'passengers': instance.passengers,
    };
