-- Add slug column for technical name and drop image (we no longer store image for Dish)
ALTER TABLE "Dish"
    ADD COLUMN "slug" TEXT NOT NULL DEFAULT '',
    DROP COLUMN "image";


