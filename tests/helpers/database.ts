import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

export const getTestPrisma = () => {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }
  return prisma;
};

export const setupTestDatabase = async () => {
  const testPrisma = getTestPrisma();

  // Clean up test data
  await testPrisma.aIAnalysis.deleteMany();
  await testPrisma.event.deleteMany();
  await testPrisma.watchlistTerm.deleteMany();
  await testPrisma.watchlist.deleteMany();
};

export const teardownTestDatabase = async () => {
  const testPrisma = getTestPrisma();

  // Clean up test data
  await testPrisma.aIAnalysis.deleteMany();
  await testPrisma.event.deleteMany();
  await testPrisma.watchlistTerm.deleteMany();
  await testPrisma.watchlist.deleteMany();

  await testPrisma.$disconnect();
};

export const createTestWatchlist = async (data: any = {}) => {
  const testPrisma = getTestPrisma();

  return await testPrisma.watchlist.create({
    data: {
      name: data.name || "Test Watchlist",
      ...data,
    },
  });
};

export const createTestEvent = async (data: any = {}) => {
  const testPrisma = getTestPrisma();

  return await testPrisma.event.create({
    data: {
      title: data.title || "Test Event",
      description: data.description || "Test Event Description",
      severity: data.severity || "MEDIUM",
      source: data.source || "test",
      rawData: data.rawData || { test: true },
      ...data,
    },
  });
};

export const createTestWatchlistTerm = async (
  watchlistId: string,
  data: any = {}
) => {
  const testPrisma = getTestPrisma();

  return await testPrisma.watchlistTerm.create({
    data: {
      watchlistId,
      term: data.term || "test-term",
      ...data,
    },
  });
};

export const createTestAIAnalysis = async (eventId: string, data: any = {}) => {
  const testPrisma = getTestPrisma();

  return await testPrisma.aIAnalysis.create({
    data: {
      eventId,
      summary: data.summary || "Test AI Analysis Summary",
      severity: data.severity || "MEDIUM",
      action: data.action || "Test Action",
      ...data,
    },
  });
};
