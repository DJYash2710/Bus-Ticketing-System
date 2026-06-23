// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'schedule_summary.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$ScheduleSummary {

 int get id; String get routeName; String get fromCity; String get toCity;@DateTimeConverter() DateTime get departureTime;@DateTimeConverter() DateTime get arrivalTime; double get fare; int get availableSeats; String? get busName; String? get busType;
/// Create a copy of ScheduleSummary
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ScheduleSummaryCopyWith<ScheduleSummary> get copyWith => _$ScheduleSummaryCopyWithImpl<ScheduleSummary>(this as ScheduleSummary, _$identity);

  /// Serializes this ScheduleSummary to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is ScheduleSummary&&(identical(other.id, id) || other.id == id)&&(identical(other.routeName, routeName) || other.routeName == routeName)&&(identical(other.fromCity, fromCity) || other.fromCity == fromCity)&&(identical(other.toCity, toCity) || other.toCity == toCity)&&(identical(other.departureTime, departureTime) || other.departureTime == departureTime)&&(identical(other.arrivalTime, arrivalTime) || other.arrivalTime == arrivalTime)&&(identical(other.fare, fare) || other.fare == fare)&&(identical(other.availableSeats, availableSeats) || other.availableSeats == availableSeats)&&(identical(other.busName, busName) || other.busName == busName)&&(identical(other.busType, busType) || other.busType == busType));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,routeName,fromCity,toCity,departureTime,arrivalTime,fare,availableSeats,busName,busType);

@override
String toString() {
  return 'ScheduleSummary(id: $id, routeName: $routeName, fromCity: $fromCity, toCity: $toCity, departureTime: $departureTime, arrivalTime: $arrivalTime, fare: $fare, availableSeats: $availableSeats, busName: $busName, busType: $busType)';
}


}

/// @nodoc
abstract mixin class $ScheduleSummaryCopyWith<$Res>  {
  factory $ScheduleSummaryCopyWith(ScheduleSummary value, $Res Function(ScheduleSummary) _then) = _$ScheduleSummaryCopyWithImpl;
@useResult
$Res call({
 int id, String routeName, String fromCity, String toCity,@DateTimeConverter() DateTime departureTime,@DateTimeConverter() DateTime arrivalTime, double fare, int availableSeats, String? busName, String? busType
});




}
/// @nodoc
class _$ScheduleSummaryCopyWithImpl<$Res>
    implements $ScheduleSummaryCopyWith<$Res> {
  _$ScheduleSummaryCopyWithImpl(this._self, this._then);

  final ScheduleSummary _self;
  final $Res Function(ScheduleSummary) _then;

/// Create a copy of ScheduleSummary
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? routeName = null,Object? fromCity = null,Object? toCity = null,Object? departureTime = null,Object? arrivalTime = null,Object? fare = null,Object? availableSeats = null,Object? busName = freezed,Object? busType = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as int,routeName: null == routeName ? _self.routeName : routeName // ignore: cast_nullable_to_non_nullable
as String,fromCity: null == fromCity ? _self.fromCity : fromCity // ignore: cast_nullable_to_non_nullable
as String,toCity: null == toCity ? _self.toCity : toCity // ignore: cast_nullable_to_non_nullable
as String,departureTime: null == departureTime ? _self.departureTime : departureTime // ignore: cast_nullable_to_non_nullable
as DateTime,arrivalTime: null == arrivalTime ? _self.arrivalTime : arrivalTime // ignore: cast_nullable_to_non_nullable
as DateTime,fare: null == fare ? _self.fare : fare // ignore: cast_nullable_to_non_nullable
as double,availableSeats: null == availableSeats ? _self.availableSeats : availableSeats // ignore: cast_nullable_to_non_nullable
as int,busName: freezed == busName ? _self.busName : busName // ignore: cast_nullable_to_non_nullable
as String?,busType: freezed == busType ? _self.busType : busType // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [ScheduleSummary].
extension ScheduleSummaryPatterns on ScheduleSummary {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _ScheduleSummary value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _ScheduleSummary() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _ScheduleSummary value)  $default,){
final _that = this;
switch (_that) {
case _ScheduleSummary():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _ScheduleSummary value)?  $default,){
final _that = this;
switch (_that) {
case _ScheduleSummary() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( int id,  String routeName,  String fromCity,  String toCity, @DateTimeConverter()  DateTime departureTime, @DateTimeConverter()  DateTime arrivalTime,  double fare,  int availableSeats,  String? busName,  String? busType)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _ScheduleSummary() when $default != null:
return $default(_that.id,_that.routeName,_that.fromCity,_that.toCity,_that.departureTime,_that.arrivalTime,_that.fare,_that.availableSeats,_that.busName,_that.busType);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( int id,  String routeName,  String fromCity,  String toCity, @DateTimeConverter()  DateTime departureTime, @DateTimeConverter()  DateTime arrivalTime,  double fare,  int availableSeats,  String? busName,  String? busType)  $default,) {final _that = this;
switch (_that) {
case _ScheduleSummary():
return $default(_that.id,_that.routeName,_that.fromCity,_that.toCity,_that.departureTime,_that.arrivalTime,_that.fare,_that.availableSeats,_that.busName,_that.busType);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( int id,  String routeName,  String fromCity,  String toCity, @DateTimeConverter()  DateTime departureTime, @DateTimeConverter()  DateTime arrivalTime,  double fare,  int availableSeats,  String? busName,  String? busType)?  $default,) {final _that = this;
switch (_that) {
case _ScheduleSummary() when $default != null:
return $default(_that.id,_that.routeName,_that.fromCity,_that.toCity,_that.departureTime,_that.arrivalTime,_that.fare,_that.availableSeats,_that.busName,_that.busType);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _ScheduleSummary implements ScheduleSummary {
  const _ScheduleSummary({required this.id, required this.routeName, required this.fromCity, required this.toCity, @DateTimeConverter() required this.departureTime, @DateTimeConverter() required this.arrivalTime, required this.fare, required this.availableSeats, this.busName, this.busType});
  factory _ScheduleSummary.fromJson(Map<String, dynamic> json) => _$ScheduleSummaryFromJson(json);

@override final  int id;
@override final  String routeName;
@override final  String fromCity;
@override final  String toCity;
@override@DateTimeConverter() final  DateTime departureTime;
@override@DateTimeConverter() final  DateTime arrivalTime;
@override final  double fare;
@override final  int availableSeats;
@override final  String? busName;
@override final  String? busType;

/// Create a copy of ScheduleSummary
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$ScheduleSummaryCopyWith<_ScheduleSummary> get copyWith => __$ScheduleSummaryCopyWithImpl<_ScheduleSummary>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$ScheduleSummaryToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _ScheduleSummary&&(identical(other.id, id) || other.id == id)&&(identical(other.routeName, routeName) || other.routeName == routeName)&&(identical(other.fromCity, fromCity) || other.fromCity == fromCity)&&(identical(other.toCity, toCity) || other.toCity == toCity)&&(identical(other.departureTime, departureTime) || other.departureTime == departureTime)&&(identical(other.arrivalTime, arrivalTime) || other.arrivalTime == arrivalTime)&&(identical(other.fare, fare) || other.fare == fare)&&(identical(other.availableSeats, availableSeats) || other.availableSeats == availableSeats)&&(identical(other.busName, busName) || other.busName == busName)&&(identical(other.busType, busType) || other.busType == busType));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,routeName,fromCity,toCity,departureTime,arrivalTime,fare,availableSeats,busName,busType);

@override
String toString() {
  return 'ScheduleSummary(id: $id, routeName: $routeName, fromCity: $fromCity, toCity: $toCity, departureTime: $departureTime, arrivalTime: $arrivalTime, fare: $fare, availableSeats: $availableSeats, busName: $busName, busType: $busType)';
}


}

/// @nodoc
abstract mixin class _$ScheduleSummaryCopyWith<$Res> implements $ScheduleSummaryCopyWith<$Res> {
  factory _$ScheduleSummaryCopyWith(_ScheduleSummary value, $Res Function(_ScheduleSummary) _then) = __$ScheduleSummaryCopyWithImpl;
@override @useResult
$Res call({
 int id, String routeName, String fromCity, String toCity,@DateTimeConverter() DateTime departureTime,@DateTimeConverter() DateTime arrivalTime, double fare, int availableSeats, String? busName, String? busType
});




}
/// @nodoc
class __$ScheduleSummaryCopyWithImpl<$Res>
    implements _$ScheduleSummaryCopyWith<$Res> {
  __$ScheduleSummaryCopyWithImpl(this._self, this._then);

  final _ScheduleSummary _self;
  final $Res Function(_ScheduleSummary) _then;

/// Create a copy of ScheduleSummary
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? routeName = null,Object? fromCity = null,Object? toCity = null,Object? departureTime = null,Object? arrivalTime = null,Object? fare = null,Object? availableSeats = null,Object? busName = freezed,Object? busType = freezed,}) {
  return _then(_ScheduleSummary(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as int,routeName: null == routeName ? _self.routeName : routeName // ignore: cast_nullable_to_non_nullable
as String,fromCity: null == fromCity ? _self.fromCity : fromCity // ignore: cast_nullable_to_non_nullable
as String,toCity: null == toCity ? _self.toCity : toCity // ignore: cast_nullable_to_non_nullable
as String,departureTime: null == departureTime ? _self.departureTime : departureTime // ignore: cast_nullable_to_non_nullable
as DateTime,arrivalTime: null == arrivalTime ? _self.arrivalTime : arrivalTime // ignore: cast_nullable_to_non_nullable
as DateTime,fare: null == fare ? _self.fare : fare // ignore: cast_nullable_to_non_nullable
as double,availableSeats: null == availableSeats ? _self.availableSeats : availableSeats // ignore: cast_nullable_to_non_nullable
as int,busName: freezed == busName ? _self.busName : busName // ignore: cast_nullable_to_non_nullable
as String?,busType: freezed == busType ? _self.busType : busType // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}

// dart format on
