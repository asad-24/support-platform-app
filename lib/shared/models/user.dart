import 'app_enums.dart';

class User {
  const User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.username,
    this.phone,
    this.state,
    this.lga,
    this.address,
    this.profileImagePath,
    this.profileComplete = true,
    this.permissions = const [],
  });

  final String id;
  final String name;
  final String email;
  final UserRole role;
  final String? username;
  final String? phone;
  final String? state;
  final String? lga;
  final String? address;
  final String? profileImagePath;
  final bool profileComplete;
  final List<String> permissions;

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      role: UserRole.fromJson(json['role'] as String),
      username: json['username'] as String?,
      phone: json['phone'] as String?,
      state: json['state'] as String?,
      lga: json['lga'] as String?,
      address: json['address'] as String?,
      profileImagePath: json['profileImagePath'] as String?,
      profileComplete: json['profileComplete'] as bool? ?? true,
      permissions: List<String>.from(json['permissions'] as List? ?? const []),
    );
  }

  User copyWith({
    String? id,
    String? name,
    String? email,
    UserRole? role,
    String? username,
    String? phone,
    String? state,
    String? lga,
    String? address,
    String? profileImagePath,
    bool? profileComplete,
    List<String>? permissions,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      role: role ?? this.role,
      username: username ?? this.username,
      phone: phone ?? this.phone,
      state: state ?? this.state,
      lga: lga ?? this.lga,
      address: address ?? this.address,
      profileImagePath: profileImagePath ?? this.profileImagePath,
      profileComplete: profileComplete ?? this.profileComplete,
      permissions: permissions ?? this.permissions,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'email': email,
    'role': role.name,
    'username': username,
    'phone': phone,
    'state': state,
    'lga': lga,
    'address': address,
    'profileImagePath': profileImagePath,
    'profileComplete': profileComplete,
    'permissions': permissions,
  };
}
