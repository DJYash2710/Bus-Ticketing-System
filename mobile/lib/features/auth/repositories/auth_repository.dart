import '../../../core/error/result.dart';
import '../models/auth_session.dart';
import '../models/auth_user.dart';
import '../models/login_request.dart';
import '../models/register_request.dart';

abstract interface class AuthRepository {
  Future<Result<AuthSession>> login(LoginRequest request);
  Future<Result<AuthSession>> register(RegisterRequest request);
  Future<Result<AuthUser>> getCurrentUser();
  Future<void> clearLocalSession();
  Future<Result<void>> logout();
  Future<Result<AuthUser?>> restoreSession();
}
