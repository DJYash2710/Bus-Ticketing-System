-- Remap legacy packed 4-column grid to aisle-centered dynamic grid.
-- Process high columns first to avoid unique-key collisions.

-- 2+2 seats: cols 0,1,2,3 -> 0,1,3,4 (aisle at 2)
UPDATE `BusLayoutElement` e
INNER JOIN `BusLayout` l ON e.layoutId = l.id
SET e.col = 4
WHERE e.type = 'SEAT' AND l.seatsLeft = 2 AND l.seatsRight = 2 AND e.col = 3;

UPDATE `BusLayoutElement` e
INNER JOIN `BusLayout` l ON e.layoutId = l.id
SET e.col = 3
WHERE e.type = 'SEAT' AND l.seatsLeft = 2 AND l.seatsRight = 2 AND e.col = 2;

-- 1+1 sleeper seats: cols 0,3 -> 0,2 (aisle at 1)
UPDATE `BusLayoutElement` e
INNER JOIN `BusLayout` l ON e.layoutId = l.id
SET e.col = 2
WHERE e.type = 'SEAT' AND l.seatsLeft = 1 AND l.seatsRight = 1 AND e.col = 3;

-- Washroom to aisle column
UPDATE `BusLayoutElement` e
INNER JOIN `BusLayout` l ON e.layoutId = l.id
SET e.col = l.seatsLeft
WHERE e.type = 'WASHROOM' AND e.col <> l.seatsLeft;

-- Front/rear exits to far-right column (gridWidth - 1)
UPDATE `BusLayoutElement` e
INNER JOIN `BusLayout` l ON e.layoutId = l.id
SET e.col = l.seatsLeft + l.seatsRight
WHERE e.type IN ('EXIT_FRONT', 'EXIT_REAR') AND e.col <> l.seatsLeft + l.seatsRight;

-- Schedule seat snapshots (same rules)
UPDATE `Seat` s
INNER JOIN `Schedule` sch ON s.scheduleId = sch.id
INNER JOIN `BusLayout` l ON sch.busLayoutId = l.id
SET s.col = 4
WHERE l.seatsLeft = 2 AND l.seatsRight = 2 AND s.col = 3;

UPDATE `Seat` s
INNER JOIN `Schedule` sch ON s.scheduleId = sch.id
INNER JOIN `BusLayout` l ON sch.busLayoutId = l.id
SET s.col = 3
WHERE l.seatsLeft = 2 AND l.seatsRight = 2 AND s.col = 2;

UPDATE `Seat` s
INNER JOIN `Schedule` sch ON s.scheduleId = sch.id
INNER JOIN `BusLayout` l ON sch.busLayoutId = l.id
SET s.col = 2
WHERE l.seatsLeft = 1 AND l.seatsRight = 1 AND s.col = 3;
