import '../../../core/constants/api_constants.dart';
import '../../../core/services/base_api_service.dart';
import '../models/auth_session.dart';
import '../models/auth_tokens.dart';
import '../models/auth_user.dart';
import '../models/login_request.dart';
import '../models/register_request.dart';

class AuthApiService extends BaseApiService {
  AuthApiService(super.dio);

  Future<AuthSession> login(LoginRequest request) async {
    return post<AuthSession>(
      ApiConstants.authLogin,
      data: request.toJson(),
      parser: (json) {
        final map = json as Map<String, dynamic>;
        return AuthSession(
          user: AuthUser.fromJson(map['user'] as Map<String, dynamic>),
          tokens: AuthTokens.fromJson(map['tokens'] as Map<String, dynamic>),
        );
      },
    );
  }

  Future<AuthSession> register(RegisterRequest request) async {
    return post<AuthSession>(
      ApiConstants.authRegister,
      data: request.toJson(),
      parser: (json) {
        final map = json as Map<String, dynamic>;
        return AuthSession(
          user: AuthUser.fromJson(map['user'] as Map<String, dynamic>),
          tokens: AuthTokens.fromJson(map['tokens'] as Map<String, dynamic>),
        );
      },
    );
  }

  Future<AuthTokens> refresh(String refreshToken) async {
    return post<AuthTokens>(
      ApiConstants.authRefresh,
      data: {'refreshToken': refreshToken},
      parser: (json) {
        final map = json as Map<String, dynamic>;
        final tokens = map['tokens'] as Map<String, dynamic>? ?? map;
        return AuthTokens.fromJson(tokens);
      },
    );
  }

  Future<void> logout() => post<void>(ApiConstants.authLogout);

  Future<AuthUser> me() => get<AuthUser>(
        ApiConstants.usersMe,
        parser: (json) => AuthUser.fromJson(json as Map<String, dynamic>),
      );
}
