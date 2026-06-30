class SeatColumnLayout {
  const SeatColumnLayout({
    required this.leftCols,
    required this.rightCols,
    required this.aisleCols,
    required this.gridWidth,
  });

  final List<int> leftCols;
  final List<int> rightCols;
  final List<int> aisleCols;
  final int gridWidth;
}

const layoutFrontRow = 1000;
const layoutRearRow = 1001;

SeatColumnLayout seatColumnLayout(int seatsLeft, int seatsRight) {
  final leftCols = List<int>.generate(seatsLeft, (i) => i);
  final aisleCols = [seatsLeft];
  final rightStart = seatsLeft + 1;
  final rightCols = List<int>.generate(seatsRight, (i) => rightStart + i);
  return SeatColumnLayout(
    leftCols: leftCols,
    rightCols: rightCols,
    aisleCols: aisleCols,
    gridWidth: seatsLeft + 1 + seatsRight,
  );
}

SeatColumnLayout inferGeometryFromSeatCols(Iterable<int?> cols) {
  final occupied = cols.whereType<int>().toSet().toList()..sort();
  if (occupied.isEmpty) {
    return seatColumnLayout(2, 2);
  }

  final groups = <List<int>>[];
  var current = <int>[occupied.first];
  for (var i = 1; i < occupied.length; i++) {
    final col = occupied[i];
    if (col == occupied[i - 1] + 1) {
      current.add(col);
    } else {
      groups.add(current);
      current = [col];
    }
  }
  groups.add(current);

  late final int seatsLeft;
  late final int seatsRight;

  if (groups.length >= 2) {
    seatsLeft = groups.first.length;
    seatsRight = groups.last.length;
  } else if (groups.first.length >= 3) {
    seatsLeft = (groups.first.length / 2).ceil();
    seatsRight = groups.first.length - seatsLeft;
  } else {
    seatsLeft = 1;
    seatsRight = 1;
  }

  return seatColumnLayout(seatsLeft, seatsRight);
}
