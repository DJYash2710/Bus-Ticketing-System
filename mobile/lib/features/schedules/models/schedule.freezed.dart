// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'schedule.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$Schedule {

 int get id; int get routeId; int get busId;@DateTimeConverter() DateTime get departureTime;@DateTimeConverter() DateTime get arrivalTime; double get baseFare; String get status; String? get routeName; String? get busName; int? get availableSeats;
/// Create a copy of Schedule
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ScheduleCopyWith<Schedule> get copyWith => _$ScheduleCopyWithImpl<Schedule>(this as Schedule, _$identity);

  /// Serializes this Schedule to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is Schedule&&(identical(other.id, id) || other.id == id)&&(identical(other.routeId, routeId) || other.routeId == routeId)&&(identical(other.busId, busId) || other.busId == busId)&&(identical(other.departureTime, departureTime) || other.departureTime == departureTime)&&(identical(other.arrivalTime, arrivalTime) || other.arrivalTime == arrivalTime)&&(identical(other.baseFare, baseFare) || other.baseFare == baseFare)&&(identical(other.status, status) || other.status == status)&&(identical(other.routeName, routeName) || other.routeName == routeName)&&(identical(other.busName, busName) || other.busName == busName)&&(identical(other.availableSeats, availableSeats) || other.availableSeats == availableSeats));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,routeId,busId,departureTime,arrivalTime,baseFare,status,routeName,busName,availableSeats);

@override
String toString() {
  return 'Schedule(id: $id, routeId: $routeId, busId: $busId, departureTime: $departureTime, arrivalTime: $arrivalTime, baseFare: $baseFare, status: $status, routeName: $routeName, busName: $busName, availableSeats: $availableSeats)';
}


}

/// @nodoc
abstract mixin class $ScheduleCopyWith<$Res>  {
  factory $ScheduleCopyWith(Schedule value, $Res Function(Schedule) _then) = _$ScheduleCopyWithImpl;
@useResult
$Res call({
 int id, int routeId, int busId,@DateTimeConverter() DateTime departureTime,@DateTimeConverter() DateTime arrivalTime, double baseFare, String status, String? routeName, String? busName, int? availableSeats
});




}
/// @nodoc
class _$ScheduleCopyWithImpl<$Res>
    implements $ScheduleCopyWith<$Res> {
  _$ScheduleCopyWithImpl(this._self, this._then);

  final Schedule _self;
  final $Res Function(Schedule) _then;

/// Create a copy of Schedule
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? routeId = null,Object? busId = null,Object? departureTime = null,Object? arrivalTime = null,Object? baseFare = null,Object? status = null,Object? routeName = freezed,Object? busName = freezed,Object? availableSeats = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as int,routeId: null == routeId ? _self.routeId : routeId // ignore: cast_nullable_to_non_nullable
as int,busId: null == busId ? _self.busId : busId // ignore: cast_nullable_to_non_nullable
as int,departureTime: null == departureTime ? _self.departureTime : departureTime // ignore: cast_nullable_to_non_nullable
as DateTime,arrivalTime: null == arrivalTime ? _self.arrivalTime : arrivalTime // ignore: cast_nullable_to_non_nullable
as DateTime,baseFare: null == baseFare ? _self.baseFare : baseFare // ignore: cast_nullable_to_non_nullable
as double,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,routeName: freezed == routeName ? _self.routeName : routeName // ignore: cast_nullable_to_non_nullable
as String?,busName: freezed == busName ? _self.busName : busName // ignore: cast_nullable_to_non_nullable
as String?,availableSeats: freezed == availableSeats ? _self.availableSeats : availableSeats // ignore: cast_nullable_to_non_nullable
as int?,
  ));
}

}


/// Adds pattern-matching-related methods to [Schedule].
extension SchedulePatterns on Schedule {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _Schedule value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _Schedule() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _Schedule value)  $default,){
final _that = this;
switch (_that) {
case _Schedule():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _Schedule value)?  $default,){
final _that = this;
switch (_that) {
case _Schedule() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( int id,  int routeId,  int busId, @DateTimeConverter()  DateTime departureTime, @DateTimeConverter()  DateTime arrivalTime,  double baseFare,  String status,  String? routeName,  String? busName,  int? availableSeats)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _Schedule() when $default != null:
return $default(_that.id,_that.routeId,_that.busId,_that.departureTime,_that.arrivalTime,_that.baseFare,_that.status,_that.routeName,_that.busName,_that.availableSeats);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( int id,  int routeId,  int busId, @DateTimeConverter()  DateTime departureTime, @DateTimeConverter()  DateTime arrivalTime,  double baseFare,  String status,  String? routeName,  String? busName,  int? availableSeats)  $default,) {final _that = this;
switch (_that) {
case _Schedule():
return $default(_that.id,_that.routeId,_that.busId,_that.departureTime,_that.arrivalTime,_that.baseFare,_that.status,_that.routeName,_that.busName,_that.availableSeats);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( int id,  int routeId,  int busId, @DateTimeConverter()  DateTime departureTime, @DateTimeConverter()  DateTime arrivalTime,  double baseFare,  String status,  String? routeName,  String? busName,  int? availableSeats)?  $default,) {final _that = this;
switch (_that) {
case _Schedule() when $default != null:
return $default(_that.id,_that.routeId,_that.busId,_that.departureTime,_that.arrivalTime,_that.baseFare,_that.status,_that.routeName,_that.busName,_that.availableSeats);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _Schedule implements Schedule {
  const _Schedule({required this.id, required this.routeId, required this.busId, @DateTimeConverter() required this.departureTime, @DateTimeConverter() required this.arrivalTime, required this.baseFare, required this.status, this.routeName, this.busName, this.availableSeats});
  factory _Schedule.fromJson(Map<String, dynamic> json) => _$ScheduleFromJson(json);

@override final  int id;
@override final  int routeId;
@override final  int busId;
@override@DateTimeConverter() final  DateTime departureTime;
@override@DateTimeConverter() final  DateTime arrivalTime;
@override final  double baseFare;
@override final  String status;
@override final  String? routeName;
@override final  String? busName;
@override final  int? availableSeats;

/// Create a copy of Schedule
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$ScheduleCopyWith<_Schedule> get copyWith => __$ScheduleCopyWithImpl<_Schedule>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$ScheduleToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _Schedule&&(identical(other.id, id) || other.id == id)&&(identical(other.routeId, routeId) || other.routeId == routeId)&&(identical(other.busId, busId) || other.busId == busId)&&(identical(other.departureTime, departureTime) || other.departureTime == departureTime)&&(identical(other.arrivalTime, arrivalTime) || other.arrivalTime == arrivalTime)&&(identical(other.baseFare, baseFare) || other.baseFare == baseFare)&&(identical(other.status, status) || other.status == status)&&(identical(other.routeName, routeName) || other.routeName == routeName)&&(identical(other.busName, busName) || other.busName == busName)&&(identical(other.availableSeats, availableSeats) || other.availableSeats == availableSeats));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,routeId,busId,departureTime,arrivalTime,baseFare,status,routeName,busName,availableSeats);

@override
String toString() {
  return 'Schedule(id: $id, routeId: $routeId, busId: $busId, departureTime: $departureTime, arrivalTime: $arrivalTime, baseFare: $baseFare, status: $status, routeName: $routeName, busName: $busName, availableSeats: $availableSeats)';
}


}

/// @nodoc
abstract mixin class _$ScheduleCopyWith<$Res> implements $ScheduleCopyWith<$Res> {
  factory _$ScheduleCopyWith(_Schedule value, $Res Function(_Schedule) _then) = __$ScheduleCopyWithImpl;
@override @useResult
$Res call({
 int id, int routeId, int busId,@DateTimeConverter() DateTime departureTime,@DateTimeConverter() DateTime arrivalTime, double baseFare, String status, String? routeName, String? busName, int? availableSeats
});




}
/// @nodoc
class __$ScheduleCopyWithImpl<$Res>
    implements _$ScheduleCopyWith<$Res> {
  __$ScheduleCopyWithImpl(this._self, this._then);

  final _Schedule _self;
  final $Res Function(_Schedule) _then;

/// Create a copy of Schedule
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? routeId = null,Object? busId = null,Object? departureTime = null,Object? arrivalTime = null,Object? baseFare = null,Object? status = null,Object? routeName = freezed,Object? busName = freezed,Object? availableSeats = freezed,}) {
  return _then(_Schedule(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as int,routeId: null == routeId ? _self.routeId : routeId // ignore: cast_nullable_to_non_nullable
as int,busId: null == busId ? _self.busId : busId // ignore: cast_nullable_to_non_nullable
as int,departureTime: null == departureTime ? _self.departureTime : departureTime // ignore: cast_nullable_to_non_nullable
as DateTime,arrivalTime: null == arrivalTime ? _self.arrivalTime : arrivalTime // ignore: cast_nullable_to_non_nullable
as DateTime,baseFare: null == baseFare ? _self.baseFare : baseFare // ignore: cast_nullable_to_non_nullable
as double,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,routeName: freezed == routeName ? _self.routeName : routeName // ignore: cast_nullable_to_non_nullable
as String?,busName: freezed == busName ? _self.busName : busName // ignore: cast_nullable_to_non_nullable
as String?,availableSeats: freezed == availableSeats ? _self.availableSeats : availableSeats // ignore: cast_nullable_to_non_nullable
as int?,
  ));
}


}

// dart format on
