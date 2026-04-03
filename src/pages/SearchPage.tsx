import { useSearchParams } from 'react-router-dom';
import { useProducts } from '@/hooks/useFirestoreData';
import ProductCard from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/Skeletons';
import { Package } from 'lucide-react';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const { products, loading } = useProducts();

  const query = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || 'popular';
  const minPrice = Number(searchParams.get('minPrice') || 0);
  const maxPrice = Number(searchParams.get('maxPrice') || 50000);
  const minRating = Number(searchParams.get('minRating') || 0);

  const filtered = products
    .filter(p =>
      !query ||
      p.name?.toLowerCase().includes(query.toLowerCase()) ||
      p.brand?.toLowerCase().includes(query.toLowerCase())
    )
    .filter(p => p.price >= minPrice && p.price <= maxPrice)
    .filter(p => (p.rating || 0) >= minRating)
    .sort((a, b) => {
      if (sort === 'price_asc') return a.price - b.price;
      if (sort === 'price_desc') return b.price - a.price;
      if (sort === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sort === 'newest') return 0;
      return (b.sold || 0) - (a.sold || 0);
    });

  return (
    <div className="pb-nav lg:pb-8 max-w-screen-xl mx-auto px-4 pt-2">
      <p className="text-sm text-muted-foreground mb-3 font-medium">
        {query && <span>Results for "<strong>{query}</strong>" — </span>}
        {filtered.length} products
      </p>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map(product => <ProductCard key={product.id} product={product} />)}
          {filtered.length === 0 && (
            <div className="col-span-2 md:col-span-3 lg:col-span-4 text-center py-16">
              <Package size={40} className="mx-auto mb-3 text-muted-foreground opacity-30" />
              <h3 className="font-bold mb-1">No products found</h3>
              <p className="text-muted-foreground text-sm">Try adjusting your filters</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
