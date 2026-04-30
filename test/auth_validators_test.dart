import 'package:flutter_test/flutter_test.dart';
import 'package:school_support_atlas/features/auth/auth_validators.dart';

void main() {
  group('auth validators', () {
    test('accepts practical email addresses', () {
      expect(AuthValidators.emailError('user@example.com'), isNull);
      expect(
        AuthValidators.emailError('field.worker+admin@example.org'),
        isNull,
      );
    });

    test('rejects invalid email formats', () {
      expect(AuthValidators.emailError(''), isNotNull);
      expect(AuthValidators.emailError('userexample.com'), isNotNull);
      expect(AuthValidators.emailError('user@'), isNotNull);
      expect(AuthValidators.emailError('user@example'), isNotNull);
      expect(AuthValidators.emailError('user example@example.com'), isNotNull);
    });

    test('accepts login by email or username only', () {
      expect(AuthValidators.loginIdentifierError('user@example.com'), isNull);
      expect(AuthValidators.loginIdentifierError('ibrahim'), isNull);
      expect(AuthValidators.loginIdentifierError('field_worker_01'), isNull);
    });

    test('rejects empty or invalid login identifiers', () {
      expect(AuthValidators.loginIdentifierError(''), isNotNull);
      expect(AuthValidators.loginIdentifierError('ab'), isNotNull);
      expect(AuthValidators.loginIdentifierError('field worker'), isNotNull);
      expect(AuthValidators.loginIdentifierError('user@example'), isNotNull);
    });

    test('accepts strong passwords', () {
      expect(AuthValidators.passwordError('Password1!'), isNull);
      expect(AuthValidators.passwordError('Atlas2026#'), isNull);
    });

    test('rejects weak passwords by rule', () {
      expect(AuthValidators.passwordError('Pass1!'), isNotNull);
      expect(AuthValidators.passwordError('password1!'), isNotNull);
      expect(AuthValidators.passwordError('Password!'), isNotNull);
      expect(AuthValidators.passwordError('Password1'), isNotNull);
    });
  });
}
