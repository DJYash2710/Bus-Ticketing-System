import '../../../core/constants/api_constants.dart';
import '../../../core/services/base_api_service.dart';
import '../models/city.dart';

class CitiesApiService extends BaseApiService {
  CitiesApiService(super.dio);

  Future<List<City>> list({String? search}) => get(
        ApiConstants.cities,
        queryParameters: search != null ? {'search': search} : null,
        parser: (json) => (json as List<dynamic>)
            .map((e) => City.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}
