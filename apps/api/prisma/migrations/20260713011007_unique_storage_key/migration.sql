/*
  Warnings:

  - A unique constraint covering the columns `[storageKey]` on the table `Gif` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Gif_storageKey_key" ON "Gif"("storageKey");
