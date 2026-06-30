SELECT e.layoutId, e.deck, e.row, e.col, e.type, l.seatsLeft, l.seatsRight
FROM BusLayoutElement e
JOIN BusLayout l ON e.layoutId = l.id
WHERE l.seatsLeft = 2 AND l.seatsRight = 2 AND e.type = 'SEAT'
ORDER BY e.layoutId, e.row, e.col
LIMIT 20;
