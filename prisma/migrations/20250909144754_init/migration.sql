-- CreateEnum
CREATE TYPE "public"."Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "public"."Watchlist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Watchlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WatchlistTerm" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "watchlistId" TEXT NOT NULL,

    CONSTRAINT "WatchlistTerm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "public"."Severity" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AIAnalysis" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "severity" "public"."Severity" NOT NULL,
    "action" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WatchlistTerm_watchlistId_idx" ON "public"."WatchlistTerm"("watchlistId");

-- CreateIndex
CREATE INDEX "AIAnalysis_eventId_idx" ON "public"."AIAnalysis"("eventId");

-- AddForeignKey
ALTER TABLE "public"."WatchlistTerm" ADD CONSTRAINT "WatchlistTerm_watchlistId_fkey" FOREIGN KEY ("watchlistId") REFERENCES "public"."Watchlist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AIAnalysis" ADD CONSTRAINT "AIAnalysis_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
