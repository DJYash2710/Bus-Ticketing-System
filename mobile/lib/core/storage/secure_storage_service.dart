import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'storage_keys.dart';

abstract class SecureStorageService {
  Future<String?> read(String key);
  Future<void> write(String key, String value);
  Future<void> delete(String key);
  Future<void> deleteAll();
}

extension SecureStorageTokens on SecureStorageService {
  Future<String?> get accessToken => read(StorageKeys.accessToken);
  Future<String?> get refreshToken => read(StorageKeys.refreshToken);

  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await write(StorageKeys.accessToken, accessToken);
    await write(StorageKeys.refreshToken, refreshToken);
  }

  Future<void> clearTokens() async {
    await delete(StorageKeys.accessToken);
    await delete(StorageKeys.refreshToken);
    await delete(StorageKeys.cachedUser);
  }
}

class SecureStorageServiceImpl implements SecureStorageService {
  SecureStorageServiceImpl({FlutterSecureStorage? storage})
      : _storage = storage ??
            const FlutterSecureStorage(
              aOptions: AndroidOptions(encryptedSharedPreferences: true),
            );

  final FlutterSecureStorage _storage;

  @override
  Future<void> delete(String key) => _storage.delete(key: key);

  @override
  Future<void> deleteAll() => _storage.deleteAll();

  @override
  Future<String?> read(String key) => _storage.read(key: key);

  @override
  Future<void> write(String key, String value) =>
      _storage.write(key: key, value: value);
}
