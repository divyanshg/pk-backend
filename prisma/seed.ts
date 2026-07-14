import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const brands = [
  { slug: 'asian-paints', name: 'Asian Paints', tagline: 'Har Ghar Kuch Kehta Hai', swatch: 'oklch(0.55 0.20 25)', sortOrder: 1 },
  { slug: 'berger', name: 'Berger Paints', tagline: 'Paints for life', swatch: 'oklch(0.50 0.18 250)', sortOrder: 2 },
  { slug: 'birla-opus', name: 'Birla Opus', tagline: 'Where colour finds you', swatch: 'oklch(0.62 0.16 50)', sortOrder: 3 },
  { slug: 'pidilite', name: 'Pidilite', tagline: 'Trusted innovation', swatch: 'oklch(0.65 0.18 145)', sortOrder: 4 },
  { slug: 'roff', name: 'Roff', tagline: 'Tile care experts', swatch: 'oklch(0.60 0.15 200)', sortOrder: 5 },
  { slug: 'fevicol', name: 'Fevicol', tagline: 'Mazboot jod', swatch: 'oklch(0.45 0.18 270)', sortOrder: 6 },
  { slug: 'dr-fixit', name: 'Dr. Fixit', tagline: 'Waterproofing specialist', swatch: 'oklch(0.55 0.20 30)', sortOrder: 7 },
  { slug: 'kansai-nerolac', name: 'Kansai Nerolac', tagline: 'Healthy home paints', swatch: 'oklch(0.70 0.18 90)', sortOrder: 8 },
  { slug: 'dulux', name: 'Dulux', tagline: "Let's colour", swatch: 'oklch(0.65 0.17 35)', sortOrder: 9 },
  { slug: 'indigo', name: 'Indigo Paints', tagline: 'Differentiated. Always.', swatch: 'oklch(0.40 0.18 260)', sortOrder: 10 },
  { slug: 'shalimar', name: 'Shalimar Paints', tagline: 'Heritage of colour', swatch: 'oklch(0.55 0.17 15)', sortOrder: 11 },
  { slug: 'nippon', name: 'Nippon Paint', tagline: 'The Japanese touch', swatch: 'oklch(0.58 0.20 25)', sortOrder: 12 },
  { slug: 'jsw', name: 'JSW Paints', tagline: 'Paint different', swatch: 'oklch(0.50 0.20 280)', sortOrder: 13 },
];

const categories = [
  { slug: 'interior', name: 'Interior Paints', subcategories: ['Luxury Emulsion', 'Premium Emulsion', 'Economy Emulsion', 'Distemper'], blurb: 'Walls that feel like home.', sortOrder: 1 },
  { slug: 'exterior', name: 'Exterior Paints', subcategories: ['Exterior Emulsion', 'Weatherproof Paint', 'Elastomeric Coating', 'Dirt Resistant Paint'], blurb: 'Built to face every season.', sortOrder: 2 },
  { slug: 'primers', name: 'Primers', subcategories: ['Interior Primer', 'Exterior Primer', 'Metal Primer', 'Wood Primer'], blurb: 'The foundation of a great finish.', sortOrder: 3 },
  { slug: 'putty', name: 'Putty', subcategories: ['White Cement Putty', 'Acrylic Wall Putty'], blurb: 'Smoother walls, longer-lasting paint.', sortOrder: 4 },
  { slug: 'waterproofing', name: 'Waterproofing', subcategories: ['Terrace Waterproofing', 'Bathroom Waterproofing', 'Crack Filling', 'Damp Proof Coatings'], blurb: 'Seal it once. Forget the leaks.', sortOrder: 5 },
  { slug: 'wood-finishes', name: 'Wood Finishes', subcategories: ['Melamine', 'PU Polish', 'Wood Stain', 'Wood Sealer', 'Varnish'], blurb: 'Bring out the grain.', sortOrder: 6 },
  { slug: 'metal-finishes', name: 'Metal Finishes', subcategories: ['Enamel Paint', 'Synthetic Enamel', 'Epoxy Coating', 'Anti-Rust Coating'], blurb: 'Tough coats for tough surfaces.', sortOrder: 7 },
  { slug: 'texture', name: 'Texture & Designer', subcategories: ['Texture Paint', 'Metallic Finish', 'Stucco Finish', 'Special Effects'], blurb: 'Walls with character.', sortOrder: 8 },
  { slug: 'floor', name: 'Floor Coatings', subcategories: ['Epoxy Floor Coating', 'Tile Coating'], blurb: 'Floors that hold up.', sortOrder: 9 },
  { slug: 'ancillary', name: 'Ancillary', subcategories: ['Thinner', 'Hardener', 'Additives'], blurb: 'Everything the job needs.', sortOrder: 10 },
];

const swatches = [
  'oklch(0.92 0.04 80)', 'oklch(0.85 0.08 60)', 'oklch(0.78 0.12 40)', 'oklch(0.62 0.15 30)',
  'oklch(0.55 0.10 150)', 'oklch(0.45 0.12 240)', 'oklch(0.35 0.08 280)', 'oklch(0.88 0.06 120)',
  'oklch(0.72 0.16 80)', 'oklch(0.50 0.14 200)', 'oklch(0.95 0.02 90)', 'oklch(0.30 0.04 60)',
];
const finishes = ['Matte', 'Satin', 'Sheen', 'Gloss', 'High Gloss'];
const units = ['1 L', '4 L', '10 L', '20 L'];

function hash(s: string): number {
  let h = 0;
  for (const c of s) {
    h = (h * 31 + c.charCodeAt(0)) | 0;
  }
  return Math.abs(h);
}

function generateProducts() {
  const products: Array<{
    id: string;
    name: string;
    brandSlug: string;
    categorySlug: string;
    subcategory: string;
    price: number;
    unit: string;
    rating: number;
    reviews: number;
    finish: string;
    coverage: string;
    swatch: string;
    badge: string | null;
    description: string;
  }> = [];

  const first6Brands = brands.slice(0, 6);

  for (const cat of categories) {
    for (const sub of cat.subcategories) {
      for (const brand of first6Brands) {
        const id = `${brand.slug}-${cat.slug}-${sub.toLowerCase().replace(/\s+/g, '-')}`;
        const seed = hash(id);

        products.push({
          id,
          name: `${brand.name} ${sub}`,
          brandSlug: brand.slug,
          categorySlug: cat.slug,
          subcategory: sub,
          price: 350 + (seed % 60) * 75,
          unit: units[seed % units.length],
          rating: 3.8 + (seed % 12) / 10,
          reviews: 24 + (seed % 480),
          finish: finishes[seed % 5],
          coverage: `${110 + (seed % 60)} sq.ft / litre / coat`,
          swatch: swatches[seed % 12],
          badge: seed % 7 === 0 ? 'Bestseller' : seed % 11 === 0 ? 'New' : null,
          description: `${sub} from ${brand.name} delivers a smooth, long-lasting finish with low VOC content, excellent coverage, and easy application. Ideal for ${cat.name.toLowerCase()} projects in both new construction and repaint jobs.`,
        });
      }
    }
  }

  return products;
}

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.shade.deleteMany();
  await prisma.product.deleteMany();
  await prisma.order.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();

  // Seed brands
  await prisma.brand.createMany({ data: brands });
  console.log(`Created ${brands.length} brands`);

  // Seed categories
  await prisma.category.createMany({ data: categories });
  console.log(`Created ${categories.length} categories`);

  // Seed products
  const products = generateProducts();
  await prisma.product.createMany({ data: products });
  console.log(`Created ${products.length} products`);

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
