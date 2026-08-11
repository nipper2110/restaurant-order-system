/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `MenuItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[productOptionCategoryId,name]` on the table `ProductOption` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[menuItemId,name]` on the table `ProductOptionCategory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MenuItem_name_key" ON "MenuItem"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductOption_productOptionCategoryId_name_key" ON "ProductOption"("productOptionCategoryId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductOptionCategory_menuItemId_name_key" ON "ProductOptionCategory"("menuItemId", "name");
