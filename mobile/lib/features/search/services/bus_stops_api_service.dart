import '../../../core/constants/api_constants.dart';
import '../../../core/services/base_api_service.dart';

class BusStop {
  const BusStop({
    required this.id,
    required this.name,
    required this.locality,
    required this.cityId,
  });

  final int id;
  final String name;
  final String locality;
  final int cityId;

  String get label => '$name, $locality';

  factory BusStop.fromJson(Map<String, dynamic> json) => BusStop(
        id: (json['id'] as num).toInt(),
        name: json['name'] as String,
        locality: json['locality'] as String,
        cityId: (json['cityId'] as num).toInt(),
      );
}

class BusStopsApiService extends BaseApiService {
  BusStopsApiService(super.dio);

  Future<List<BusStop>> listByCity(int cityId) => get(
        ApiConstants.busStops,
        queryParameters: {'cityId': cityId},
        parser: (json) => (json as List<dynamic>)
            .map((e) => BusStop.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}
