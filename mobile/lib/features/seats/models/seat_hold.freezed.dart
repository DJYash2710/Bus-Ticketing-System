// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'seat_hold.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$SeatHold {

 String get holdId; int get scheduleId; List<int> get seatIds;@DateTimeConverter() DateTime get expiresAt;
/// Create a copy of SeatHold
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$SeatHoldCopyWith<SeatHold> get copyWith => _$SeatHoldCopyWithImpl<SeatHold>(this as SeatHold, _$identity);

  /// Serializes this SeatHold to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is SeatHold&&(identical(other.holdId, holdId) || other.holdId == holdId)&&(identical(other.scheduleId, scheduleId) || other.scheduleId == scheduleId)&&const DeepCollectionEquality().equals(other.seatIds, seatIds)&&(identical(other.expiresAt, expiresAt) || other.expiresAt == expiresAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,holdId,scheduleId,const DeepCollectionEquality().hash(seatIds),expiresAt);

@override
String toString() {
  return 'SeatHold(holdId: $holdId, scheduleId: $scheduleId, seatIds: $seatIds, expiresAt: $expiresAt)';
}


}

/// @nodoc
abstract mixin class $SeatHoldCopyWith<$Res>  {
  factory $SeatHoldCopyWith(SeatHold value, $Res Function(SeatHold) _then) = _$SeatHoldCopyWithImpl;
@useResult
$Res call({
 String holdId, int scheduleId, List<int> seatIds,@DateTimeConverter() DateTime expiresAt
});




}
/// @nodoc
class _$SeatHoldCopyWithImpl<$Res>
    implements $SeatHoldCopyWith<$Res> {
  _$SeatHoldCopyWithImpl(this._self, this._then);

  final SeatHold _self;
  final $Res Function(SeatHold) _then;

/// Create a copy of SeatHold
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? holdId = null,Object? scheduleId = null,Object? seatIds = null,Object? expiresAt = null,}) {
  return _then(_self.copyWith(
holdId: null == holdId ? _self.holdId : holdId // ignore: cast_nullable_to_non_nullable
as String,scheduleId: null == scheduleId ? _self.scheduleId : scheduleId // ignore: cast_nullable_to_non_nullable
as int,seatIds: null == seatIds ? _self.seatIds : seatIds // ignore: cast_nullable_to_non_nullable
as List<int>,expiresAt: null == expiresAt ? _self.expiresAt : expiresAt // ignore: cast_nullable_to_non_nullable
as DateTime,
  ));
}

}


/// Adds pattern-matching-related methods to [SeatHold].
extension SeatHoldPatterns on SeatHold {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _SeatHold value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _SeatHold() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _SeatHold value)  $default,){
final _that = this;
switch (_that) {
case _SeatHold():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _SeatHold value)?  $default,){
final _that = this;
switch (_that) {
case _SeatHold() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String holdId,  int scheduleId,  List<int> seatIds, @DateTimeConverter()  DateTime expiresAt)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _SeatHold() when $default != null:
return $default(_that.holdId,_that.scheduleId,_that.seatIds,_that.expiresAt);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String holdId,  int scheduleId,  List<int> seatIds, @DateTimeConverter()  DateTime expiresAt)  $default,) {final _that = this;
switch (_that) {
case _SeatHold():
return $default(_that.holdId,_that.scheduleId,_that.seatIds,_that.expiresAt);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String holdId,  int scheduleId,  List<int> seatIds, @DateTimeConverter()  DateTime expiresAt)?  $default,) {final _that = this;
switch (_that) {
case _SeatHold() when $default != null:
return $default(_that.holdId,_that.scheduleId,_that.seatIds,_that.expiresAt);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _SeatHold implements SeatHold {
  const _SeatHold({required this.holdId, required this.scheduleId, required final  List<int> seatIds, @DateTimeConverter() required this.expiresAt}): _seatIds = seatIds;
  factory _SeatHold.fromJson(Map<String, dynamic> json) => _$SeatHoldFromJson(json);

@override final  String holdId;
@override final  int scheduleId;
 final  List<int> _seatIds;
@override List<int> get seatIds {
  if (_seatIds is EqualUnmodifiableListView) return _seatIds;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_seatIds);
}

@override@DateTimeConverter() final  DateTime expiresAt;

/// Create a copy of SeatHold
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$SeatHoldCopyWith<_SeatHold> get copyWith => __$SeatHoldCopyWithImpl<_SeatHold>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$SeatHoldToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _SeatHold&&(identical(other.holdId, holdId) || other.holdId == holdId)&&(identical(other.scheduleId, scheduleId) || other.scheduleId == scheduleId)&&const DeepCollectionEquality().equals(other._seatIds, _seatIds)&&(identical(other.expiresAt, expiresAt) || other.expiresAt == expiresAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,holdId,scheduleId,const DeepCollectionEquality().hash(_seatIds),expiresAt);

@override
String toString() {
  return 'SeatHold(holdId: $holdId, scheduleId: $scheduleId, seatIds: $seatIds, expiresAt: $expiresAt)';
}


}

/// @nodoc
abstract mixin class _$SeatHoldCopyWith<$Res> implements $SeatHoldCopyWith<$Res> {
  factory _$SeatHoldCopyWith(_SeatHold value, $Res Function(_SeatHold) _then) = __$SeatHoldCopyWithImpl;
@override @useResult
$Res call({
 String holdId, int scheduleId, List<int> seatIds,@DateTimeConverter() DateTime expiresAt
});




}
/// @nodoc
class __$SeatHoldCopyWithImpl<$Res>
    implements _$SeatHoldCopyWith<$Res> {
  __$SeatHoldCopyWithImpl(this._self, this._then);

  final _SeatHold _self;
  final $Res Function(_SeatHold) _then;

/// Create a copy of SeatHold
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? holdId = null,Object? scheduleId = null,Object? seatIds = null,Object? expiresAt = null,}) {
  return _then(_SeatHold(
holdId: null == holdId ? _self.holdId : holdId // ignore: cast_nullable_to_non_nullable
as String,scheduleId: null == scheduleId ? _self.scheduleId : scheduleId // ignore: cast_nullable_to_non_nullable
as int,seatIds: null == seatIds ? _self._seatIds : seatIds // ignore: cast_nullable_to_non_nullable
as List<int>,expiresAt: null == expiresAt ? _self.expiresAt : expiresAt // ignore: cast_nullable_to_non_nullable
as DateTime,
  ));
}


}


/// @nodoc
mixin _$SeatLayout {

 int get scheduleId; List<Seat> get seats; SeatHold? get activeHold;
/// Create a copy of SeatLayout
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$SeatLayoutCopyWith<SeatLayout> get copyWith => _$SeatLayoutCopyWithImpl<SeatLayout>(this as SeatLayout, _$identity);

  /// Serializes this SeatLayout to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is SeatLayout&&(identical(other.scheduleId, scheduleId) || other.scheduleId == scheduleId)&&const DeepCollectionEquality().equals(other.seats, seats)&&(identical(other.activeHold, activeHold) || other.activeHold == activeHold));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,scheduleId,const DeepCollectionEquality().hash(seats),activeHold);

@override
String toString() {
  return 'SeatLayout(scheduleId: $scheduleId, seats: $seats, activeHold: $activeHold)';
}


}

/// @nodoc
abstract mixin class $SeatLayoutCopyWith<$Res>  {
  factory $SeatLayoutCopyWith(SeatLayout value, $Res Function(SeatLayout) _then) = _$SeatLayoutCopyWithImpl;
@useResult
$Res call({
 int scheduleId, List<Seat> seats, SeatHold? activeHold
});


$SeatHoldCopyWith<$Res>? get activeHold;

}
/// @nodoc
class _$SeatLayoutCopyWithImpl<$Res>
    implements $SeatLayoutCopyWith<$Res> {
  _$SeatLayoutCopyWithImpl(this._self, this._then);

  final SeatLayout _self;
  final $Res Function(SeatLayout) _then;

/// Create a copy of SeatLayout
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? scheduleId = null,Object? seats = null,Object? activeHold = freezed,}) {
  return _then(_self.copyWith(
scheduleId: null == scheduleId ? _self.scheduleId : scheduleId // ignore: cast_nullable_to_non_nullable
as int,seats: null == seats ? _self.seats : seats // ignore: cast_nullable_to_non_nullable
as List<Seat>,activeHold: freezed == activeHold ? _self.activeHold : activeHold // ignore: cast_nullable_to_non_nullable
as SeatHold?,
  ));
}
/// Create a copy of SeatLayout
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$SeatHoldCopyWith<$Res>? get activeHold {
    if (_self.activeHold == null) {
    return null;
  }

  return $SeatHoldCopyWith<$Res>(_self.activeHold!, (value) {
    return _then(_self.copyWith(activeHold: value));
  });
}
}


/// Adds pattern-matching-related methods to [SeatLayout].
extension SeatLayoutPatterns on SeatLayout {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _SeatLayout value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _SeatLayout() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _SeatLayout value)  $default,){
final _that = this;
switch (_that) {
case _SeatLayout():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _SeatLayout value)?  $default,){
final _that = this;
switch (_that) {
case _SeatLayout() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( int scheduleId,  List<Seat> seats,  SeatHold? activeHold)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _SeatLayout() when $default != null:
return $default(_that.scheduleId,_that.seats,_that.activeHold);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( int scheduleId,  List<Seat> seats,  SeatHold? activeHold)  $default,) {final _that = this;
switch (_that) {
case _SeatLayout():
return $default(_that.scheduleId,_that.seats,_that.activeHold);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( int scheduleId,  List<Seat> seats,  SeatHold? activeHold)?  $default,) {final _that = this;
switch (_that) {
case _SeatLayout() when $default != null:
return $default(_that.scheduleId,_that.seats,_that.activeHold);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _SeatLayout implements SeatLayout {
  const _SeatLayout({required this.scheduleId, required final  List<Seat> seats, this.activeHold}): _seats = seats;
  factory _SeatLayout.fromJson(Map<String, dynamic> json) => _$SeatLayoutFromJson(json);

@override final  int scheduleId;
 final  List<Seat> _seats;
@override List<Seat> get seats {
  if (_seats is EqualUnmodifiableListView) return _seats;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_seats);
}

@override final  SeatHold? activeHold;

/// Create a copy of SeatLayout
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$SeatLayoutCopyWith<_SeatLayout> get copyWith => __$SeatLayoutCopyWithImpl<_SeatLayout>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$SeatLayoutToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _SeatLayout&&(identical(other.scheduleId, scheduleId) || other.scheduleId == scheduleId)&&const DeepCollectionEquality().equals(other._seats, _seats)&&(identical(other.activeHold, activeHold) || other.activeHold == activeHold));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,scheduleId,const DeepCollectionEquality().hash(_seats),activeHold);

@override
String toString() {
  return 'SeatLayout(scheduleId: $scheduleId, seats: $seats, activeHold: $activeHold)';
}


}

/// @nodoc
abstract mixin class _$SeatLayoutCopyWith<$Res> implements $SeatLayoutCopyWith<$Res> {
  factory _$SeatLayoutCopyWith(_SeatLayout value, $Res Function(_SeatLayout) _then) = __$SeatLayoutCopyWithImpl;
@override @useResult
$Res call({
 int scheduleId, List<Seat> seats, SeatHold? activeHold
});


@override $SeatHoldCopyWith<$Res>? get activeHold;

}
/// @nodoc
class __$SeatLayoutCopyWithImpl<$Res>
    implements _$SeatLayoutCopyWith<$Res> {
  __$SeatLayoutCopyWithImpl(this._self, this._then);

  final _SeatLayout _self;
  final $Res Function(_SeatLayout) _then;

/// Create a copy of SeatLayout
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? scheduleId = null,Object? seats = null,Object? activeHold = freezed,}) {
  return _then(_SeatLayout(
scheduleId: null == scheduleId ? _self.scheduleId : scheduleId // ignore: cast_nullable_to_non_nullable
as int,seats: null == seats ? _self._seats : seats // ignore: cast_nullable_to_non_nullable
as List<Seat>,activeHold: freezed == activeHold ? _self.activeHold : activeHold // ignore: cast_nullable_to_non_nullable
as SeatHold?,
  ));
}

/// Create a copy of SeatLayout
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$SeatHoldCopyWith<$Res>? get activeHold {
    if (_self.activeHold == null) {
    return null;
  }

  return $SeatHoldCopyWith<$Res>(_self.activeHold!, (value) {
    return _then(_self.copyWith(activeHold: value));
  });
}
}

// dart format on
