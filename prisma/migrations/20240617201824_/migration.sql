/*
  Warnings:

  - You are about to drop the column `locationName` on the `Trip` table. All the data in the column will be lost.
  - Added the required column `departureLocation` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `destinationLocation` to the `Trip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Trip" DROP COLUMN "locationName",
ADD COLUMN     "budgetTravel" DOUBLE PRECISION,
ADD COLUMN     "classLevel" TEXT,
ADD COLUMN     "comfortableWithPublicTransport" BOOLEAN,
ADD COLUMN     "departureLocation" TEXT NOT NULL,
ADD COLUMN     "destinationLocation" TEXT NOT NULL;
