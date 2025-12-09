-- DropForeignKey
ALTER TABLE "Meal" DROP CONSTRAINT IF EXISTS "Meal_dishId_fkey";

-- AlterTable
ALTER TABLE "Meal" DROP COLUMN IF EXISTS "dishId";

-- CreateTable
CREATE TABLE "MealDish" (
    "id" SERIAL NOT NULL,
    "mealId" INTEGER NOT NULL,
    "dishId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MealDish_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MealDish_mealId_dishId_key" ON "MealDish"("mealId", "dishId");

-- AddForeignKey
ALTER TABLE "MealDish" ADD CONSTRAINT "MealDish_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealDish" ADD CONSTRAINT "MealDish_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "Dish"("id") ON DELETE CASCADE ON UPDATE CASCADE;

