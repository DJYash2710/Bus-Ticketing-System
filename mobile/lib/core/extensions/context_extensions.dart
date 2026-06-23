import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

extension ContextRoutingX on BuildContext {
  void popOrHome() {
    if (canPop()) {
      pop();
    } else {
      go('/');
    }
  }
}
