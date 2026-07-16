ALTER TABLE "products" ADD COLUMN "account_type_pricing" JSONB NOT NULL DEFAULT '[]';

ALTER TABLE "discounts" ADD COLUMN "brand_slugs" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
