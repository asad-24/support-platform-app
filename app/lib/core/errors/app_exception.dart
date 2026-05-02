class AppException implements Exception {
  const AppException(this.message, {this.code});

  final String message;
  final String? code;

  @override
  String toString() => message;
}

class UnauthorizedException extends AppException {
  const UnauthorizedException(super.message) : super(code: 'unauthorized');
}
