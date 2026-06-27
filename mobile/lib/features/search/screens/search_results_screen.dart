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

enum _SortOption { priceLow, priceHigh, departureEarly, departureLate, seatsMost }

class SearchResultsScreen extends ConsumerStatefulWidget {
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
  ConsumerState<SearchResultsScreen> createState() => _SearchResultsScreenState();
}

class _SearchResultsScreenState extends ConsumerState<SearchResultsScreen> {
  _SortOption _sort = _SortOption.departureEarly;
  String? _busTypeFilter;
  bool _hideSoldOut = false;

  List<ScheduleSearchItem> _applyFilters(List<ScheduleSearchItem> items) {
    var filtered = items;
    if (_hideSoldOut) {
      filtered = filtered.where((i) => !i.isSoldOut).toList();
    }
    if (_busTypeFilter != null) {
      filtered =
          filtered.where((i) => i.busType == _busTypeFilter).toList();
    }
    filtered = [...filtered];
    switch (_sort) {
      case _SortOption.priceLow:
        filtered.sort((a, b) => a.basePrice.compareTo(b.basePrice));
      case _SortOption.priceHigh:
        filtered.sort((a, b) => b.basePrice.compareTo(a.basePrice));
      case _SortOption.departureEarly:
        filtered.sort((a, b) => a.departureTime.compareTo(b.departureTime));
      case _SortOption.departureLate:
        filtered.sort((a, b) => b.departureTime.compareTo(a.departureTime));
      case _SortOption.seatsMost:
        filtered.sort((a, b) => b.availableSeats.compareTo(a.availableSeats));
    }
    return filtered;
  }

  Future<void> _openFilters(List<ScheduleSearchItem> items) async {
    final busTypes = items.map((i) => i.busType).toSet().toList()..sort();
    await showModalBottomSheet<void>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Filters & Sort', style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 16),
              const Text('Sort by'),
              RadioGroup<_SortOption>(
                groupValue: _sort,
                onChanged: (v) {
                  if (v != null) setModalState(() => _sort = v);
                },
                child: Column(
                  children: _SortOption.values
                      .map(
                        (opt) => RadioListTile<_SortOption>(
                          value: opt,
                          title: Text(_sortLabel(opt)),
                        ),
                      )
                      .toList(),
                ),
              ),
              const Divider(),
              DropdownButtonFormField<String?>(
                initialValue: _busTypeFilter,
                decoration: const InputDecoration(labelText: 'Bus type'),
                items: [
                  const DropdownMenuItem(value: null, child: Text('All types')),
                  ...busTypes.map(
                    (t) => DropdownMenuItem(
                      value: t,
                      child: Text(t.replaceAll('_', ' ')),
                    ),
                  ),
                ],
                onChanged: (v) => setModalState(() => _busTypeFilter = v),
              ),
              SwitchListTile(
                title: const Text('Hide sold out'),
                value: _hideSoldOut,
                onChanged: (v) => setModalState(() => _hideSoldOut = v),
              ),
              const SizedBox(height: 8),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: () {
                    setState(() {});
                    Navigator.pop(ctx);
                  },
                  child: const Text('Apply'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _sortLabel(_SortOption opt) => switch (opt) {
        _SortOption.priceLow => 'Price: Low to High',
        _SortOption.priceHigh => 'Price: High to Low',
        _SortOption.departureEarly => 'Departure: Earliest',
        _SortOption.departureLate => 'Departure: Latest',
        _SortOption.seatsMost => 'Most seats available',
      };

  @override
  Widget build(BuildContext context) {
    final params = SearchQueryParams(
      fromCityId: widget.fromCityId,
      toCityId: widget.toCityId,
      date: widget.date,
    );
    final results = ref.watch(searchResultsProvider(params));

    return Scaffold(
      appBar: const AppHeader(showBack: true),
      body: results.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Search failed: $e')),
        data: (data) {
          final schedules = _applyFilters(data.schedules);
          return Column(
            children: [
              _SearchHeader(result: data, onEdit: () => context.pop()),
              Expanded(
                child: schedules.isEmpty
                    ? const Center(child: Text('No buses match your filters'))
                    : ListView.builder(
                        padding: const EdgeInsets.fromLTRB(16, 8, 16, 88),
                        itemCount: schedules.length,
                        itemBuilder: (context, i) => _BusCard(
                          item: schedules[i],
                          onTap: () {
                          ref.read(bookingFlowProvider.notifier).setScheduleContext(
                                schedule: schedules[i],
                                fromCityName: data.fromCity.name,
                                toCityName: data.toCity.name,
                                fromCityId: data.fromCity.id,
                                toCityId: data.toCity.id,
                                travelDate: data.date,
                              );
                            context.push(
                              RoutePaths.seats.replaceFirst(
                                ':scheduleId',
                                '${schedules[i].scheduleId}',
                              ),
                            );
                          },
                        ),
                      ),
              ),
            ],
          );
        },
      ),
      floatingActionButton: results.maybeWhen(
        data: (data) => FloatingActionButton.extended(
          onPressed: () => _openFilters(data.schedules),
          backgroundColor: AppColors.textPrimary,
          icon: const Icon(Icons.tune_rounded),
          label: const Text('Filters & Sort'),
        ),
        orElse: () => null,
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
