import '../../../core/error/result.dart';
import '../models/update_profile_request.dart';
import '../models/user_profile.dart';

abstract interface class ProfileRepository {
  Future<Result<UserProfile>> getProfile();
  Future<Result<UserProfile>> updateProfile(UpdateProfileRequest request);
}
