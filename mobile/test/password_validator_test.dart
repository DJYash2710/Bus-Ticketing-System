import 'package:bus_ticketing/core/utils/password_validator.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('empty password shows required message', () {
    expect(validatePassword(''), 'Password is required');
    expect(validatePassword(null), 'Password is required');
  });

  test('short password shows 8 character minimum', () {
    expect(validatePassword('1234567'), 'Password must be at least 8 characters');
  });

  test('valid password passes', () {
    expect(validatePassword('12345678'), isNull);
  });
}
