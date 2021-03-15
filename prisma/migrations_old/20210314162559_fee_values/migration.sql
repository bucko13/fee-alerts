/*
  Warnings:

  - The migration will remove the values [lt10sats,gt10sats,lt50sats,gt50sats] on the enum `AlertTypes`. If these variants are still used in the database, the migration will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AlertTypes_new" AS ENUM ('ltlow', 'gtlow', 'lthigh', 'gthigh');
ALTER TABLE "public"."User" ALTER COLUMN "types" TYPE "AlertTypes_new" USING ("types"::text::"AlertTypes_new");
ALTER TYPE "AlertTypes" RENAME TO "AlertTypes_old";
ALTER TYPE "AlertTypes_new" RENAME TO "AlertTypes";
DROP TYPE "AlertTypes_old";
COMMIT;
