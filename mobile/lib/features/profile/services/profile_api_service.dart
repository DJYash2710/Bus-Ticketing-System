import '../../../core/constants/api_constants.dart';
import '../../../core/services/base_api_service.dart';
import '../models/update_profile_request.dart';
import '../models/user_profile.dart';

class ProfileApiService extends BaseApiService {
  ProfileApiService(super.dio);

  Future<UserProfile> getProfile() => get(
        ApiConstants.usersMe,
        parser: (json) => UserProfile.fromJson(json as Map<String, dynamic>),
      );

  Future<UserProfile> updateProfile(UpdateProfileRequest request) => patch(
        ApiConstants.usersMe,
        data: request.toJson(),
        parser: (json) => UserProfile.fromJson(json as Map<String, dynamic>),
      );
}
