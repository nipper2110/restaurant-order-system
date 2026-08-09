/*
  Warnings:

  - You are about to drop the column `menuItemId` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `menuItemId` on the `ProductOption` table. All the data in the column will be lost.
  - Added the required column `image` to the `MenuItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productOptionCategoryId` to the `ProductOption` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'ADMIN');

-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_menuItemId_fkey";

-- DropForeignKey
ALTER TABLE "ProductOption" DROP CONSTRAINT "ProductOption_menuItemId_fkey";

-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'ADMIN';

-- AlterTable
ALTER TABLE "Image" DROP COLUMN "menuItemId";

-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "image" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ProductOption" DROP COLUMN "menuItemId",
ADD COLUMN     "productOptionCategoryId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "ProductOptionCategory" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "menuItemId" INTEGER NOT NULL,

    CONSTRAINT "ProductOptionCategory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductOptionCategory" ADD CONSTRAINT "ProductOptionCategory_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductOption" ADD CONSTRAINT "ProductOption_productOptionCategoryId_fkey" FOREIGN KEY ("productOptionCategoryId") REFERENCES "ProductOptionCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
