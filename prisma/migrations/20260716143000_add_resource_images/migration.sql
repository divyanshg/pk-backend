ALTER TABLE "brands" ADD COLUMN "image_url" TEXT;

ALTER TABLE "categories" ADD COLUMN "image_url" TEXT;

ALTER TABLE "products" ADD COLUMN "images" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
