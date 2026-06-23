import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/routing/route_paths.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/app_header.dart';
import '../../bookings/providers/booking_flow_provider.dart';
import '../models/search_result.dart';
import '../providers/search_providers.dart';

class SearchResultsScreen extends ConsumerWidget {
  const SearchResultsScreen({
    required this.fromCityId,
    required this.toCityId,
    required this.date,
    super.key,
  });

  final int fromCityId;
  final int toCityId;
  final String date;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final params = SearchQueryParams(
      fromCityId: fromCityId,
      toCityId: toCityId,
      date: date,
    );
    final results = ref.watch(searchResultsProvider(params));

    return Scaffold(
      appBar: const AppHeader(),
      body: results.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Search failed: $e')),
        data: (data) => Column(
          children: [
            _SearchHeader(result: data, onEdit: () => context.pop()),
            Expanded(
              child: data.schedules.isEmpty
                  ? const Center(child: Text('No buses found for this route'))
                  : ListView.builder(
                      padding: const EdgeInsets.fromLTRB(16, 8, 16, 88),
                      itemCount: data.schedules.length,
                      itemBuilder: (context, i) => _BusCard(
                        item: data.schedules[i],
                        onTap: () {
                          ref.read(bookingFlowProvider.notifier).setScheduleContext(
                                schedule: data.schedules[i],
                                fromCityName: data.fromCity.name,
                                toCityName: data.toCity.name,
                                travelDate: data.date,
                              );
                          context.push(
                            RoutePaths.seats
                                .replaceFirst(':scheduleId',
                                    '${data.schedules[i].scheduleId}'),
                          );
                        },
                      ),
                    ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {},
        backgroundColor: AppColors.textPrimary,
        icon: const Icon(Icons.tune_rounded),
        label: const Text('Filters & Sort'),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }
}

class _SearchHeader extends StatelessWidget {
  const _SearchHeader({required this.result, required this.onEdit});

  final SearchResult result;
  final VoidCallback onEdit;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      color: Colors.white,
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${result.fromCity.name} → ${result.toCity.name}',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                Text(formatDate(DateTime.parse(result.date))),
              ],
            ),
          ),
          IconButton(onPressed: onEdit, icon: const Icon(Icons.edit_outlined)),
        ],
      ),
    );
  }
}

class _BusCard extends StatelessWidget {
  const _BusCard({required this.item, required this.onTap});

  final ScheduleSearchItem item;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: item.isSoldOut ? null : onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(item.busName,
                            style: Theme.of(context).textTheme.titleMedium),
                        Text(item.busType.replaceAll('_', ' ')),
                      ],
                    ),
                  ),
                  Text(
                    formatCurrency(item.basePrice),
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(formatTime(item.departureTime),
                            style: const TextStyle(fontWeight: FontWeight.w700)),
                        Text(item.fromCityName,
                            style: const TextStyle(
                                color: AppColors.textSecondary, fontSize: 12)),
                      ],
                    ),
                  ),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(formatDuration(item.durationMin)),
                  ),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(formatTime(item.arrivalTime),
                            style: const TextStyle(fontWeight: FontWeight.w700)),
                        Text(item.toCityName,
                            style: const TextStyle(
                                color: AppColors.textSecondary, fontSize: 12)),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  if (item.amenities.isNotEmpty)
                    const Icon(Icons.wifi, size: 16, color: AppColors.textSecondary),
                  const Spacer(),
                  if (item.isSoldOut)
                    const Text('Sold Out',
                        style: TextStyle(
                            color: AppColors.soldOut, fontWeight: FontWeight.w600))
                  else if (item.isFastFilling)
                    const Text('Fast Filling',
                        style: TextStyle(
                            color: AppColors.tertiary, fontWeight: FontWeight.w600))
                  else
                    Text(
                      '${item.availableSeats} Seats Left',
                      style: const TextStyle(
                        color: AppColors.success,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
