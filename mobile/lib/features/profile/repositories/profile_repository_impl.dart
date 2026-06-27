import '../../../core/error/result.dart';
import '../../../core/repositories/base_repository.dart';
import '../models/change_password_request.dart';
import '../models/update_profile_request.dart';
import '../models/user_profile.dart';
import '../services/profile_api_service.dart';
import 'profile_repository.dart';

class ProfileRepositoryImpl extends BaseRepository implements ProfileRepository {
  ProfileRepositoryImpl(this._apiService);

  final ProfileApiService _apiService;

  @override
  Future<Result<UserProfile>> getProfile() =>
      guard(() => _apiService.getProfile());

  @override
  Future<Result<UserProfile>> updateProfile(UpdateProfileRequest request) =>
      guard(() => _apiService.updateProfile(request));

  @override
  Future<Result<void>> changePassword(ChangePasswordRequest request) =>
      guard(() => _apiService.changePassword(request));
}
