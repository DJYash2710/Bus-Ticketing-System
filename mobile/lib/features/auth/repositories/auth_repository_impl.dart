import 'dart:convert';

import '../../../core/error/failure.dart';
import '../../../core/utils/jwt_utils.dart';
import '../../../core/error/result.dart';
import '../../../core/repositories/base_repository.dart';
import '../../../core/storage/secure_storage_service.dart';
import '../../../core/storage/storage_keys.dart';
import '../models/auth_session.dart';
import '../models/auth_user.dart';
import '../models/login_request.dart';
import '../models/register_request.dart';
import '../services/auth_api_service.dart';
import 'auth_repository.dart';

class AuthRepositoryImpl extends BaseRepository implements AuthRepository {
  AuthRepositoryImpl({
    required this.apiService,
    required this.storage,
  });

  final AuthApiService apiService;
  final SecureStorageService storage;

  @override
  Future<void> clearLocalSession() => storage.clearTokens();

  @override
  Future<Result<AuthSession>> login(LoginRequest request) => guard(() async {
        await clearLocalSession();
        final session = await apiService.login(request);
        await storage.saveTokens(
          accessToken: session.tokens.accessToken,
          refreshToken: session.tokens.refreshToken,
        );
        await _cacheUser(session.user);
        return session;
      });

  @override
  Future<Result<AuthSession>> register(RegisterRequest request) =>
      guard(() async {
        await clearLocalSession();
        final session = await apiService.register(request);
        await storage.saveTokens(
          accessToken: session.tokens.accessToken,
          refreshToken: session.tokens.refreshToken,
        );
        await _cacheUser(session.user);
        return session;
      });

  @override
  Future<Result<AuthUser>> getCurrentUser() => guard(() async {
        final user = await apiService.me();
        await _cacheUser(user);
        return user;
      });

  @override
  Future<Result<void>> logout() => guard(() async {
        try {
          await apiService.logout();
        } finally {
          await storage.clearTokens();
        }
      });

  @override
  Future<Result<AuthUser?>> restoreSession() async {
    final token = await storage.accessToken;
    if (token == null || token.isEmpty) {
      return const Success(null);
    }

    final cached = await _loadCachedUser();
    final result = await guard(() => apiService.me());
    switch (result) {
      case Success(:final value):
        await _cacheUser(value);
        return Success<AuthUser?>(value);
      case Error(:final failure):
        final tokenStill = await storage.accessToken;
        if (tokenStill != null &&
            tokenStill.isNotEmpty &&
            failure is NetworkFailure &&
            cached != null &&
            cached.id == parseJwtSubject(tokenStill)) {
          return Success<AuthUser?>(cached);
        }
        if (failure is NetworkFailure) {
          await clearLocalSession();
        }
        return Error<AuthUser?>(failure);
    }
  }

  Future<void> _cacheUser(AuthUser user) => storage.write(
        StorageKeys.cachedUser,
        jsonEncode(user.toJson()),
      );

  Future<AuthUser?> _loadCachedUser() async {
    final raw = await storage.read(StorageKeys.cachedUser);
    if (raw == null || raw.isEmpty) return null;
    try {
      return AuthUser.fromJson(jsonDecode(raw) as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }
}
