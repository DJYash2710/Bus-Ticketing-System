import 'dart:async';

import 'package:flutter/foundation.dart';

/// Runs [action] after [duration] with no further calls.
void debounce(
  VoidCallback action, {
  Duration duration = const Duration(milliseconds: 350),
}) {
  Debouncer(duration).call(action);
}

class Debouncer {
  Debouncer([this.duration = const Duration(milliseconds: 350)]);

  final Duration duration;
  Timer? _timer;

  void call(VoidCallback action) {
    _timer?.cancel();
    _timer = Timer(duration, action);
  }

  void dispose() => _timer?.cancel();
}
