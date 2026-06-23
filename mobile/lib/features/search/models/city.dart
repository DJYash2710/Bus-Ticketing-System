class City {
  const City({required this.id, required this.name, this.state, this.country});

  final int id;
  final String name;
  final String? state;
  final String? country;

  factory City.fromJson(Map<String, dynamic> json) => City(
        id: (json['id'] as num).toInt(),
        name: json['name'] as String,
        state: json['state'] as String?,
        country: json['country'] as String?,
      );
}
