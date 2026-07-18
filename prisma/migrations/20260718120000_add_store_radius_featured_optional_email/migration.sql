-- AlterTable: add serving_radius_km and featured_product_ids to store_settings
ALTER TABLE "store_settings"
  ADD COLUMN IF NOT EXISTS "serving_radius_km" DOUBLE PRECISION NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS "featured_product_ids" TEXT[] NOT NULL DEFAULT '{}';

-- AlterTable: make customer_email nullable in orders
ALTER TABLE "orders"
  ALTER COLUMN "customer_email" DROP NOT NULL;
