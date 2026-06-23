import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/routing/route_paths.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/app_header.dart';
import '../../../shared/widgets/primary_button.dart';
import '../models/city.dart';
import '../providers/search_providers.dart';

class SearchScreen extends ConsumerWidget {
  const SearchScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final form = ref.watch(searchFormProvider);
    final citiesAsync = ref.watch(citiesProvider);

    return Scaffold(
      appBar: const AppHeader(),
      body: citiesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Failed to load cities: $e')),
        data: (cities) => ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Text('Where are you going?', style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 20),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    _CityField(
                      label: 'From',
                      value: form.fromCity,
                      cities: cities,
                      icon: Icons.radio_button_unchecked,
                      onChanged: (c) =>
                          ref.read(searchFormProvider.notifier).setFromCity(c),
                    ),
                    Row(
                      children: [
                        const Expanded(child: SizedBox()),
                        IconButton(
                          onPressed: () =>
                              ref.read(searchFormProvider.notifier).swapCities(),
                          icon: const Icon(Icons.swap_vert_rounded,
                              color: AppColors.primary),
                        ),
                      ],
                    ),
                    _CityField(
                      label: 'To City',
                      value: form.toCity,
                      cities: cities,
                      icon: Icons.location_on_outlined,
                      onChanged: (c) =>
                          ref.read(searchFormProvider.notifier).setToCity(c),
                    ),
                    const SizedBox(height: 12),
                    InkWell(
                      onTap: () async {
                        final picked = await showDatePicker(
                          context: context,
                          firstDate: DateTime.now(),
                          lastDate: DateTime.now().add(const Duration(days: 90)),
                          initialDate: form.travelDate ?? DateTime.now(),
                        );
                        if (picked != null) {
                          ref.read(searchFormProvider.notifier).setTravelDate(picked);
                        }
                      },
                      child: InputDecorator(
                        decoration: const InputDecoration(
                          prefixIcon: Icon(Icons.calendar_today_outlined),
                        ),
                        child: Text(
                          form.travelDate == null
                              ? 'Select date'
                              : 'Today - ${formatDate(form.travelDate!)}',
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    PrimaryButton(
                      label: 'Search Buses',
                      icon: Icons.search_rounded,
                      onPressed: form.fromCity == null ||
                              form.toCity == null ||
                              form.travelDate == null
                          ? null
                          : () {
                              final from = form.fromCity!;
                              final to = form.toCity!;
                              final date = form.travelDate!;
                              ref.read(searchFormProvider.notifier).addRecentSearch(
                                    from, to, date,
                                  );
                              context.push(
                                '${RoutePaths.schedules}?fromCityId=${from.id}&toCityId=${to.id}&date=${isoDate(date)}',
                              );
                            },
                    ),
                  ],
                ),
              ),
            ),
            if (form.recentSearches.isNotEmpty) ...[
              const SizedBox(height: 24),
              Text('Recent Searches', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 12),
              ...form.recentSearches.map((r) => Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: ActionChip(
                      avatar: const Icon(Icons.history, size: 18),
                      label: Text('${r.from.name} → ${r.to.name}'),
                      onPressed: () {
                        ref.read(searchFormProvider.notifier)
                          ..setFromCity(r.from)
                          ..setToCity(r.to)
                          ..setTravelDate(r.date);
                        context.push(
                          '${RoutePaths.schedules}?fromCityId=${r.from.id}&toCityId=${r.to.id}&date=${isoDate(r.date)}',
                        );
                      },
                    ),
                  )),
            ],
          ],
        ),
      ),
    );
  }
}

class _CityField extends StatelessWidget {
  const _CityField({
    required this.label,
    required this.value,
    required this.cities,
    required this.icon,
    required this.onChanged,
  });

  final String label;
  final City? value;
  final List<City> cities;
  final IconData icon;
  final ValueChanged<City?> onChanged;

  @override
  Widget build(BuildContext context) {
    return DropdownButtonFormField<City>(
      initialValue: value,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon),
      ),
      items: cities
          .map((c) => DropdownMenuItem(value: c, child: Text(c.name)))
          .toList(),
      onChanged: onChanged,
    );
  }
}
