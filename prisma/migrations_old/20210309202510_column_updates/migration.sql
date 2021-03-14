/*
  Warnings:

  - You are about to drop the column `frequency` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AlertTypes" AS ENUM ('lt10sats', 'gt10sats', 'lt50sats', 'gt50sats');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "frequency",
DROP COLUMN "type",
ADD COLUMN     "types" "AlertTypes"[];

-- DropEnum
DROP TYPE "AlertType";

-- DropEnum
DROP TYPE "Frequency";
