import '../../../core/error/result.dart';
import '../../../core/repositories/base_repository.dart';
import '../../../core/storage/secure_storage_service.dart';
import '../models/auth_session.dart';
import '../models/auth_user.dart';
import '../models/login_request.dart';
import '../models/register_request.dart';
import '../services/auth_api_service.dart';
import 'auth_repository.dart';

class AuthRepositoryImpl extends BaseRepository implements AuthRepository {
  AuthRepositoryImpl({
    required this._apiService,
    required this._storage,
  });

  final AuthApiService _apiService;
  final SecureStorageService _storage;

  @override
  Future<Result<AuthSession>> login(LoginRequest request) => guard(() async {
        final session = await _apiService.login(request);
        await _storage.saveTokens(
          accessToken: session.tokens.accessToken,
          refreshToken: session.tokens.refreshToken,
        );
        return session;
      });

  @override
  Future<Result<AuthSession>> register(RegisterRequest request) =>
      guard(() async {
        final session = await _apiService.register(request);
        await _storage.saveTokens(
          accessToken: session.tokens.accessToken,
          refreshToken: session.tokens.refreshToken,
        );
        return session;
      });

  @override
  Future<Result<AuthUser>> getCurrentUser() =>
      guard(() => _apiService.me());

  @override
  Future<Result<void>> logout() => guard(() async {
        await _apiService.logout();
        await _storage.clearTokens();
      });

  @override
  Future<Result<void>> restoreSession() => guard(() async {
        final token = await _storage.accessToken;
        if (token == null || token.isEmpty) return;
        await _apiService.me();
      });
}
