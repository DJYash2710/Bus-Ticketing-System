import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/error/result.dart';
import '../../../shared/providers/core_providers.dart';
import '../models/auth_session.dart';
import '../models/login_request.dart';
import '../models/register_request.dart';
import '../repositories/auth_repository.dart';
import '../repositories/auth_repository_impl.dart';
import '../services/auth_api_service.dart';

final authApiServiceProvider = Provider<AuthApiService>(
  (ref) => AuthApiService(ref.watch(dioProvider)),
);

final authRepositoryProvider = Provider<AuthRepository>(
  (ref) => AuthRepositoryImpl(
    apiService: ref.watch(authApiServiceProvider),
    storage: ref.watch(secureStorageProvider),
  ),
);

final authStateProvider =
    NotifierProvider<AuthNotifier, AuthState>(AuthNotifier.new);

class AuthNotifier extends Notifier<AuthState> {
  @override
  AuthState build() => const AuthState();

  AuthRepository get _repository => ref.read(authRepositoryProvider);

  Future<void> restoreSession() async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    final result = await _repository.restoreSession();
    state = switch (result) {
      Success(:final value) when value != null =>
        AuthState(user: value, isLoading: false),
      Success() || Error() => const AuthState(isLoading: false),
    };
  }

  Future<bool> login(LoginRequest request) async {
    state = state.copyWith(isLoading: true, errorMessage: null, user: null);
    final result = await _repository.login(request);
    return switch (result) {
      Success(:final value) => () {
          state = AuthState(user: value.user, isLoading: false);
          return true;
        }(),
      Error(:final failure) => () {
          state = AuthState(
            isLoading: false,
            errorMessage: failure.toString(),
          );
          return false;
        }(),
    };
  }

  Future<bool> register(RegisterRequest request) async {
    state = state.copyWith(isLoading: true, errorMessage: null, user: null);
    final result = await _repository.register(request);
    return switch (result) {
      Success(:final value) => () {
          state = AuthState(user: value.user, isLoading: false);
          return true;
        }(),
      Error(:final failure) => () {
          state = AuthState(
            isLoading: false,
            errorMessage: failure.toString(),
          );
          return false;
        }(),
    };
  }

  Future<void> logout() async {
    await _repository.logout();
    state = const AuthState();
  }
}
