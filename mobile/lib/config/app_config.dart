import 'env_config.dart';

/// Application-wide static configuration.
class AppConfig {
  AppConfig._();

  static const String appName = 'TealTransit';
  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 30);
  static const Duration seatHoldDuration = Duration(minutes: 10);

  static String get apiBaseUrl => EnvConfig.apiBaseUrl;
}
