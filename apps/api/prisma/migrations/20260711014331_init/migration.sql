-- CreateTable
CREATE TABLE "Gif" (
    "id" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Gif_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Gif_isActive_idx" ON "Gif"("isActive");
