// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'search_query.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$SearchQuery {

 int get fromCityId; int get toCityId; DateTime get travelDate; int? get passengers;
/// Create a copy of SearchQuery
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$SearchQueryCopyWith<SearchQuery> get copyWith => _$SearchQueryCopyWithImpl<SearchQuery>(this as SearchQuery, _$identity);

  /// Serializes this SearchQuery to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is SearchQuery&&(identical(other.fromCityId, fromCityId) || other.fromCityId == fromCityId)&&(identical(other.toCityId, toCityId) || other.toCityId == toCityId)&&(identical(other.travelDate, travelDate) || other.travelDate == travelDate)&&(identical(other.passengers, passengers) || other.passengers == passengers));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,fromCityId,toCityId,travelDate,passengers);

@override
String toString() {
  return 'SearchQuery(fromCityId: $fromCityId, toCityId: $toCityId, travelDate: $travelDate, passengers: $passengers)';
}


}

/// @nodoc
abstract mixin class $SearchQueryCopyWith<$Res>  {
  factory $SearchQueryCopyWith(SearchQuery value, $Res Function(SearchQuery) _then) = _$SearchQueryCopyWithImpl;
@useResult
$Res call({
 int fromCityId, int toCityId, DateTime travelDate, int? passengers
});




}
/// @nodoc
class _$SearchQueryCopyWithImpl<$Res>
    implements $SearchQueryCopyWith<$Res> {
  _$SearchQueryCopyWithImpl(this._self, this._then);

  final SearchQuery _self;
  final $Res Function(SearchQuery) _then;

/// Create a copy of SearchQuery
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? fromCityId = null,Object? toCityId = null,Object? travelDate = null,Object? passengers = freezed,}) {
  return _then(_self.copyWith(
fromCityId: null == fromCityId ? _self.fromCityId : fromCityId // ignore: cast_nullable_to_non_nullable
as int,toCityId: null == toCityId ? _self.toCityId : toCityId // ignore: cast_nullable_to_non_nullable
as int,travelDate: null == travelDate ? _self.travelDate : travelDate // ignore: cast_nullable_to_non_nullable
as DateTime,passengers: freezed == passengers ? _self.passengers : passengers // ignore: cast_nullable_to_non_nullable
as int?,
  ));
}

}


/// Adds pattern-matching-related methods to [SearchQuery].
extension SearchQueryPatterns on SearchQuery {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _SearchQuery value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _SearchQuery() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _SearchQuery value)  $default,){
final _that = this;
switch (_that) {
case _SearchQuery():
return $default(_that);}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _SearchQuery value)?  $default,){
final _that = this;
switch (_that) {
case _SearchQuery() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( int fromCityId,  int toCityId,  DateTime travelDate,  int? passengers)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _SearchQuery() when $default != null:
return $default(_that.fromCityId,_that.toCityId,_that.travelDate,_that.passengers);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( int fromCityId,  int toCityId,  DateTime travelDate,  int? passengers)  $default,) {final _that = this;
switch (_that) {
case _SearchQuery():
return $default(_that.fromCityId,_that.toCityId,_that.travelDate,_that.passengers);}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( int fromCityId,  int toCityId,  DateTime travelDate,  int? passengers)?  $default,) {final _that = this;
switch (_that) {
case _SearchQuery() when $default != null:
return $default(_that.fromCityId,_that.toCityId,_that.travelDate,_that.passengers);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _SearchQuery implements SearchQuery {
  const _SearchQuery({required this.fromCityId, required this.toCityId, required this.travelDate, this.passengers});
  factory _SearchQuery.fromJson(Map<String, dynamic> json) => _$SearchQueryFromJson(json);

@override final  int fromCityId;
@override final  int toCityId;
@override final  DateTime travelDate;
@override final  int? passengers;

/// Create a copy of SearchQuery
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$SearchQueryCopyWith<_SearchQuery> get copyWith => __$SearchQueryCopyWithImpl<_SearchQuery>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$SearchQueryToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _SearchQuery&&(identical(other.fromCityId, fromCityId) || other.fromCityId == fromCityId)&&(identical(other.toCityId, toCityId) || other.toCityId == toCityId)&&(identical(other.travelDate, travelDate) || other.travelDate == travelDate)&&(identical(other.passengers, passengers) || other.passengers == passengers));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,fromCityId,toCityId,travelDate,passengers);

@override
String toString() {
  return 'SearchQuery(fromCityId: $fromCityId, toCityId: $toCityId, travelDate: $travelDate, passengers: $passengers)';
}


}

/// @nodoc
abstract mixin class _$SearchQueryCopyWith<$Res> implements $SearchQueryCopyWith<$Res> {
  factory _$SearchQueryCopyWith(_SearchQuery value, $Res Function(_SearchQuery) _then) = __$SearchQueryCopyWithImpl;
@override @useResult
$Res call({
 int fromCityId, int toCityId, DateTime travelDate, int? passengers
});




}
/// @nodoc
class __$SearchQueryCopyWithImpl<$Res>
    implements _$SearchQueryCopyWith<$Res> {
  __$SearchQueryCopyWithImpl(this._self, this._then);

  final _SearchQuery _self;
  final $Res Function(_SearchQuery) _then;

/// Create a copy of SearchQuery
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? fromCityId = null,Object? toCityId = null,Object? travelDate = null,Object? passengers = freezed,}) {
  return _then(_SearchQuery(
fromCityId: null == fromCityId ? _self.fromCityId : fromCityId // ignore: cast_nullable_to_non_nullable
as int,toCityId: null == toCityId ? _self.toCityId : toCityId // ignore: cast_nullable_to_non_nullable
as int,travelDate: null == travelDate ? _self.travelDate : travelDate // ignore: cast_nullable_to_non_nullable
as DateTime,passengers: freezed == passengers ? _self.passengers : passengers // ignore: cast_nullable_to_non_nullable
as int?,
  ));
}


}

// dart format on
