class LoyaltyEvent {
  const LoyaltyEvent({
    required this.id,
    required this.type,
    required this.credits,
    this.description,
    this.createdAt,
  });

  final int id;
  final String type;
  final int credits;
  final String? description;
  final DateTime? createdAt;

  factory LoyaltyEvent.fromJson(Map<String, dynamic> json) => LoyaltyEvent(
        id: (json['id'] as num).toInt(),
        type: json['type'] as String,
        credits: (json['credits'] as num).toInt(),
        description: json['description'] as String?,
        createdAt: json['createdAt'] != null
            ? DateTime.parse(json['createdAt'] as String).toLocal()
            : null,
      );
}
