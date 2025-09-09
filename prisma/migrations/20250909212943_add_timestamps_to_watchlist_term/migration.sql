/*
  Warnings:

  - Added the required column `updatedAt` to the `WatchlistTerm` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: Add createdAt with default value
ALTER TABLE "public"."WatchlistTerm" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable: Add updatedAt as nullable first
ALTER TABLE "public"."WatchlistTerm" ADD COLUMN "updatedAt" TIMESTAMP(3);

-- Update existing rows to set updatedAt to the same value as createdAt
UPDATE "public"."WatchlistTerm" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;

-- AlterTable: Make updatedAt required
ALTER TABLE "public"."WatchlistTerm" ALTER COLUMN "updatedAt" SET NOT NULL;
