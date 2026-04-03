import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProducts, useSettings } from '@/hooks/useFirestoreData';
import { useCart } from '@/contexts/CartContext';
import { Star, Minus, Plus, ChevronLeft, ChevronRight, Truck, Shield, RotateCcw, ShoppingCart, ThumbsUp, CheckCircle, AlertTriangle, Banknote, Smartphone, ExternalLink, Monitor, Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import ProductCard from '@/components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import SocialShareButtons from '@/components/SocialShareButtons';
import SEOHead from '@/components/SEOHead';

const staticReviews = [
  { id: 'r1', userName: 'Rahim A.', rating: 5, comment: 'অসাধারণ পণ্য! খুবই সন্তুষ্ট।', date: '2025-01-15', helpful: 12 },
  { id: 'r2', userName: 'Fatima K.', rating: 4, comment: 'ভালো মানের, দামের তুলনায় অনেক ভালো।', date: '2025-01-10', helpful: 8 },
  { id: 'r3', userName: 'Kamal H.', rating: 5, comment: 'চমৎকার! আবারও কিনবো।', date: '2024-12-28', helpful: 15 },
  { id: 'r4', userName: 'Sumaiya R.', rating: 3, comment: 'পণ্য ভালো, তবে ডেলিভারি একটু দেরিতে এসেছে।', date: '2024-12-20', helpful: 3 },
];

function ShareButtons({ product }: { product: any }) {
  const url = window.location.href;
  const text = `${product.name} - ৳${product.price}`;
  return (
    <div className="mt-4">
      <span className="text-xs font-semibold text-muted-foreground mb-2 block">Share:</span>
      <SocialShareButtons text={text} url={url} size="sm" />
    </div>
  );
}

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products } = useProducts();
  const { settings } = useSettings();
  const product = products.find(p => p.id === id);
  const related = product ? products.filter(p => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4) : [];
  const otherCategoryProducts = product ? products.filter(p => p.categoryId !== product.categoryId).slice(0, 8) : [];
  const { addToCart } = useCart();
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [helpfulCounts, setHelpfulCounts] = useState<Record<string, number>>({});

  // Auto-slide images
  useEffect(() => {
    if (!product || (product.images?.length || 0) <= 1) return;
    const interval = setInterval(() => {
      setCurrentImage(prev => (prev + 1) % product.images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [product]);

  // Initialize helpful counts
  useEffect(() => {
    const counts: Record<string, number> = {};
    staticReviews.forEach(r => { counts[r.id] = r.helpful; });
    setHelpfulCounts(counts);
  }, []);

  if (!product) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-muted-foreground">পণ্য পাওয়া যায়নি</p>
    </div>
  );

  const isDigital = !!product.isDigital;
  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : null;

  const productSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "name": product.name,
        "image": product.images || [],
        "description": product.description,
        "sku": product.id,
        "brand": { "@type": "Brand", "name": product.brand || settings.appName },
        "category": product.category || '',
        "offers": {
          "@type": "Offer",
          "url": `https://zupramart.netlify.app/product/${product.id}`,
          "priceCurrency": "BDT",
          "price": product.price,
          "priceValidUntil": new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "seller": { "@type": "Organization", "name": settings.appName || "ZupraMart" },
          "itemCondition": "https://schema.org/NewCondition",
        },
        ...(product.reviewCount > 0 ? {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": product.rating,
            "reviewCount": product.reviewCount,
            "bestRating": 5,
            "worstRating": 1,
          }
        } : {}),
        "review": staticReviews.map(r => ({
          "@type": "Review",
          "author": { "@type": "Person", "name": r.userName },
          "datePublished": r.date,
          "reviewRating": { "@type": "Rating", "ratingValue": r.rating, "bestRating": 5 },
          "reviewBody": r.comment,
        })),
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://zupramart.netlify.app/" },
          ...(product.category ? [{ "@type": "ListItem", "position": 2, "name": product.category, "item": `https://zupramart.netlify.app/category/${product.categoryId || ''}` }] : []),
          { "@type": "ListItem", "position": product.category ? 3 : 2, "name": product.name },
        ],
      },
    ],
  };

  const handleAddToCart = async () => {
    await addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.images?.[0] || '',
      stock: isDigital ? 999 : product.stock,
      selectedSize: selectedSize || product.sizes?.[0],
      selectedColor: selectedColor || product.colors?.[0],
      quantity: qty,
      isDigital,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    const item = {
      productId: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.images?.[0] || '',
      stock: isDigital ? 999 : product.stock,
      selectedSize: selectedSize || product.sizes?.[0],
      selectedColor: selectedColor || product.colors?.[0],
      quantity: qty,
      isDigital,
    };
    navigate('/checkout', { state: { selectedItems: [item], isDigitalOrder: isDigital } });
  };

  const handleHelpful = (reviewId: string) => {
    setHelpfulCounts(prev => ({ ...prev, [reviewId]: (prev[reviewId] || 0) + 1 }));
  };

  // Parse description as bullet points (each line = one point)
  const descriptionPoints = product.description
    ? product.description.split('\n').filter((line: string) => line.trim())
    : [];

  const whatsappNum = settings.whatsapp?.replace(/[^0-9]/g, '') || '';
  const phoneNum = settings.phone || '';

  return (
    <div className="pb-36 lg:pb-8">
      <SEOHead
        title={`${product.name} — ৳${product.price} | ${settings.appName}`}
        description={product.description?.slice(0, 150) || `${product.name} কিনুন ${settings.appName} থেকে মাত্র ৳${product.price} টাকায়।`}
        url={`https://zupramart.netlify.app/product/${product.id}`}
        image={product.images?.[0]}
        type="product"
        schema={productSchema}
      />
      <div className="max-w-screen-xl mx-auto lg:px-6 lg:py-6">
        <div className="lg:grid lg:grid-cols-2 lg:gap-10">
          {/* Image Gallery */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <div className="relative overflow-hidden bg-muted lg:rounded-2xl">
              <AnimatePresence mode="wait">
                <motion.img key={currentImage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} src={product.images?.[currentImage] || '/placeholder.svg'} alt={product.name} className="w-full aspect-square object-cover" />
              </AnimatePresence>
              {(product.images?.length || 0) > 1 && (<>
                <button onClick={() => setCurrentImage(prev => (prev - 1 + product.images.length) % product.images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-card/80 backdrop-blur flex items-center justify-center shadow-md"><ChevronLeft size={18} /></button>
                <button onClick={() => setCurrentImage(prev => (prev + 1) % product.images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-card/80 backdrop-blur flex items-center justify-center shadow-md"><ChevronRight size={18} /></button>
                {/* Dot indicators */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {product.images.map((_: string, i: number) => (
                    <button key={i} onClick={() => setCurrentImage(i)} className={`w-2 h-2 rounded-full transition-all ${i === currentImage ? 'bg-primary w-4' : 'bg-card/60'}`} />
                  ))}
                </div>
              </>)}
              {discount && discount > 0 && <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-sm font-bold px-2 py-1 rounded-lg">-{discount}%</span>}
              {isDigital && <span className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1"><Monitor size={12} /> Digital</span>}
            </div>
            {(product.images?.length || 0) > 1 && (
              <div className="flex gap-2 p-4 lg:p-0 lg:mt-3 overflow-x-auto scrollbar-hide">
                {product.images.map((img: string, i: number) => (
                  <button key={i} onClick={() => setCurrentImage(i)} className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === currentImage ? 'border-primary' : 'border-transparent'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="px-4 py-4 lg:px-0">
            <div>
              <div className="flex items-center gap-2">
                <Link to={`/category/${product.categoryId}`} className="text-primary text-xs font-medium">{product.category}</Link>
                {isDigital && <Badge variant="secondary" className="text-[10px] gap-1"><Monitor size={10} /> Digital Product</Badge>}
              </div>
              <h1 className="text-xl font-bold mt-1 leading-tight">{product.name}</h1>
            </div>

            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1">{[1,2,3,4,5].map(s => <Star key={s} size={14} className={s <= Math.floor(product.rating || 0) ? 'fill-accent text-accent' : 'text-muted'} />)}</div>
              <span className="text-sm font-semibold">{product.rating || 0}</span>
              <span className="text-sm text-muted-foreground">({product.reviewCount || 0} reviews)</span>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <span className="text-3xl font-bold">৳{product.price?.toFixed(0)}</span>
              {product.originalPrice && <span className="text-lg text-muted-foreground line-through">৳{product.originalPrice?.toFixed(0)}</span>}
              {discount && discount > 0 && <Badge className="bg-destructive/10 text-destructive border-destructive/20">Save {discount}%</Badge>}
            </div>

            {!isDigital && (
              <div className="mt-3">
                {product.stock > 10 ? <span className="text-green-600 text-sm font-medium flex items-center gap-1"><CheckCircle size={14} /> In Stock ({product.stock})</span>
                  : product.stock > 0 ? <span className="text-amber-500 text-sm font-semibold flex items-center gap-1"><AlertTriangle size={14} /> Only {product.stock} left!</span>
                  : <span className="text-destructive text-sm font-semibold">Out of Stock</span>}
              </div>
            )}

            {isDigital && (
              <div className="mt-3">
                <span className="text-green-600 text-sm font-medium flex items-center gap-1"><CheckCircle size={14} /> Instant Delivery After Payment</span>
              </div>
            )}

            {isDigital && product.demoUrl && (
              <a href={product.demoUrl} target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center justify-center gap-2 w-full h-11 rounded-xl border-2 border-primary text-primary font-semibold text-sm hover:bg-primary/5 transition-colors">
                <ExternalLink size={16} /> Live Demo দেখুন
              </a>
            )}

            {/* Direct Contact Buttons */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              {phoneNum && (
                <a href={`tel:${phoneNum}`} className="flex items-center justify-center gap-1.5 h-10 rounded-xl bg-green-500/10 text-green-600 text-xs font-semibold hover:bg-green-500/20 transition-colors border border-green-500/20">
                  <Phone size={14} /> কল করুন
                </a>
              )}
              <a href={`https://m.me/${settings.email?.split('@')[0] || ''}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 h-10 rounded-xl bg-blue-500/10 text-blue-600 text-xs font-semibold hover:bg-blue-500/20 transition-colors border border-blue-500/20">
                <MessageCircle size={14} /> Facebook
              </a>
              {whatsappNum && (
                <a href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent(`${product.name} সম্পর্কে জানতে চাই।`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 h-10 rounded-xl bg-green-600/10 text-green-700 text-xs font-semibold hover:bg-green-600/20 transition-colors border border-green-600/20">
                  <MessageCircle size={14} /> WhatsApp
                </a>
              )}
            </div>

            {/* Social Share */}
            <ShareButtons product={product} />

            {!isDigital && product.colors && product.colors.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold mb-2">Color: <span className="font-normal text-muted-foreground">{selectedColor || product.colors[0]}</span></p>
                <div className="flex gap-2 flex-wrap">{product.colors.map((color: string) => (
                  <button key={color} onClick={() => setSelectedColor(color)} className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${(selectedColor || product.colors![0]) === color ? 'border-primary bg-primary/10 text-primary' : 'border-border'}`}>{color}</button>
                ))}</div>
              </div>
            )}

            {!isDigital && product.sizes && product.sizes.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold mb-2">Size: <span className="font-normal text-muted-foreground">{selectedSize || product.sizes[0]}</span></p>
                <div className="flex gap-2 flex-wrap">{product.sizes.map((size: string) => (
                  <button key={size} onClick={() => setSelectedSize(size)} className={`w-11 h-11 rounded-xl border text-sm font-medium transition-all ${(selectedSize || product.sizes![0]) === size ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}>{size}</button>
                ))}</div>
              </div>
            )}

            {!isDigital && (
              <div className="mt-5 flex items-center gap-4">
                <p className="text-sm font-semibold">Quantity:</p>
                <div className="flex items-center gap-3 border border-border rounded-xl p-1">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted"><Minus size={14} /></button>
                  <span className="text-sm font-bold w-6 text-center">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted"><Plus size={14} /></button>
                </div>
              </div>
            )}

            {/* Desktop action buttons */}
            <div className="hidden lg:flex gap-3 mt-6">
              {isDigital ? (
                <Button className="flex-1 h-12 font-semibold" onClick={handleBuyNow}>Buy Now — ৳{product.price?.toFixed(0)}</Button>
              ) : (
                <>
                  <Button variant="outline" className="flex-1 h-12 font-semibold gap-2" onClick={handleAddToCart} disabled={product.stock === 0}>
                    {addedToCart ? <><CheckCircle size={16} /> Added to Cart!</> : <><ShoppingCart size={16} /> Add to Cart</>}
                  </Button>
                  <Button className="flex-1 h-12 font-semibold" onClick={handleBuyNow} disabled={product.stock === 0}>Buy Now</Button>
                </>
              )}
            </div>

            {/* Trust Badges */}
            <div className="mt-6 bg-muted/40 rounded-2xl p-4 border border-border">
              <h3 className="font-bold text-sm mb-3 text-foreground">{isDigital ? 'ডিজিটাল প্রোডাক্ট সুবিধা' : 'আমাদের সুবিধাসমূহ'}</h3>
              <div className="grid grid-cols-2 gap-2.5">
                {(isDigital ? [
                  { icon: Smartphone, label: 'মোবাইল ব্যাংকিং', sub: 'bKash / Nagad', color: 'text-pink-500 bg-pink-500/10' },
                  { icon: CheckCircle, label: 'Instant Delivery', sub: 'পেমেন্টের পর ডাউনলোড', color: 'text-green-600 bg-green-500/10' },
                  { icon: Shield, label: '100% অরিজিনাল', sub: 'গ্যারান্টিযুক্ত ফাইল', color: 'text-amber-500 bg-amber-500/10' },
                  { icon: Monitor, label: 'লাইভ ডেমো', sub: 'কেনার আগে দেখুন', color: 'text-blue-500 bg-blue-500/10' },
                ] : [
                  { icon: Banknote, label: 'ক্যাশ অন ডেলিভারি', sub: 'পণ্য পেয়ে পেমেন্ট', color: 'text-green-600 bg-green-500/10' },
                  { icon: Smartphone, label: 'মোবাইল ব্যাংকিং', sub: 'bKash / Nagad', color: 'text-pink-500 bg-pink-500/10' },
                  { icon: RotateCcw, label: '7 দিনে পণ্য ফেরত', sub: 'সহজ রিটার্ন পলিসি', color: 'text-blue-500 bg-blue-500/10' },
                  { icon: Shield, label: '100% টাকা ফেরত', sub: 'মানি ব্যাক গ্যারান্টি', color: 'text-amber-500 bg-amber-500/10' },
                  { icon: CheckCircle, label: '99% অরিজিনাল', sub: 'প্রোডাক্ট গ্যারান্টি', color: 'text-emerald-600 bg-emerald-500/10' },
                  { icon: Truck, label: 'দ্রুত ডেলিভারি', sub: 'সারাদেশে পৌঁছে দেই', color: 'text-purple-500 bg-purple-500/10' },
                ]).map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center gap-2.5 p-2.5 bg-card rounded-xl border border-border/50">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                        <ItemIcon size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold leading-tight">{item.label}</p>
                        <p className="text-[10px] text-muted-foreground">{item.sub}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description as bullet points */}
            <Accordion type="multiple" className="mt-5" defaultValue={['description']}>
              <AccordionItem value="description">
                <AccordionTrigger className="text-sm font-semibold">Description</AccordionTrigger>
                <AccordionContent>
                  {descriptionPoints.length > 0 ? (
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {descriptionPoints.map((point: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          <span className="leading-relaxed">{point.replace(/^[-•*]\s*/, '')}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Reviews */}
            <div className="mt-6">
              <h2 className="font-bold text-base mb-4">Customer Reviews</h2>
              <div className="space-y-4">
                {staticReviews.map(review => (
                  <div key={review.id} className="border-b border-border/50 pb-4 last:border-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{review.userName[0]}</div>
                      <div>
                        <p className="text-sm font-semibold">{review.userName}</p>
                        <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} size={10} className={s <= review.rating ? 'fill-accent text-accent' : 'text-muted'} />)}</div>
                      </div>
                      <span className="ml-auto text-xs text-muted-foreground">{review.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                    <button onClick={() => handleHelpful(review.id)} className="text-xs text-muted-foreground mt-2 hover:text-primary flex items-center gap-1">
                      <ThumbsUp size={12} /> Helpful ({helpfulCounts[review.id] || review.helpful})
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {related.length > 0 && (
          <section className="mt-4 px-4 lg:px-0">
            <h2 className="font-bold text-base mb-4">Similar Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">{related.map(p => <ProductCard key={p.id} product={p} />)}</div>
          </section>
        )}

        {otherCategoryProducts.length > 0 && (
          <section className="mt-6 px-4 lg:px-0">
            <h2 className="font-bold text-base mb-4">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">{otherCategoryProducts.map(p => <ProductCard key={p.id} product={p} />)}</div>
          </section>
        )}
      </div>
      {/* Spacer for mobile sticky bar + bottom nav */}
      <div className="h-28 lg:hidden" />

      {/* Mobile sticky action bar */}
      <div className="lg:hidden fixed bottom-14 left-0 right-0 p-3 bg-card border-t border-border z-40">
        <div className="flex gap-3 max-w-screen-xl mx-auto">
          {isDigital ? (
            <Button className="flex-1 h-11 font-semibold text-sm" onClick={handleBuyNow}>Buy Now — ৳{product.price?.toFixed(0)}</Button>
          ) : (
            <>
              <Button variant="outline" className="flex-1 h-11 font-semibold text-sm gap-2" onClick={handleAddToCart} disabled={product.stock === 0}>
                {addedToCart ? <><CheckCircle size={14} /> Added!</> : <><ShoppingCart size={14} /> Add to Cart</>}
              </Button>
              <Button className="flex-1 h-11 font-semibold text-sm" onClick={handleBuyNow} disabled={product.stock === 0}>Buy Now</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
