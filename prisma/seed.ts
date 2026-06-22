// prisma/seed.ts
import {
  PrismaClient,
  UserRole,
  BusType,
  ScheduleStatus,
  SeatStatus,
  BookingStatus,
  PaymentStatus,
  CouponType,
  LoyaltyEventType,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── Helpers ────────────────────────────────────────────────────────────────

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function dt(
  base: Date,
  daysOffset: number,
  hours: number,
  minutes: number,
): Date {
  const d = addDays(base, daysOffset);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

// Simple 2+2 seater layout → cols A B C D
function generateSeats(capacity: number) {
  const cols = ["A", "B", "C", "D"];
  const seats: {
    seatNumber: string;
    row: number;
    col: number;
    deck: string;
  }[] = [];

  for (let r = 0; seats.length < capacity; r++) {
    for (let c = 0; c < 4 && seats.length < capacity; c++) {
      seats.push({
        seatNumber: `${r + 1}${cols[c]}`,
        row: r,
        col: c,
        deck: "LOWER",
      });
    }
  }

  return seats;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Starting full seed...\n");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ── 1. Users ──────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash("Admin@123", 10);
  const userHash = await bcrypt.hash("Password@123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@busapp.com" },
    update: {},
    create: {
      name: "System Admin",
      email: "admin@busapp.com",
      phone: "9999999999",
      passwordHash: adminHash,
      role: UserRole.ADMIN,
      referralCode: "ADMIN0001",
      creditsBalance: 0,
    },
  });

  const yash = await prisma.user.upsert({
    where: { email: "yash@busapp.com" },
    update: {},
    create: {
      name: "Yash Chawan",
      email: "yash@busapp.com",
      phone: "9876543210",
      passwordHash: userHash,
      role: UserRole.USER,
      referralCode: "YASH1001",
      creditsBalance: 200,
    },
  });

  const priya = await prisma.user.upsert({
    where: { email: "priya@busapp.com" },
    update: {},
    create: {
      name: "Priya Sharma",
      email: "priya@busapp.com",
      phone: "9123456789",
      passwordHash: userHash,
      role: UserRole.USER,
      referralCode: "PRIY1002",
      referredById: yash.id,
      creditsBalance: 100,
    },
  });

  const operatorUser = await prisma.user.upsert({
    where: { email: "operator@busapp.com" },
    update: {},
    create: {
      name: "Raj Travels Operator",
      email: "operator@busapp.com",
      phone: "9111111111",
      passwordHash: adminHash,
      role: UserRole.OPERATOR,
      referralCode: "OPER0001",
      creditsBalance: 0,
    },
  });

  console.log(
    `✅ Users (4): ${admin.email}, ${yash.email}, ${priya.email}, ${operatorUser.email}`,
  );

  // ── 2. Loyalty events ─────────────────────────────────────────────────────
  const hasLoyalty = await prisma.loyaltyEvent.findFirst({
    where: { userId: yash.id },
  });

  if (!hasLoyalty) {
    await prisma.loyaltyEvent.createMany({
      data: [
        {
          userId: yash.id,
          type: LoyaltyEventType.EARN_REFERRAL,
          credits: 200,
          description: "Referral bonus — invited Priya Sharma",
        },
        {
          userId: priya.id,
          type: LoyaltyEventType.EARN_REFERRAL,
          credits: 100,
          description: "Welcome bonus — joined via Yash referral",
        },
      ],
    });
  }

  console.log(`✅ Loyalty events seeded`);

  // ── 3. Bus Operator ───────────────────────────────────────────────────────
  let busOp = await prisma.busOperator.findFirst({
    where: { name: "Raj Travels Pvt Ltd" },
  });
  if (!busOp) {
    busOp = await prisma.busOperator.create({
      data: {
        name: "Raj Travels Pvt Ltd",
        contactEmail: "operator@busapp.com",
        contactPhone: "9111111111",
      },
    });
  }

  console.log(`✅ Bus Operator: ${busOp.name}`);

  // ── 4. Cities ─────────────────────────────────────────────────────────────
  const cityData = [
    { name: "Mumbai", state: "Maharashtra", country: "India" },
    { name: "Pune", state: "Maharashtra", country: "India" },
    { name: "Nashik", state: "Maharashtra", country: "India" },
    { name: "Nagpur", state: "Maharashtra", country: "India" },
    { name: "Aurangabad", state: "Maharashtra", country: "India" },
    { name: "Surat", state: "Gujarat", country: "India" },
    { name: "Ahmedabad", state: "Gujarat", country: "India" },
    { name: "Vadodara", state: "Gujarat", country: "India" },
  ];

  const cities: Record<string, { id: number }> = {};

  for (const c of cityData) {
    const city = await prisma.city.upsert({
      where: {
        name_state_country: {
          name: c.name,
          state: c.state,
          country: c.country,
        },
      },
      update: {},
      create: c,
    });
    cities[c.name] = city;
  }

  console.log(
    `✅ Cities (${cityData.length}): ${Object.keys(cities).join(", ")}`,
  );

  // ── 5. Buses ──────────────────────────────────────────────────────────────
  const busData = [
    {
      registrationNo: "MH01AB1234",
      name: "Mumbai Express",
      capacity: 40,
      type: BusType.SEATER,
      amenities: "AC,WiFi,Charging Port",
      operatorId: busOp.id,
    },
    {
      registrationNo: "MH12XY5678",
      name: "Pune Nighter",
      capacity: 36,
      type: BusType.SLEEPER,
      amenities: "AC,Blanket,Water Bottle",
      operatorId: busOp.id,
    },
    {
      registrationNo: "GJ05CD9999",
      name: "Gujarat Connector",
      capacity: 40,
      type: BusType.SEMI_SLEEPER,
      amenities: "AC,Charging Port",
      operatorId: busOp.id,
    },
    {
      registrationNo: "MH20EF3333",
      name: "Deccan Cruiser",
      capacity: 40,
      type: BusType.AC,
      amenities: "AC,WiFi,Snacks,USB Ports",
      operatorId: busOp.id,
    },
  ];

  const buses: Record<string, { id: number; capacity: number }> = {};

  for (const b of busData) {
    const bus = await prisma.bus.upsert({
      where: { registrationNo: b.registrationNo },
      update: {},
      create: b,
    });
    buses[b.name] = bus;
  }

  console.log(`✅ Buses (${busData.length}): ${Object.keys(buses).join(", ")}`);

  // ── 6. Routes ─────────────────────────────────────────────────────────────
  const routeData = [
    {
      code: "MUM-PUN-01",
      from: "Mumbai",
      to: "Pune",
      distanceKm: 150,
      durationMin: 180,
    },
    {
      code: "MUM-NAS-01",
      from: "Mumbai",
      to: "Nashik",
      distanceKm: 165,
      durationMin: 210,
    },
    {
      code: "PUN-NAG-01",
      from: "Pune",
      to: "Nagpur",
      distanceKm: 720,
      durationMin: 780,
    },
    {
      code: "MUM-SUR-01",
      from: "Mumbai",
      to: "Surat",
      distanceKm: 280,
      durationMin: 360,
    },
    {
      code: "SUR-AHM-01",
      from: "Surat",
      to: "Ahmedabad",
      distanceKm: 270,
      durationMin: 300,
    },
    {
      code: "AHM-VAD-01",
      from: "Ahmedabad",
      to: "Vadodara",
      distanceKm: 113,
      durationMin: 120,
    },
  ];

  const routes: Record<string, { id: number }> = {};

  for (const r of routeData) {
    const fromCity = cities[r.from];
    const toCity = cities[r.to];

    if (!fromCity || !toCity) {
      console.warn(`⚠️  Skipping route ${r.code} — city not found`);
      continue;
    }

    const route = await prisma.route.upsert({
      where: { code: r.code },
      update: {
        estimatedDurationMinutes: r.durationMin,
      },
      create: {
        code: r.code,
        fromCityId: fromCity.id,
        toCityId: toCity.id,
        distanceKm: r.distanceKm,
        durationMin: r.durationMin,
        estimatedDurationMinutes: r.durationMin,
      },
    });
    routes[r.code] = route;
  }

  console.log(
    `✅ Routes (${routeData.length}): ${Object.keys(routes).join(", ")}`,
  );

  // ── 7. Schedules ──────────────────────────────────────────────────────────
  type SchedDef = {
    routeCode: string;
    busName: string;
    dep: [number, number, number]; // [daysOffset, hour, min]
    arr: [number, number, number];
    basePrice: number;
  };

  const schedDefs: SchedDef[] = [
    // Mumbai → Pune (4 trips across 2 days)
    {
      routeCode: "MUM-PUN-01",
      busName: "Mumbai Express",
      dep: [1, 6, 0],
      arr: [1, 9, 0],
      basePrice: 350,
    },
    {
      routeCode: "MUM-PUN-01",
      busName: "Deccan Cruiser",
      dep: [1, 14, 0],
      arr: [1, 17, 0],
      basePrice: 450,
    },
    {
      routeCode: "MUM-PUN-01",
      busName: "Mumbai Express",
      dep: [2, 6, 0],
      arr: [2, 9, 0],
      basePrice: 350,
    },
    {
      routeCode: "MUM-PUN-01",
      busName: "Deccan Cruiser",
      dep: [2, 20, 0],
      arr: [2, 23, 0],
      basePrice: 450,
    },

    // Mumbai → Nashik (2 trips)
    {
      routeCode: "MUM-NAS-01",
      busName: "Deccan Cruiser",
      dep: [1, 7, 30],
      arr: [1, 11, 0],
      basePrice: 300,
    },
    {
      routeCode: "MUM-NAS-01",
      busName: "Mumbai Express",
      dep: [2, 8, 0],
      arr: [2, 11, 30],
      basePrice: 300,
    },

    // Pune → Nagpur overnight (2 trips)
    {
      routeCode: "PUN-NAG-01",
      busName: "Pune Nighter",
      dep: [1, 21, 0],
      arr: [2, 9, 0],
      basePrice: 800,
    },
    {
      routeCode: "PUN-NAG-01",
      busName: "Pune Nighter",
      dep: [2, 21, 0],
      arr: [3, 9, 0],
      basePrice: 800,
    },

    // Mumbai → Surat (1 trip)
    {
      routeCode: "MUM-SUR-01",
      busName: "Gujarat Connector",
      dep: [1, 9, 0],
      arr: [1, 15, 0],
      basePrice: 550,
    },

    // Surat → Ahmedabad (1 trip)
    {
      routeCode: "SUR-AHM-01",
      busName: "Gujarat Connector",
      dep: [1, 16, 0],
      arr: [1, 21, 0],
      basePrice: 400,
    },

    // Ahmedabad → Vadodara (2 trips)
    {
      routeCode: "AHM-VAD-01",
      busName: "Gujarat Connector",
      dep: [1, 8, 0],
      arr: [1, 10, 0],
      basePrice: 200,
    },
    {
      routeCode: "AHM-VAD-01",
      busName: "Gujarat Connector",
      dep: [2, 8, 0],
      arr: [2, 10, 0],
      basePrice: 200,
    },
  ];

  type CreatedSchedule = { id: number; busId: number; basePrice: number };
  const createdSchedules: CreatedSchedule[] = [];

  for (const s of schedDefs) {
    const depTime = dt(today, s.dep[0], s.dep[1], s.dep[2]);
    const arrTime = dt(today, s.arr[0], s.arr[1], s.arr[2]);

    const existing = await prisma.schedule.findFirst({
      where: {
        routeId: routes[s.routeCode]!.id,
        busId: buses[s.busName]!.id,
        departureTime: depTime,
      },
    });

    const schedule =
      existing ??
      (await prisma.schedule.create({
        data: {
          routeId: routes[s.routeCode]!.id,
          busId: buses[s.busName]!.id,
          departureTime: depTime,
          arrivalTime: arrTime,
          basePrice: s.basePrice,
          status: ScheduleStatus.ACTIVE,
        },
      }));

    createdSchedules.push({
      id: schedule.id,
      busId: buses[s.busName]!.id,
      basePrice: s.basePrice,
    });
  }

  console.log(`✅ Schedules (${createdSchedules.length}): created`);

  // ── 8. Seats ──────────────────────────────────────────────────────────────
  let totalSeats = 0;

  for (const sched of createdSchedules) {
    const count = await prisma.seat.count({ where: { scheduleId: sched.id } });
    if (count > 0) continue;

    const bus = await prisma.bus.findUnique({ where: { id: sched.busId } });
    if (!bus) continue;

    const seatDefs = generateSeats(bus.capacity);

    await prisma.seat.createMany({
      data: seatDefs.map((s) => ({
        scheduleId: sched.id,
        seatNumber: s.seatNumber,
        row: s.row,
        col: s.col,
        deck: s.deck,
        status: SeatStatus.AVAILABLE,
      })),
    });

    totalSeats += seatDefs.length;
  }

  console.log(
    `✅ Seats: ${totalSeats} generated across ${createdSchedules.length} schedules`,
  );

  // ── 9. Coupons ────────────────────────────────────────────────────────────
  const couponData = [
    {
      code: "WELCOME10",
      type: CouponType.PERCENT,
      value: 10,
      maxUsesPerUser: 1,
      maxGlobalUses: 500,
      isActive: true,
      validFrom: today,
      validTo: addDays(today, 90),
    },
    {
      code: "FLAT100",
      type: CouponType.FIXED,
      value: 100,
      maxUsesPerUser: 1,
      maxGlobalUses: 200,
      isActive: true,
      validFrom: today,
      validTo: addDays(today, 30),
    },
    {
      code: "MONSOON20",
      type: CouponType.PERCENT,
      value: 20,
      maxUsesPerUser: 2,
      maxGlobalUses: 100,
      isActive: true,
      validFrom: today,
      validTo: addDays(today, 60),
    },
    {
      code: "EXPIRED50",
      type: CouponType.FIXED,
      value: 50,
      maxUsesPerUser: 1,
      maxGlobalUses: 50,
      isActive: false,
      validFrom: addDays(today, -60),
      validTo: addDays(today, -1),
    },
  ];

  for (const c of couponData) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    });
  }

  console.log(
    `✅ Coupons (${couponData.length}): ${couponData.map((c) => c.code).join(", ")}`,
  );

  // ── 10. Sample confirmed booking (Yash on first Mumbai→Pune trip) ─────────
  const firstSched = createdSchedules[0]!;

  const existingBooking = await prisma.booking.findFirst({
    where: { userId: yash.id, scheduleId: firstSched.id },
  });

  if (!existingBooking) {
    const seatsToBook = await prisma.seat.findMany({
      where: { scheduleId: firstSched.id, seatNumber: { in: ["1A", "1C"] } },
    });

    if (seatsToBook.length === 2) {
      const baseAmount = seatsToBook.length * firstSched.basePrice;
      const taxAmount = Math.round(baseAmount * 0.05); // 5% tax
      const discountAmount = 0;
      const commissionRate = 0.05;
      const commissionAmount = Math.round(baseAmount * commissionRate);
      const totalAmount = baseAmount + taxAmount - discountAmount;

      const booking = await prisma.booking.create({
        data: {
          userId: yash.id,
          scheduleId: firstSched.id,
          baseAmount,
          taxAmount,
          discountAmount,
          commissionRate,
          commissionAmount,
          totalAmount,
          status: BookingStatus.CONFIRMED,
          paymentStatus: PaymentStatus.SUCCESS,
          seats: {
            create: seatsToBook.map((s) => ({ seatId: s.id })),
          },
        },
      });

      // Mark seats as BOOKED
      await prisma.seat.updateMany({
        where: { id: { in: seatsToBook.map((s) => s.id) } },
        data: { status: SeatStatus.BOOKED },
      });

      // Payment record
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          provider: "MOCK",
          providerRef: `MOCK-TXN-${Date.now()}`,
          amount: totalAmount,
          status: PaymentStatus.SUCCESS,
          paidAt: new Date(),
          rawResponse: JSON.stringify({
            note: "Seeded mock payment",
            bookingId: booking.id,
          }),
        },
      });

      // Loyalty earn event for booking
      await prisma.loyaltyEvent.create({
        data: {
          userId: yash.id,
          type: LoyaltyEventType.EARN_BOOKING,
          bookingId: booking.id,
          credits: Math.floor(totalAmount / 10), // 1 credit per ₹10
          description: `Credits earned for booking #${booking.id}`,
        },
      });

      // Update Yash's credits balance
      await prisma.user.update({
        where: { id: yash.id },
        data: { creditsBalance: { increment: Math.floor(totalAmount / 10) } },
      });

      console.log(
        `✅ Sample booking #${booking.id}: Yash → Mumbai→Pune (seats 1A, 1C) — ₹${totalAmount}`,
      );
    }
  }

  // ── 11. Summary ───────────────────────────────────────────────────────────
  console.log("\n────────────────────────────────────────");
  console.log("🌱 Seed completed successfully!");
  console.log("────────────────────────────────────────");
  console.log("  Admin    → admin@busapp.com       / Admin@123");
  console.log("  User     → yash@busapp.com        / Password@123");
  console.log("  User 2   → priya@busapp.com       / Password@123");
  console.log("  Operator → operator@busapp.com    / Admin@123");
  console.log(`  Cities   → ${cityData.length}`);
  console.log(`  Buses    → ${busData.length}`);
  console.log(`  Routes   → ${routeData.length}`);
  console.log(`  Schedules→ ${createdSchedules.length}`);
  console.log(`  Coupons  → ${couponData.length}`);
  console.log("  Booking  → 1 sample (confirmed + paid + loyalty)");
  console.log("────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("\n❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
