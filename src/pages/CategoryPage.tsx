import { useParams, Link } from 'react-router-dom';
import { useCategories, useProducts } from '@/hooks/useFirestoreData';
import ProductCard from '@/components/ProductCard';
import { ProductCardSkeleton, CategorySkeleton } from '@/components/Skeletons';
import { Package } from 'lucide-react';

export default function CategoryPage() {
  const { id } = useParams();
  const { categories, loading: cLoading } = useCategories();
  const { products, loading: pLoading } = useProducts();

  const category = id ? categories.find(c => c.id === id) : null;
  const filteredProducts = id ? products.filter(p => p.categoryId === id) : products;

  return (
    <div className="pb-nav lg:pb-8 max-w-screen-xl mx-auto">
      {category ? (
        <div className="relative h-32 overflow-hidden">
          <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 flex items-end p-4">
            <div><h1 className="text-xl font-bold text-white">{category.name}</h1><p className="text-white/70 text-sm">{filteredProducts.length} products</p></div>
          </div>
        </div>
      ) : (
        <div className="px-4 pt-5">
          <h1 className="font-bold text-xl mb-4">All Categories</h1>
          {cLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton aspect-video rounded-2xl" />)}</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
              {categories.map(cat => (
                <Link key={cat.id} to={`/category/${cat.id}`} className="relative rounded-2xl overflow-hidden aspect-video card-hover">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                    <div><p className="text-white font-bold text-sm">{cat.name}</p></div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="px-4 mt-4">
        {category && <p className="text-sm text-muted-foreground mb-3 font-medium">{filteredProducts.length} products in {category.name}</p>}
        {pLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">{Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProducts.map(product => <ProductCard key={product.id} product={product} />)}
            {filteredProducts.length === 0 && (
              <div className="col-span-2 md:col-span-4 text-center py-16">
                <Package size={40} className="mx-auto mb-3 text-muted-foreground opacity-30" />
                <h3 className="font-bold mb-1">No products yet</h3>
                <p className="text-muted-foreground text-sm">Check back soon!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
