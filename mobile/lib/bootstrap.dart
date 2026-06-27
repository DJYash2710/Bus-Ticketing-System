import 'dart:developer' as developer;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'config/env_config.dart';
import 'app.dart';

Future<void> bootstrap() async {
  WidgetsFlutterBinding.ensureInitialized();
  EnvConfig.init();
  if (kDebugMode && EnvConfig.usesLocalhost) {
    developer.log(
      'API_BASE_URL is ${EnvConfig.apiBaseUrl}. On a physical device this only '
      'works while USB debugging is connected. After unplugging, use your PC '
      'LAN IP, e.g. --dart-define=API_BASE_URL=http://192.168.x.x:4000/api/v1',
      name: 'EnvConfig',
    );
  }
  runApp(const ProviderScope(child: App()));
}
