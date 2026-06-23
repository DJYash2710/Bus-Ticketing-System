import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core_providers.dart';

/// Re-export for consumers that only need the HTTP client.
final dioClientProvider = Provider<Dio>((ref) => ref.watch(dioProvider));
