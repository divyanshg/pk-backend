-- AlterTable: add requires_shade to products
ALTER TABLE "products"
  ADD COLUMN IF NOT EXISTS "requires_shade" BOOLEAN NOT NULL DEFAULT false;
