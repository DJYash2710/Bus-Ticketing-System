import 'dart:convert';

/// Reads the JWT `sub` claim without verifying the signature.
/// Used only to match a cached user profile with the stored access token.
int? parseJwtSubject(String token) {
  try {
    final parts = token.split('.');
    if (parts.length != 3) return null;

    final normalized = base64Url.normalize(parts[1]);
    final decoded = utf8.decode(base64Url.decode(normalized));
    final payload = jsonDecode(decoded) as Map<String, dynamic>;
    final sub = payload['sub'];
    if (sub is int) return sub;
    if (sub is num) return sub.toInt();
    return null;
  } catch (_) {
    return null;
  }
}
