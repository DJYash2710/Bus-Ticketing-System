/// Indian mobile numbers: exactly 10 digits.
String? validatePhone(String? value, {bool required = true}) {
  if (value == null || value.trim().isEmpty) {
    return required ? 'Phone number is required' : null;
  }
  final digits = value.replaceAll(RegExp(r'\D'), '');
  if (digits.length != 10) {
    return 'Enter a valid 10-digit phone number';
  }
  return null;
}
