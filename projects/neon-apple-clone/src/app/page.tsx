import { db } from "@/lib/db";
import { parseJsonArray, type Product, type ProductSpec } from "@/lib/types";
import { Navbar } from "@/components/neon/navbar";
import { HeroSection } from "@/components/neon/hero-section";
import { ProductGrid } from "@/components/neon/product-grid";
import { Newsletter } from "@/components/neon/newsletter";
import { StatsTicker } from "@/components/neon/stats-ticker";
import { StorePerks } from "@/components/neon/store-perks";
import { Entertainment } from "@/components/neon/entertainment";
import { Footer } from "@/components/neon/footer";
import { BagDrawer } from "@/components/neon/bag-drawer";
import { ProductDialog } from "@/components/neon/product-dialog";
import { AnnouncementBar } from "@/components/neon/announcement-bar";

export const dynamic = "force-dynamic";

export default async function Home() {
  const rawProducts = await db.product.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const products: Product[] = rawProducts.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    description: p.description,
    price: p.price,
    image: p.image,
    category: p.category,
    accentColor: p.accentColor,
    badge: p.badge,
    featured: p.featured,
    hero: p.hero,
    sortOrder: p.sortOrder,
    specs: parseJsonArray<ProductSpec>(p.specs),
    highlights: parseJsonArray<string>(p.highlights),
  }));

  const heroProducts = products.filter((p) => p.hero);

  return (
    <div className="flex min-h-screen flex-col bg-[#030308]">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1" id="main">
        {/* Hero sections — Apple style stacked segments */}
        {heroProducts.map((product, index) => (
          <HeroSection key={product.id} product={product} index={index} />
        ))}

        <StatsTicker />

        {/* Latest products grid */}
        <ProductGrid products={products} loading={false} />

        {/* Apple Store difference */}
        <StorePerks />

        {/* Entertainment services */}
        <Entertainment />

        <Newsletter />
      </main>

      <Footer />
      <BagDrawer />
      <ProductDialog />
    </div>
  );
}
