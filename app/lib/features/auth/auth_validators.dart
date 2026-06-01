class AuthValidators {
  const AuthValidators._();

  static final RegExp _emailPattern = RegExp(
    r"^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$",
    caseSensitive: false,
  );

  static final RegExp _uppercasePattern = RegExp(r'[A-Z]');
  static final RegExp _numberPattern = RegExp(r'[0-9]');
  static final RegExp _specialPattern = RegExp(
    r'[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;/`~]',
  );
  static final RegExp _usernamePattern = RegExp(r'^[a-zA-Z0-9_]+$');

  static String? emailError(String? value) {
    final email = value?.trim() ?? '';
    if (email.isEmpty) return 'Enter your email';
    if (!_emailPattern.hasMatch(email)) {
      return 'Enter a valid email address';
    }
    return null;
  }

  static String? requiredFieldError(String? value, String label) {
    if ((value ?? '').trim().isEmpty) return '$label is required';
    return null;
  }

  static String? phoneError(String? value) {
    final phone = value?.trim() ?? '';
    if (phone.isEmpty) return 'Phone number is required';
    if (phone.length < 7) return 'Enter a valid phone number';
    return null;
  }

  static String? passwordError(String? value) {
    final password = value ?? '';
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!_uppercasePattern.hasMatch(password)) {
      return 'Password must include at least 1 capital letter';
    }
    if (!_numberPattern.hasMatch(password)) {
      return 'Password must include at least 1 number';
    }
    if (!_specialPattern.hasMatch(password)) {
      return 'Password must include at least 1 special character';
    }
    return null;
  }

  static String? usernameError(String? value) {
    final username = value?.trim() ?? '';
    if (username.length < 3) {
      return 'Username must be at least 3 characters';
    }
    if (!_usernamePattern.hasMatch(username)) {
      return 'Use letters, numbers, or underscore only';
    }
    return null;
  }

  static String? loginIdentifierError(String? value) {
    final identifier = value?.trim() ?? '';
    if (identifier.isEmpty) return 'Enter your email or username';
    if (identifier.contains('@')) return emailError(identifier);
    return usernameError(identifier);
  }

  static bool isValidEmail(String value) => emailError(value) == null;

  static bool isValidPassword(String value) => passwordError(value) == null;

  static String? confirmPasswordError(String? value, String password) {
    if ((value ?? '').isEmpty) return 'Confirm your password';
    if (value != password) return 'Passwords do not match';
    return null;
  }

  static bool isValidLoginIdentifier(String value) {
    return loginIdentifierError(value) == null;
  }
}
