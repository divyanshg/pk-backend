# Paintkart Backend

NestJS API for Paintkart paint & hardware e-commerce.

## Setup

```bash
# Install dependencies
pnpm install

# Create database (requires Postgres running on localhost:5432)
docker exec <postgres-container> psql -U postgres -c "CREATE DATABASE paintkart;"

# Push schema
npx prisma db push

# Seed data (13 brands, 10 categories, 216 products)
npx ts-node prisma/seed.ts

# Start dev server
pnpm run start:dev
```

## Environment Variables

Copy `.env` and adjust:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/paintkart?schema=public"
JWT_SECRET="your-secret-here"
ADMIN_PASSCODE="admin123"
PORT=3000
CORS_ORIGIN="http://localhost:8081"
STORAGE_DRIVER="local"
PUBLIC_BASE_URL="http://localhost:3000"
```

## API Endpoints

- **Swagger docs**: http://localhost:3000/docs
- **Health**: GET /healthz

### Public

- GET /brands
- GET /brands/:slug
- GET /categories
- GET /categories/:slug
- GET /products?brand=&category=&subcategory=&search=&badge=&inStock=&page=&pageSize=
- GET /products/:id
- GET /products/:id/related
- GET /shades?brand=
- GET /shades/brand/:brandSlug/grouped
- POST /orders (guest checkout)

### Admin (requires JWT)

- POST /auth/admin/login `{"passcode": "..."}`
- GET /admin/stats
- POST /admin/uploads (multipart image upload)
- DELETE /admin/uploads
- POST/PUT/DELETE /brands, /categories, /products, /shades
- POST /shades/import (CSV bulk import)
- GET /orders
- PATCH /orders/:id/status

## Business Rules

- Free delivery on orders >= ₹2,500
- Shipping fee: ₹149 (flat) if under threshold
- Order statuses: pending → confirmed → shipped → delivered | cancelled
