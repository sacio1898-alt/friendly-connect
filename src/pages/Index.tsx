import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProducts, useCategories, useBanners, useSettings } from '@/hooks/useFirestoreData';
import ProductCard from '@/components/ProductCard';
import { ProductCardSkeleton, BannerSkeleton, CategorySkeleton } from '@/components/Skeletons';
import { ChevronRight, TrendingUp, Zap, Package } from 'lucide-react';
import SEOHead from '@/components/SEOHead';

export default function Index() {
  const { products, loading: pLoading } = useProducts();
  const { categories, loading: cLoading } = useCategories();
  const { banners, loading: bLoading } = useBanners();
  const { settings } = useSettings();
  const [currentBanner, setCurrentBanner] = useState(0);
  const loading = pLoading || cLoading || bLoading;

  useEffect(() => {
    if (loading || banners.length === 0) return;
    const interval = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [loading, banners.length]);

  const flashDeals = products.filter(p => p.originalPrice && p.originalPrice > p.price).slice(0, 4);
  const featured = products.filter(p => p.featured).slice(0, 8);
  const allProducts = products.slice(0, 12);

  return (
    <div className="pb-nav lg:pb-8">
      <SEOHead
        title={`${settings.appName} — বাংলাদেশের বিশ্বস্ত অনলাইন শপিং`}
        description={`${settings.appName} এ ${products.length}+ পণ্য পাবেন সাশ্রয়ী মূল্যে। ক্যাশ অন ডেলিভারি, bKash, Nagad। দ্রুত ডেলিভারি ও ৭ দিনের রিটার্ন।`}
        url="https://zupramart.netlify.app/"
      />
      {/* Desktop: Banner + Category side by side */}
      <section className="px-4 pt-3 lg:pt-6">
        <div className="lg:grid lg:grid-cols-3 lg:gap-4">
          {/* Banner */}
          <div className="lg:col-span-2">
            {loading ? <BannerSkeleton /> : banners.length > 0 ? (
              <div className="relative rounded-2xl overflow-hidden">
                <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentBanner * 100}%)` }}>
                  {banners.map(banner => (
                    <Link key={banner.id} to={banner.link || '/'} className="block shrink-0 w-full">
                      <img src={banner.image} alt="" className="w-full h-32 sm:h-44 lg:h-[340px] object-cover" />
                    </Link>
                  ))}
                </div>
                {banners.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {banners.map((_, i) => (
                      <button key={i} onClick={() => setCurrentBanner(i)} className={`rounded-full transition-all ${i === currentBanner ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-muted rounded-2xl h-32 sm:h-44 lg:h-[340px] flex items-center justify-center text-muted-foreground">
                <Package size={40} className="opacity-30" />
              </div>
            )}
          </div>

          {/* Category scroll (desktop: vertical, mobile: hidden here, shown below) */}
          <div className="hidden lg:block">
            <div className="bg-card border border-border rounded-2xl p-4 h-[340px] overflow-y-auto">
              <h3 className="font-bold text-sm mb-3">Categories</h3>
              <div className="space-y-2">
                {cLoading ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-10 rounded-xl" />) :
                  categories.map(cat => (
                    <Link key={cat.id} to={`/category/${cat.id}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors">
                      <img src={cat.image} alt={cat.name} className="w-9 h-9 rounded-lg object-cover" />
                      <span className="text-sm font-medium">{cat.name}</span>
                      <ChevronRight size={14} className="ml-auto text-muted-foreground" />
                    </Link>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Scroll (mobile) */}
      <section className="mt-5 lg:hidden">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="font-bold text-base">Categories</h2>
          <Link to="/category" className="text-primary text-sm font-medium flex items-center gap-1">See all <ChevronRight size={14} /></Link>
        </div>
         <div className="flex gap-2.5 px-4 overflow-x-auto scrollbar-hide pb-2">
          {cLoading
            ? Array.from({ length: 6 }).map((_, i) => <CategorySkeleton key={i} />)
            : categories.map(cat => (
              <Link key={cat.id} to={`/category/${cat.id}`} className="flex flex-col items-center gap-1 shrink-0">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted border border-border/50">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <span className="text-[10px] font-medium text-center w-14 truncate">{cat.name}</span>
              </Link>
            ))
          }
        </div>
      </section>

      {/* Flash Deals */}
      {flashDeals.length > 0 && (
        <section className="mt-6 px-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><Zap size={18} className="text-accent fill-accent" /><h2 className="font-bold text-base">Flash Deals</h2></div>
            <Link to="/search?sort=discount" className="text-primary text-sm font-medium flex items-center gap-1">View all <ChevronRight size={14} /></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {flashDeals.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="mt-6 px-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><TrendingUp size={18} className="text-primary" /><h2 className="font-bold text-base">Featured Products</h2></div>
            <Link to="/search" className="text-primary text-sm font-medium flex items-center gap-1">View all <ChevronRight size={14} /></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {featured.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        </section>
      )}

      {/* All Products */}
      <section className="mt-6 px-4">
        <h2 className="font-bold text-base mb-3">All Products</h2>
        {pLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : allProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {allProducts.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="text-center py-16">
            <Package size={40} className="mx-auto mb-3 text-muted-foreground opacity-30" />
            <p className="text-muted-foreground text-sm">No products yet</p>
          </div>
        )}
      </section>
    </div>
  );
}
