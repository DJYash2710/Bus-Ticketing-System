import 'package:flutter/material.dart';

/// Rebuilds children on resume so layout insets stay stable after backgrounding.
class AppLifecycleWrapper extends StatefulWidget {
  const AppLifecycleWrapper({required this.child, super.key});

  final Widget child;

  @override
  State<AppLifecycleWrapper> createState() => _AppLifecycleWrapperState();
}

class _AppLifecycleWrapperState extends State<AppLifecycleWrapper>
    with WidgetsBindingObserver {
  Key _layoutKey = UniqueKey();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed && mounted) {
      setState(() => _layoutKey = UniqueKey());
    }
  }

  @override
  Widget build(BuildContext context) {
    return KeyedSubtree(
      key: _layoutKey,
      child: widget.child,
    );
  }
}
