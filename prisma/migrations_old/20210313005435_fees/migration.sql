-- CreateTable
CREATE TABLE "Fee" (
    "id" SERIAL NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hourFee" INTEGER NOT NULL,
    "minimumFee" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);
