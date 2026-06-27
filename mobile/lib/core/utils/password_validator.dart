/// Client-side password rules aligned with backend (`min 8`, `max 128`).
String? validatePassword(String? value) {
  if (value == null || value.isEmpty) {
    return 'Password is required';
  }
  if (value.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (value.length > 128) {
    return 'Password must be at most 128 characters';
  }
  return null;
}
