import 'package:flutter/material.dart';

/// Minimal scaffold used by route definitions until feature UIs are built.
class RoutePlaceholder extends StatelessWidget {
  const RoutePlaceholder({
    required this.feature,
    required this.screen,
    super.key,
  });

  final String feature;
  final String screen;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('$feature / $screen')),
      body: Center(
        child: Text('Placeholder: $feature → $screen'),
      ),
    );
  }
}
