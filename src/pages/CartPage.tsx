import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, Tag, ArrowRight, Check, Gift, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/CartContext';
import { useProducts, useSettings, validateCoupon } from '@/hooks/useFirestoreData';
import { useAuth } from '@/contexts/AuthContext';
import ProductCard from '@/components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, itemCount } = useCart();
  const { user } = useAuth();
  const { settings } = useSettings();
  const { products } = useProducts();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [appliedCouponData, setAppliedCouponData] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [discountFlat, setDiscountFlat] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set(items.map(i => `${i.productId}-${i.selectedSize}-${i.selectedColor}`)));

  const toggleSelect = (key: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === items.length) setSelected(new Set());
    else setSelected(new Set(items.map(i => `${i.productId}-${i.selectedSize}-${i.selectedColor}`)));
  };

  const selectedItems = items.filter(i => selected.has(`${i.productId}-${i.selectedSize}-${i.selectedColor}`));
  const total = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setCouponError('');
    setCouponLoading(true);
    try {
      const found = await validateCoupon(coupon.trim(), user?.uid);
      if (found) {
        setAppliedCoupon(found.code);
        setAppliedCouponData(found);
        setDiscount(found.discountPercent || 0);
        setDiscountFlat(found.maxDiscount || 0);
      } else {
        setCouponError('Invalid coupon code');
      }
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon('');
    setAppliedCouponData(null);
    setDiscount(0);
    setDiscountFlat(0);
    setCoupon('');
    setCouponError('');
  };

  const DELIVERY_CHARGE = settings.deliveryCharge || 60;

  let discountAmount = 0;
  if (discount > 0) discountAmount = (total * discount) / 100;
  else if (discountFlat > 0) discountAmount = Math.min(discountFlat, total);

  const finalTotal = total - discountAmount + DELIVERY_CHARGE;

  // Product suggestions - exclude items already in cart
  const cartProductIds = new Set(items.map(i => i.productId));
  const suggestedProducts = products.filter(p => !cartProductIds.has(p.id)).slice(0, 8);

  if (items.length === 0) {
    return (
      <div className="max-w-screen-lg mx-auto px-4 py-5 pb-nav lg:pb-8">
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 px-4">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
            <ShoppingBag size={40} className="text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold">আপনার কার্ট খালি</h2>
          <p className="text-muted-foreground text-sm text-center">শপিং শুরু করতে পণ্য যোগ করুন</p>
          <Button onClick={() => navigate('/')} className="mt-2">Start Shopping</Button>
        </div>
        {suggestedProducts.length > 0 && (
          <section className="mt-6">
            <h2 className="font-bold text-base mb-3">Recommended for You</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {suggestedProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-5 pb-36 lg:pb-8">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-bold text-xl">Cart ({itemCount} items)</h1>
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input type="checkbox" checked={selected.size === items.length && items.length > 0} onChange={toggleAll} className="rounded" />
          Select All
        </label>
      </div>

      <div className="lg:grid lg:grid-cols-3 lg:gap-6">
        <div className="lg:col-span-2 space-y-3">
          <AnimatePresence>
            {items.map(item => {
              const key = `${item.productId}-${item.selectedSize}-${item.selectedColor}`;
              return (
                <motion.div key={key} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }} className="flex gap-3 bg-card border border-border rounded-xl p-3">
                  <div className="flex items-center pr-1">
                    <input type="checkbox" checked={selected.has(key)} onChange={() => toggleSelect(key)} className="rounded" />
                  </div>
                  <Link to={`/product/${item.productId}`} className="shrink-0">
                    <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover bg-muted" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.productId}`} className="text-sm font-medium line-clamp-2 hover:text-primary transition-colors">{item.name}</Link>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {item.selectedColor && <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{item.selectedColor}</span>}
                      {item.selectedSize && <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Size: {item.selectedSize}</span>}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div>
                        <span className="font-bold text-sm">৳{(item.price * item.quantity).toFixed(0)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 border border-border rounded-lg">
                          <button onClick={() => updateQuantity(item.productId, item.quantity - 1, item.selectedSize, item.selectedColor)} className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded-lg"><Minus size={12} /></button>
                          <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.productId, item.quantity + 1, item.selectedSize, item.selectedColor)} className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded-lg"><Plus size={12} /></button>
                        </div>
                        <button onClick={() => removeFromCart(item.productId, item.selectedSize, item.selectedColor)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="mt-5 lg:mt-0 space-y-3">
          {/* Coupon Section — defined inline in JSX (not as a nested component) to preserve input focus */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-primary" />
                <h3 className="font-semibold text-sm">Apply Coupon</h3>
              </div>
              <button onClick={() => navigate('/profile?tab=rewards')} className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
                <Gift size={12} /> Get Coupon
              </button>
            </div>
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <span className="text-green-600 text-sm font-semibold flex items-center gap-1">
                  <Check size={14} /> {appliedCoupon} applied (-৳{discountAmount.toFixed(0)})
                </span>
                <button onClick={removeCoupon} className="text-muted-foreground hover:text-destructive">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={coupon}
                    onChange={e => setCoupon(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                    className="h-9 text-sm flex-1"
                  />
                  <Button size="sm" variant="outline" onClick={applyCoupon} disabled={couponLoading} className="h-9">
                    {couponLoading ? '...' : 'Apply'}
                  </Button>
                </div>
                {couponError && <p className="text-destructive text-xs mt-2">{couponError}</p>}
              </>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-bold mb-4">Order Summary</h3>
            <div className="space-y-2.5 text-sm">
              {selectedItems.map((item, i) => (
                <div key={i} className="flex justify-between items-start">
                  <span className="text-muted-foreground flex-1 pr-2 truncate text-xs">{item.name} × {item.quantity}</span>
                  <span className="font-medium text-xs shrink-0">৳{(item.price * item.quantity).toFixed(0)}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2.5 space-y-1.5">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">৳{total.toFixed(0)}</span></div>
                {discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-৳{discountAmount.toFixed(0)}</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className="font-medium">৳{DELIVERY_CHARGE}</span></div>
                <div className="border-t border-border pt-2 flex justify-between text-base"><span className="font-bold">Total</span><span className="font-bold text-primary">৳{finalTotal.toFixed(0)}</span></div>
              </div>
            </div>
            <Button
              className="w-full mt-4 h-12 font-semibold hidden lg:flex items-center justify-center gap-2"
              onClick={() => navigate('/checkout', { state: { selectedItems, discount, couponCode: appliedCoupon, couponData: appliedCouponData } })}
              disabled={selectedItems.length === 0}
            >
              Checkout <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Product Suggestions */}
      {suggestedProducts.length > 0 && (
        <section className="mt-8">
          <h2 className="font-bold text-base mb-3">Recommended for You</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {suggestedProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Mobile sticky checkout button */}
      <div className="fixed bottom-16 left-0 right-0 p-3 bg-card/95 backdrop-blur border-t border-border lg:hidden z-40">
        <Button
          className="w-full h-12 font-semibold flex items-center justify-center gap-2"
          onClick={() => navigate('/checkout', { state: { selectedItems, discount, couponCode: appliedCoupon, couponData: appliedCouponData } })}
          disabled={selectedItems.length === 0}
        >
          Checkout ({selectedItems.length}) &bull; ৳{finalTotal.toFixed(0)} <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}
