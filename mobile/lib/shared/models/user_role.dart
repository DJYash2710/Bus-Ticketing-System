import 'package:json_annotation/json_annotation.dart';

/// Mirrors backend `UserRole` enum for RBAC checks.
@JsonEnum()
enum UserRole {
  @JsonValue('USER')
  user,
  @JsonValue('ADMIN')
  admin,
  @JsonValue('OPERATOR')
  operator,
}

extension UserRoleX on UserRole {
  bool get isAdmin => this == UserRole.admin;
  bool get isOperator => this == UserRole.operator;
  bool get isPassenger => this == UserRole.user;
}
