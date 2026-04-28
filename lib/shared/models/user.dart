import 'app_enums.dart';

class User {
  const User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.permissions = const [],
  });

  final String id;
  final String name;
  final String email;
  final UserRole role;
  final List<String> permissions;

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      role: UserRole.fromJson(json['role'] as String),
      permissions: List<String>.from(json['permissions'] as List? ?? const []),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'email': email,
    'role': role.name,
    'permissions': permissions,
  };
}
