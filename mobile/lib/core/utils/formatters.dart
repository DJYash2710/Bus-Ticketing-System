import 'package:intl/intl.dart';

final _dateFormat = DateFormat('d MMM');
final _dateLong = DateFormat('d MMM, EEEE');
final _timeFormat = DateFormat('hh:mm a');
final _dateTimeFormat = DateFormat('d MMM, hh:mm a');

String formatDate(DateTime date) => _dateFormat.format(date);

String formatDateLong(DateTime date) => _dateLong.format(date);

String formatTime(DateTime date) => _timeFormat.format(date);

String formatDateTime(DateTime date) => _dateTimeFormat.format(date);

String formatCurrency(double amount) =>
    '₹${amount % 1 == 0 ? amount.toInt() : amount.toStringAsFixed(0)}';

String formatDuration(int minutes) {
  final h = minutes ~/ 60;
  final m = minutes % 60;
  if (m == 0) return '${h}h';
  return '${h}h ${m}m';
}

String isoDate(DateTime date) => DateFormat('yyyy-MM-dd').format(date);
