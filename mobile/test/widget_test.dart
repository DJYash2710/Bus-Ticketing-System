import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:bus_ticketing/app.dart';
import 'package:bus_ticketing/config/env_config.dart';

void main() {
  setUp(EnvConfig.init);

  testWidgets('App boots without error', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(child: App()),
    );
    await tester.pump();
    expect(find.byType(App), findsOneWidget);
  });
}
