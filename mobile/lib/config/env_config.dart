enum AppEnvironment {
  development,
  staging,
  production,
}

/// Runtime environment configuration. Override via `--dart-define`.
class EnvConfig {
  EnvConfig._();

  static AppEnvironment environment = AppEnvironment.development;
  static String apiBaseUrl = 'http://localhost:4000/api/v1';

  static void init({
    AppEnvironment? env,
    String? baseUrl,
  }) {
    const envName = String.fromEnvironment(
      'APP_ENV',
      defaultValue: 'development',
    );
    environment = env ??
        AppEnvironment.values.firstWhere(
          (e) => e.name == envName,
          orElse: () => AppEnvironment.development,
        );

    apiBaseUrl = baseUrl ??
        const String.fromEnvironment(
          'API_BASE_URL',
          defaultValue: 'http://localhost:4000/api/v1',
        );
  }

  static bool get isDevelopment => environment == AppEnvironment.development;
  static bool get isProduction => environment == AppEnvironment.production;
}
