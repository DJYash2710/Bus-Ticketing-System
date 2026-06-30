import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const missing = await prisma.schedule.findMany({
    where: { busLayoutId: null },
    include: {
      bus: { select: { id: true, currentLayoutId: true, name: true } },
    },
  });

  if (missing.length === 0) {
    console.log('All schedules already have busLayoutId.');
    return;
  }

  let updated = 0;
  let skipped = 0;

  for (const schedule of missing) {
    const layoutId = schedule.bus.currentLayoutId;
    if (!layoutId) {
      console.warn(`Skip schedule ${schedule.id} — bus ${schedule.bus.name} has no current layout`);
      skipped++;
      continue;
    }

    await prisma.schedule.update({
      where: { id: schedule.id },
      data: { busLayoutId: layoutId },
    });
    updated++;
  }

  console.log(`Backfill complete: ${updated} updated, ${skipped} skipped.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
