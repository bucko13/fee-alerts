/*
  Warnings:

  - Changed the column `types` on the `User` table from a scalar field to a list field. If there are non-null values in that column, this migration step will fail.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "types" SET DATA TYPE "AlertTypes"[];
