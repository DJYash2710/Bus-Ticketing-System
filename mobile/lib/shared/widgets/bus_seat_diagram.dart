import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/utils/bus_layout_geometry.dart';
import '../../features/seats/models/seat_layout_data.dart';

typedef SeatTapCallback = void Function(SeatMapItem seat);

class BusSeatDiagram extends StatelessWidget {
  const BusSeatDiagram({
    required this.seats,
    required this.selectedIds,
    required this.onSeatTap,
    required this.seatSize,
    this.layout,
    super.key,
  });

  final List<SeatMapItem> seats;
  final Set<int> selectedIds;
  final SeatTapCallback onSeatTap;
  final double seatSize;
  final SeatLayoutSnapshot? layout;

  bool _isUpperDeck(String? deck) => (deck ?? 'LOWER').toUpperCase() == 'UPPER';

  @override
  Widget build(BuildContext context) {
    final geometry = layout != null
        ? seatColumnLayout(layout!.seatsLeft, layout!.seatsRight)
        : inferGeometryFromSeatCols(seats.map((s) => s.col));
    final capElements = layout?.capElements ?? const <LayoutCapElement>[];
    final hasUpperDeck =
        layout?.hasUpperDeck ?? seats.any((s) => _isUpperDeck(s.deck));

    final decks = hasUpperDeck
        ? [
            (
              id: 'LOWER',
              label: 'LOWER DECK',
              seats: seats.where((s) => !_isUpperDeck(s.deck)).toList(),
            ),
            (
              id: 'UPPER',
              label: 'UPPER DECK',
              seats: seats.where((s) => _isUpperDeck(s.deck)).toList(),
            ),
          ]
        : [(id: 'LOWER', label: 'LOWER DECK', seats: seats)];

    final wideGrid = geometry.gridWidth > 5;
    final deckWidth = (seatSize + 6) * geometry.gridWidth + 40;

    Widget buildDeckSection(({String id, String label, List<SeatMapItem> seats}) deck) {
      return SizedBox(
        width: hasUpperDeck ? deckWidth : null,
        child: _DeckSection(
          label: deck.label,
          showLabel: hasUpperDeck,
          geometry: geometry,
          capElements: capElements,
          seats: deck.seats,
          seatSize: seatSize,
          selectedIds: selectedIds,
          onSeatTap: onSeatTap,
          showCaps: deck.id == 'LOWER' && capElements.isNotEmpty,
        ),
      );
    }

    final diagram = hasUpperDeck
        ? Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              for (var i = 0; i < decks.length; i++) ...[
                if (i > 0)
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 8),
                    child: VerticalDivider(width: 1, thickness: 1),
                  ),
                buildDeckSection(decks[i]),
              ],
            ],
          )
        : Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              for (var i = 0; i < decks.length; i++) ...[
                if (i > 0) const Divider(height: 24),
                buildDeckSection(decks[i]),
              ],
            ],
          );

    final diagramWithMeta = Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        diagram,
        if (layout != null) ...[
          const SizedBox(height: 8),
          Text(
            '${layout!.seatsLeft}+${layout!.seatsRight} layout · v${layout!.version}'
            '${layout!.hasUpperDeck ? ' · double deck' : ''}'
            '${layout!.fromSnapshot ? '' : ' (approx)'}',
            style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
          ),
        ],
      ],
    );

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: wideGrid || hasUpperDeck
            ? SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: SizedBox(
                  width: hasUpperDeck ? deckWidth * decks.length + 32 : deckWidth,
                  child: diagramWithMeta,
                ),
              )
            : diagramWithMeta,
      ),
    );
  }
}

class _DeckSection extends StatelessWidget {
  const _DeckSection({
    required this.label,
    required this.showLabel,
    required this.geometry,
    required this.capElements,
    required this.seats,
    required this.seatSize,
    required this.selectedIds,
    required this.onSeatTap,
    required this.showCaps,
  });

  final String label;
  final bool showLabel;
  final SeatColumnLayout geometry;
  final List<LayoutCapElement> capElements;
  final List<SeatMapItem> seats;
  final double seatSize;
  final Set<int> selectedIds;
  final SeatTapCallback onSeatTap;
  final bool showCaps;

  @override
  Widget build(BuildContext context) {
    final rows = <int, List<SeatMapItem>>{};
    for (final seat in seats) {
      rows.putIfAbsent(seat.row ?? 0, () => []).add(seat);
    }
    final sortedRows = rows.keys.toList()..sort();

    return Column(
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: showLabel ? 12 : 12,
            fontWeight: showLabel ? FontWeight.w600 : FontWeight.normal,
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: 12),
        if (showCaps)
          _CapRow(
            row: layoutFrontRow,
            geometry: geometry,
            capElements: capElements,
            seatSize: seatSize,
          ),
        ...sortedRows.map((rowNum) {
          final rowSeats = rows[rowNum] ?? [];
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: _SeatRow(
              geometry: geometry,
              rowNum: rowNum,
              capElements: capElements,
              rowSeats: rowSeats,
              seatSize: seatSize,
              selectedIds: selectedIds,
              onSeatTap: onSeatTap,
            ),
          );
        }),
        if (showCaps)
          _CapRow(
            row: layoutRearRow,
            geometry: geometry,
            capElements: capElements,
            seatSize: seatSize,
          ),
      ],
    );
  }
}

class _SeatRow extends StatelessWidget {
  const _SeatRow({
    required this.geometry,
    required this.rowNum,
    required this.capElements,
    required this.rowSeats,
    required this.seatSize,
    required this.selectedIds,
    required this.onSeatTap,
  });

  final SeatColumnLayout geometry;
  final int rowNum;
  final List<LayoutCapElement> capElements;
  final List<SeatMapItem> rowSeats;
  final double seatSize;
  final Set<int> selectedIds;
  final SeatTapCallback onSeatTap;

  @override
  Widget build(BuildContext context) {
    SeatMapItem? seatAt(int col) {
      for (final seat in rowSeats) {
        if (seat.col == col) return seat;
      }
      return null;
    }

    LayoutCapElement? aisleCap() {
      for (final cap in capElements) {
        if (cap.row == rowNum && geometry.aisleCols.contains(cap.col)) {
          return cap;
        }
      }
      return null;
    }

    final aisle = aisleCap();

    return Row(
      children: [
        Expanded(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: geometry.leftCols
                .map((col) => _seatOrGap(col, seatAt(col)))
                .toList(),
          ),
        ),
        SizedBox(
          width: 28,
          child: aisle != null
              ? _CapCell(cap: aisle, size: seatSize)
              : Container(
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      height: seatSize,
                      child: const SizedBox(width: 2, height: double.infinity),
                    ),
        ),
        Expanded(
          child: Row(
            children: geometry.rightCols
                .map((col) => _seatOrGap(col, seatAt(col)))
                .toList(),
          ),
        ),
      ],
    );
  }

  Widget _seatOrGap(int col, SeatMapItem? seat) => _seatOrGapItem(seat);

  Widget _seatOrGapItem(SeatMapItem? seat) {
    if (seat == null) {
      return SizedBox(width: seatSize + 6, height: seatSize + 6);
    }
    return _SeatCell(
      seat: seat,
      selected: selectedIds.contains(seat.id),
      size: seatSize,
      onTap: () => onSeatTap(seat),
    );
  }
}

class _CapRow extends StatelessWidget {
  const _CapRow({
    required this.row,
    required this.geometry,
    required this.capElements,
    required this.seatSize,
  });

  final int row;
  final SeatColumnLayout geometry;
  final List<LayoutCapElement> capElements;
  final double seatSize;

  @override
  Widget build(BuildContext context) {
    LayoutCapElement? capAt(int col) {
      for (final cap in capElements) {
        if (cap.row == row && cap.col == col) return cap;
      }
      return null;
    }

    final hasCaps = capElements.any((cap) => cap.row == row);
    if (!hasCaps) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Expanded(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: geometry.leftCols
                  .map((col) => _capOrGap(capAt(col)))
                  .toList(),
            ),
          ),
          SizedBox(
            width: 28,
            child: _capOrGap(capAt(geometry.aisleCols.first)),
          ),
          Expanded(
            child: Row(
              children: geometry.rightCols
                  .map((col) => _capOrGap(capAt(col)))
                  .toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _capOrGap(LayoutCapElement? cap) {
    if (cap == null) {
      return SizedBox(width: seatSize + 6, height: seatSize + 6);
    }
    return _CapCell(cap: cap, size: seatSize);
  }
}

class _CapCell extends StatelessWidget {
  const _CapCell({required this.cap, required this.size});

  final LayoutCapElement cap;
  final double size;

  @override
  Widget build(BuildContext context) {
    final (icon, color) = switch (cap.type) {
      'DRIVER' => (Icons.person_outline, Colors.blueGrey),
      'EXIT_FRONT' || 'EXIT_REAR' => (Icons.door_front_door_outlined, Colors.green),
      'EXIT_FIRE' => (Icons.local_fire_department_outlined, Colors.orange),
      'WASHROOM' => (Icons.wc_outlined, Colors.lightBlue),
      'ROOF_EXIT' => (Icons.vertical_align_top_outlined, Colors.deepPurple),
      _ => (Icons.circle_outlined, Colors.grey),
    };

    return Padding(
      padding: const EdgeInsets.all(3),
      child: Tooltip(
        message: cap.label ?? cap.type,
        child: Container(
          width: size,
          height: size,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: color.withValues(alpha: 0.4)),
          ),
          child: Icon(icon, size: size * 0.45, color: color),
        ),
      ),
    );
  }
}

class _SeatCell extends StatelessWidget {
  const _SeatCell({
    required this.seat,
    required this.selected,
    required this.onTap,
    required this.size,
  });

  final SeatMapItem seat;
  final bool selected;
  final VoidCallback onTap;
  final double size;

  @override
  Widget build(BuildContext context) {
    final disabled = seat.status != SeatMapStatus.available && !selected;
    Color bg = Colors.white;
    Color border = AppColors.primary;
    if (selected) {
      bg = AppColors.primary;
    } else if (seat.status == SeatMapStatus.booked) {
      bg = const Color(0xFFE5E7EB);
      border = Colors.grey.shade300;
    } else if (seat.status == SeatMapStatus.held) {
      bg = AppColors.holdSeat;
      border = AppColors.holdSeat;
    }

    return Padding(
      padding: const EdgeInsets.all(3),
      child: InkWell(
        onTap: disabled ? null : onTap,
        child: Container(
          width: size,
          height: size,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: bg,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: border),
          ),
          child: Text(
            seat.seatNumber,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: selected ? Colors.white : AppColors.textPrimary,
            ),
          ),
        ),
      ),
    );
  }
}
