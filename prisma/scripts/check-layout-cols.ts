import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const seats = await prisma.busLayoutElement.findMany({
  where: { type: 'SEAT', layout: { seatsLeft: 2, seatsRight: 2 } },
  take: 12,
  orderBy: [{ layoutId: 'asc' }, { row: 'asc' }, { col: 'asc' }],
  select: { layoutId: true, row: true, col: true, seatNumber: true },
});

console.log('Sample 2+2 seats:', seats);

const dupes = await prisma.$queryRaw<
  { layoutId: number; deck: string; row: number; col: number; c: bigint }[]
>`
  SELECT layoutId, deck, row, col, COUNT(*) as c
  FROM BusLayoutElement
  GROUP BY layoutId, deck, row, col
  HAVING COUNT(*) > 1
  LIMIT 10
`;

console.log('Duplicates:', dupes);

await prisma.$disconnect();
