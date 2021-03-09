-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('once', 'twice');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('lt10sats', 'gt10sats', 'lt50sats', 'gt50sats');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "frequency" "Frequency" NOT NULL,
    "type" "AlertType"[],

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User.email_unique" ON "User"("email");
