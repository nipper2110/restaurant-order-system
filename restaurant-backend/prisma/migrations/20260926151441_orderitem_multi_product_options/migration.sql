/*
  Warnings:

  - You are about to drop the column `productOptionId` on the `OrderItem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_productOptionId_fkey";

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "productOptionId";

-- AlterTable
ALTER TABLE "ProductOption" ALTER COLUMN "additionalPrice" DROP NOT NULL;

-- CreateTable
CREATE TABLE "_OrderItemToProductOption" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_OrderItemToProductOption_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_OrderItemToProductOption_B_index" ON "_OrderItemToProductOption"("B");

-- AddForeignKey
ALTER TABLE "_OrderItemToProductOption" ADD CONSTRAINT "_OrderItemToProductOption_A_fkey" FOREIGN KEY ("A") REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderItemToProductOption" ADD CONSTRAINT "_OrderItemToProductOption_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;
