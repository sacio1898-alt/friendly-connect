import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Product } from '@/hooks/useFirestoreData';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <motion.div whileHover={{ y: -2 }} className="group h-full">
      <Link to={`/product/${product.id}`} className="flex flex-col h-full bg-card rounded-xl overflow-hidden border border-border/60 card-hover">
        <div className="relative aspect-square overflow-hidden">
          <img src={product.images?.[0] || '/placeholder.svg'} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" decoding="async" width="300" height="300" />
          {discount && discount > 0 && (
            <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[11px] font-bold px-1.5 py-0.5 rounded-md">-{discount}%</span>
          )}
          {product.stock < 10 && product.stock > 0 && (
            <span className="absolute bottom-2 left-2 bg-accent text-accent-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded-md">Only {product.stock} left</span>
          )}
        </div>
        <div className="p-3 flex flex-col flex-1">
          <p className="text-xs text-muted-foreground mb-0.5">{product.brand}</p>
          <h3 className="text-sm font-medium truncate mb-2">{product.name}</h3>
          <div className="flex items-center gap-1 mb-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} size={10} className={s <= Math.floor(product.rating || 0) ? 'fill-accent text-accent' : 'text-muted'} />
              ))}
            </div>
            <span className="text-xs font-medium">{product.rating || 0}</span>
            <span className="text-xs text-muted-foreground">({product.reviewCount || 0})</span>
          </div>
          <div className="flex items-center mt-auto">
            <span className="font-bold text-sm">৳{product.price?.toFixed(0)}</span>
            {product.originalPrice && <span className="text-xs text-muted-foreground line-through ml-1">৳{product.originalPrice?.toFixed(0)}</span>}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
