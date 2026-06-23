// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'initiate_payment_request.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$InitiatePaymentRequest {

 int get bookingId; PaymentMethod get method;
/// Create a copy of InitiatePaymentRequest
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$InitiatePaymentRequestCopyWith<InitiatePaymentRequest> get copyWith => _$InitiatePaymentRequestCopyWithImpl<InitiatePaymentRequest>(this as InitiatePaymentRequest, _$identity);

  /// Serializes this InitiatePaymentRequest to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is InitiatePaymentRequest&&(identical(other.bookingId, bookingId) || other.bookingId == bookingId)&&(identical(other.method, method) || other.method == method));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,bookingId,method);

@override
String toString() {
  return 'InitiatePaymentRequest(bookingId: $bookingId, method: $method)';
}


}

/// @nodoc
abstract mixin class $InitiatePaymentRequestCopyWith<$Res>  {
  factory $InitiatePaymentRequestCopyWith(InitiatePaymentRequest value, $Res Function(InitiatePaymentRequest) _then) = _$InitiatePaymentRequestCopyWithImpl;
@useResult
$Res call({
 int bookingId, PaymentMethod method
});




}
/// @nodoc
class _$InitiatePaymentRequestCopyWithImpl<$Res>
    implements $InitiatePaymentRequestCopyWith<$Res> {
  _$InitiatePaymentRequestCopyWithImpl(this._self, this._then);

  final InitiatePaymentRequest _self;
  final $Res Function(InitiatePaymentRequest) _then;

/// Create a copy of InitiatePaymentRequest
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? bookingId = null,Object? method = null,}) {
  return _then(_self.copyWith(
bookingId: null == bookingId ? _self.bookingId : bookingId // ignore: cast_nullable_to_non_nullable
as int,method: null == method ? _self.method : method // ignore: cast_nullable_to_non_nullable
as PaymentMethod,
  ));
}

}


/// Adds pattern-matching-related methods to [InitiatePaymentRequest].
extension InitiatePaymentRequestPatterns on InitiatePaymentRequest {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _InitiatePaymentRequest value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _InitiatePaymentRequest() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _InitiatePaymentRequest value)  $default,){
final _that = this;
switch (_that) {
case _InitiatePaymentRequest():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _InitiatePaymentRequest value)?  $default,){
final _that = this;
switch (_that) {
case _InitiatePaymentRequest() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( int bookingId,  PaymentMethod method)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _InitiatePaymentRequest() when $default != null:
return $default(_that.bookingId,_that.method);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( int bookingId,  PaymentMethod method)  $default,) {final _that = this;
switch (_that) {
case _InitiatePaymentRequest():
return $default(_that.bookingId,_that.method);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( int bookingId,  PaymentMethod method)?  $default,) {final _that = this;
switch (_that) {
case _InitiatePaymentRequest() when $default != null:
return $default(_that.bookingId,_that.method);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _InitiatePaymentRequest implements InitiatePaymentRequest {
  const _InitiatePaymentRequest({required this.bookingId, required this.method});
  factory _InitiatePaymentRequest.fromJson(Map<String, dynamic> json) => _$InitiatePaymentRequestFromJson(json);

@override final  int bookingId;
@override final  PaymentMethod method;

/// Create a copy of InitiatePaymentRequest
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$InitiatePaymentRequestCopyWith<_InitiatePaymentRequest> get copyWith => __$InitiatePaymentRequestCopyWithImpl<_InitiatePaymentRequest>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$InitiatePaymentRequestToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _InitiatePaymentRequest&&(identical(other.bookingId, bookingId) || other.bookingId == bookingId)&&(identical(other.method, method) || other.method == method));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,bookingId,method);

@override
String toString() {
  return 'InitiatePaymentRequest(bookingId: $bookingId, method: $method)';
}


}

/// @nodoc
abstract mixin class _$InitiatePaymentRequestCopyWith<$Res> implements $InitiatePaymentRequestCopyWith<$Res> {
  factory _$InitiatePaymentRequestCopyWith(_InitiatePaymentRequest value, $Res Function(_InitiatePaymentRequest) _then) = __$InitiatePaymentRequestCopyWithImpl;
@override @useResult
$Res call({
 int bookingId, PaymentMethod method
});




}
/// @nodoc
class __$InitiatePaymentRequestCopyWithImpl<$Res>
    implements _$InitiatePaymentRequestCopyWith<$Res> {
  __$InitiatePaymentRequestCopyWithImpl(this._self, this._then);

  final _InitiatePaymentRequest _self;
  final $Res Function(_InitiatePaymentRequest) _then;

/// Create a copy of InitiatePaymentRequest
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? bookingId = null,Object? method = null,}) {
  return _then(_InitiatePaymentRequest(
bookingId: null == bookingId ? _self.bookingId : bookingId // ignore: cast_nullable_to_non_nullable
as int,method: null == method ? _self.method : method // ignore: cast_nullable_to_non_nullable
as PaymentMethod,
  ));
}


}

// dart format on
