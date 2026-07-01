-- CreateEnum
CREATE TYPE "InventoryCategory" AS ENUM ('FOOD', 'EQUIPMENT', 'DECORATION', 'CONSUMABLE', 'OTHER');

-- AlterTable
ALTER TABLE "InventoryItem" ADD COLUMN     "category" "InventoryCategory" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "minQuantity" INTEGER,
ADD COLUMN     "unit" TEXT;

-- CreateIndex
CREATE INDEX "InventoryItem_category_idx" ON "InventoryItem"("category");
