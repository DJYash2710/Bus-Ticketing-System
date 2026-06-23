import 'dart:math';

/// Short tips shown on the splash screen (ixigo-style).
class BusFacts {
  BusFacts._();

  static final _random = Random();

  static const List<String> facts = [
    'India has one of the largest bus networks in the world.',
    'AC sleeper buses can cut overnight travel fatigue significantly.',
    'Booking early often gets you better seat choices and lower fares.',
    'Window seats on the right side may offer better sunset views.',
    'Always keep your PNR handy — it is your ticket reference.',
    'Boarding 15 minutes early helps avoid last-minute rush.',
    'TealTransit seat maps update in real time as others book.',
    'Weekday travel is usually cheaper than weekends and holidays.',
    'Upper deck sleepers are popular — book them early.',
    'UPI is the fastest way to complete your bus payment.',
    'Mumbai to Pune is among the busiest intercity bus routes.',
    'Check amenities like Wi‑Fi and charging before you book.',
    'Your seat hold lasts 10 minutes — complete payment in time.',
    'Loyalty credits can reduce your fare on the next trip.',
    'Cancelled trips may be eligible for refund per operator policy.',
  ];

  static String random() => facts[_random.nextInt(facts.length)];
}
