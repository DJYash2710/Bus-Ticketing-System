import 'package:freezed_annotation/freezed_annotation.dart';

import 'auth_tokens.dart';
import 'auth_user.dart';

part 'auth_session.freezed.dart';

@freezed
sealed class AuthSession with _$AuthSession {
  const factory AuthSession({
    required AuthUser user,
    required AuthTokens tokens,
  }) = _AuthSession;
}

@freezed
sealed class AuthState with _$AuthState {
  const factory AuthState({
    AuthUser? user,
    @Default(false) bool isLoading,
    String? errorMessage,
  }) = _AuthState;

  const AuthState._();

  bool get isAuthenticated => user != null;
}
