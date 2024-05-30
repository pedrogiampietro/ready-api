/*
  Warnings:

  - Added the required column `accommodationDuration` to the `Trip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "accommodationDuration" INTEGER NOT NULL;
