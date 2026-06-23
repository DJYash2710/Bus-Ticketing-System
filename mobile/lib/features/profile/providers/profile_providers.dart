import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/error/result.dart';
import '../../../shared/providers/core_providers.dart';
import '../models/update_profile_request.dart';
import '../models/user_profile.dart';
import '../repositories/profile_repository.dart';
import '../repositories/profile_repository_impl.dart';
import '../services/profile_api_service.dart';

final profileApiServiceProvider = Provider<ProfileApiService>(
  (ref) => ProfileApiService(ref.watch(dioProvider)),
);

final profileRepositoryProvider = Provider<ProfileRepository>(
  (ref) => ProfileRepositoryImpl(ref.watch(profileApiServiceProvider)),
);

final userProfileProvider = FutureProvider<UserProfile>((ref) async {
  final result = await ref.watch(profileRepositoryProvider).getProfile();
  return switch (result) {
    Success(:final value) => value,
    Error(:final failure) => throw failure,
  };
});

final updateProfileProvider = Provider<
    Future<Result<UserProfile>> Function(UpdateProfileRequest)>(
  (ref) {
    final repository = ref.watch(profileRepositoryProvider);
    return (request) => repository.updateProfile(request);
  },
);
