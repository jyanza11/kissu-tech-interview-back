import { prisma } from "./lib/prisma";
import { randomUUID } from "node:crypto";

async function main() {
  const wl = await prisma.watchlist.upsert({
    where: { id: "550e8400-e29b-41d4-a716-446655440000" },
    create: {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Default Watchlist",
    },
    update: {},
  });

  await prisma.watchlistTerm.createMany({
    data: [
      { term: "security", watchlistId: wl.id },
      { term: "outage", watchlistId: wl.id },
      { term: "breach", watchlistId: wl.id },
    ],
    skipDuplicates: true,
  });

  // Create events with auto-generated UUIDs
  const event1 = await prisma.event.create({
    data: {
      title: "Service outage detected",
      description: "An outage in region us-east-1",
      severity: "HIGH",
    },
  });

  const event2 = await prisma.event.create({
    data: {
      title: "Security incident reported",
      description: "Suspicious login attempts",
      severity: "MEDIUM",
    },
  });

  console.log("Created events with IDs:", event1.id, event2.id);
}

main()
  .then(async () => {
    console.log("Seed completed");
  })
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
