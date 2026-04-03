import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, X, LogOut, User, Package, Star, SlidersHorizontal, Home, LayoutGrid, Headphones, ChevronRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts, useSettings } from '@/hooks/useFirestoreData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { motion, AnimatePresence } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: 'popular',    label: 'Popularity' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating',     label: 'Rating' },
  { value: 'newest',     label: 'Newest' },
];

// ─────────────────────────────────────────────────────────────────────────────
// SearchBar — defined OUTSIDE Header so it never remounts on parent re-render.
//
// ROOT CAUSE FIX: A component defined *inside* another component gets a brand-
// new function reference on every render. React sees it as a completely
// different component type and unmounts + remounts it, which steals focus from
// the <input> after every keystroke. Moving it outside solves this permanently.
// ─────────────────────────────────────────────────────────────────────────────

interface SearchBarProps {
  isMobile?: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  isFocused: boolean;
  setIsFocused: (v: boolean) => void;
  displayedPlaceholder: string;
  isTyping: boolean;
  suggestions: { id: string; name: string; image: string }[];
  showSuggestions: boolean;
  setShowSuggestions: (v: boolean) => void;
  onSearch: (e?: React.FormEvent) => void;
  onSuggestionClick: (id: string) => void;
  onFilterOpen: () => void;
}

function SearchBar({
  isMobile = false,
  containerRef,
  searchQuery,
  setSearchQuery,
  isFocused,
  setIsFocused,
  displayedPlaceholder,
  isTyping,
  suggestions,
  showSuggestions,
  setShowSuggestions,
  onSearch,
  onSuggestionClick,
  onFilterOpen,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div ref={containerRef} className="relative flex gap-2">
      <form onSubmit={onSearch} className="relative flex-1">
        {/*
          Outer wrapper acts as the visual "input box".
          Border: dotted + subtle, thickens & turns primary on focus.
          Layout: input text on the left, search button flush on the right (Daraz pattern).
        */}
        <div
          className={[
            'flex items-center overflow-hidden transition-all duration-200',
            'rounded-xl border-2 border-dotted bg-background',
            isMobile ? 'h-10' : 'h-11',
            isFocused
              ? 'border-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]'
              : 'border-border/70 hover:border-primary/50',
          ].join(' ')}
        >
          {/* Search icon inside box */}
          <Search
            size={15}
            strokeWidth={2.2}
            className={`ml-3 shrink-0 transition-colors duration-200 ${
              isFocused ? 'text-primary' : 'text-muted-foreground'
            }`}
          />

          {/* Text input */}
          <input
            ref={inputRef}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            onBlur={() => setIsFocused(false)}
            placeholder={displayedPlaceholder + (isTyping ? '▌' : '')}
            className="flex-1 h-full bg-transparent outline-none px-2.5 text-sm placeholder:text-muted-foreground/70 truncate"
          />

          {/* Clear button — onMouseDown prevents input losing focus */}
          {searchQuery && (
            <button
              type="button"
              onMouseDown={e => {
                e.preventDefault(); // keep focus on input
                setSearchQuery('');
                inputRef.current?.focus();
              }}
              className="p-1.5 mr-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={13} />
            </button>
          )}

          {/* Search submit button — flush right, rounded only on right side */}
          <button
            type="submit"
            className={[
              'shrink-0 flex items-center justify-center gap-1.5',
              'bg-primary hover:bg-primary/90 active:scale-95',
              'text-primary-foreground font-semibold transition-all duration-150',
              'rounded-r-[10px]',
              isMobile
                ? 'h-full px-3.5 text-xs'
                : 'h-full px-5 text-sm',
            ].join(' ')}
          >
            <Search size={isMobile ? 13 : 14} strokeWidth={2.5} />
            <span className={isMobile ? 'hidden xs:inline' : ''}>Search</span>
          </button>
        </div>

        {/* Suggestions dropdown — onMouseDown prevents blur before navigation */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
            {suggestions.map(s => (
              <button
                key={s.id}
                onMouseDown={e => {
                  e.preventDefault();
                  onSuggestionClick(s.id);
                }}
                className="flex items-center gap-3 w-full px-3 py-2 hover:bg-muted transition-colors text-left"
              >
                {s.image && (
                  <img src={s.image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                )}
                <span className="text-sm truncate">{s.name}</span>
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Filter button */}
      <button
        type="button"
        onClick={onFilterOpen}
        className={[
          'rounded-xl border-2 border-dotted border-border/70 bg-background',
          'flex items-center justify-center shrink-0',
          'hover:border-primary/50 hover:bg-muted active:scale-95 transition-all duration-150',
          isMobile ? 'h-10 w-10' : 'h-11 w-11',
        ].join(' ')}
      >
        <SlidersHorizontal size={14} className="text-muted-foreground" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────────────────────

export default function Header() {
  const { itemCount } = useCart();
  const { user, userData, logout } = useAuth();
  const { settings } = useSettings();
  const { products } = useProducts();
  const navigate = useNavigate();

  // UI state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filterOpen, setFilterOpen]         = useState(false);

  // Search state
  const [searchQuery, setSearchQuery]         = useState('');
  const [suggestions, setSuggestions]         = useState<{ id: string; name: string; image: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused]             = useState(false);

  // Typewriter placeholder state
  const [placeholderIndex, setPlaceholderIndex]           = useState(0);
  const [displayedPlaceholder, setDisplayedPlaceholder]   = useState('');
  const [isTyping, setIsTyping]                           = useState(false);

  // Filter state
  const [sort, setSort]             = useState('popular');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [minRating, setMinRating]   = useState(0);

  // Refs for outside-click detection
  const searchRef       = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  const isAdmin = userData?.role === 'admin';

  // ── Typewriter: cycle target placeholder ──────────────────────────────────
  const targetPlaceholder = products.length > 0
    ? (products[placeholderIndex % products.length]?.name?.slice(0, 30) ?? '')
    : '';

  useEffect(() => {
    if (products.length === 0) return;
    const interval = setInterval(() => {
      setPlaceholderIndex(prev => (prev + 1) % products.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [products.length]);

  useEffect(() => {
    if (!targetPlaceholder) return;
    setIsTyping(true);
    setDisplayedPlaceholder('');
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayedPlaceholder(targetPlaceholder.slice(0, i));
      if (i >= targetPlaceholder.length) {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, 55);
    return () => clearInterval(timer);
  }, [targetPlaceholder]);

  // ── Suggestions ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matches = products
        .filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q),
        )
        .slice(0, 6)
        .map(p => ({ id: p.id, name: p.name, image: p.images?.[0] || '' }));
      setSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, products]);

  // ── Close suggestions on outside click ────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const outsideDesktop = searchRef.current && !searchRef.current.contains(e.target as Node);
      const outsideMobile  = mobileSearchRef.current && !mobileSearchRef.current.contains(e.target as Node);
      if (outsideDesktop && outsideMobile) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = searchQuery.trim() || products[placeholderIndex % products.length]?.name || '';
    if (q) {
      navigate(
        `/search?q=${encodeURIComponent(q)}&sort=${sort}&minPrice=${priceRange[0]}&maxPrice=${priceRange[1]}&minRating=${minRating}`,
      );
      setShowSuggestions(false);
      setSearchQuery('');
    }
  };

  const handleSuggestionClick = (id: string) => {
    navigate(`/product/${id}`);
    setShowSuggestions(false);
    setSearchQuery('');
  };

  const applyFilters = () => {
    const currentQ = searchQuery.trim() || '';
    navigate(
      `/search?q=${encodeURIComponent(currentQ)}&sort=${sort}&minPrice=${priceRange[0]}&maxPrice=${priceRange[1]}&minRating=${minRating}`,
    );
    setFilterOpen(false);
  };

  // Shared props passed to both SearchBar instances
  const searchBarProps = {
    searchQuery,
    setSearchQuery,
    isFocused,
    setIsFocused,
    displayedPlaceholder,
    isTyping,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    onSearch: handleSearch,
    onSuggestionClick: handleSuggestionClick,
    onFilterOpen: () => setFilterOpen(true),
  };

  // Admin users don't see the public header
  if (isAdmin) return null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">

        {/* ── Mobile top row ──────────────────────────────────────────────── */}
        <div className="lg:hidden flex items-center gap-3 px-4 h-14">
          {/* Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col gap-[4px] w-9 h-9 items-center justify-center rounded-lg hover:bg-muted transition-colors"
            aria-label="Menu"
          >
            <span className="block h-[2px] bg-foreground w-[18px] rounded-full transition-all" />
            <span className="block h-[2px] bg-foreground w-[14px] rounded-full transition-all ml-[-2px]" />
            <span className="block h-[2px] bg-foreground w-[18px] rounded-full transition-all" />
          </button>

          <Link to="/" className="flex-1 flex items-center">
            <img
              src="/icon.png"
              alt={settings.appName}
              className="h-8 max-w-[120px] object-contain"
              onError={e => { (e.target as HTMLImageElement).src = '/logo.jpg'; }}
            />
          </Link>

          {user && userData && (
            <button
              onClick={() => navigate('/profile?tab=rewards')}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-accent/10 hover:bg-accent/20 transition-colors"
              title="Loyalty Points"
            >
              <Star size={12} className="text-accent fill-accent" />
              <span className="text-xs font-bold text-accent">{userData.loyaltyPoints || 0}</span>
            </button>
          )}

          <Link to="/cart" className="relative p-2">
            <ShoppingCart size={22} className="text-foreground" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[10px] font-bold min-w-[18px] min-h-[18px] flex items-center justify-center rounded-full">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>
        </div>

        {/* ── Mobile search bar row ────────────────────────────────────────── */}
        <div className="lg:hidden px-4 pb-2.5">
          <SearchBar isMobile containerRef={mobileSearchRef} {...searchBarProps} />
        </div>

        {/* ── Desktop header ───────────────────────────────────────────────── */}
        <div className="hidden lg:flex items-center gap-6 px-6 h-16 max-w-screen-xl mx-auto">
          <Link to="/" className="flex items-center shrink-0">
            <img
              src="/icon.png"
              alt={settings.appName}
              className="h-8 max-w-[160px] object-contain"
              onError={e => { (e.target as HTMLImageElement).src = '/logo.jpg'; }}
            />
          </Link>

          <div className="flex-1 max-w-xl">
            <SearchBar containerRef={searchRef} {...searchBarProps} />
          </div>

          <nav className="flex items-center gap-1">
            {[
              { label: 'Home', path: '/' },
              { label: 'Categories', path: '/category' },
              { label: 'My Orders', path: '/orders' },
              { label: 'Profile', path: '/profile' },
              { label: 'Support', path: '/support' },
            ].map(item => (
              <Link
                key={item.path}
                to={item.path}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {user && userData && (
              <button
                onClick={() => navigate('/profile?tab=rewards')}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-accent/10 hover:bg-accent/20 transition-colors"
                title="Loyalty Points"
              >
                <Star size={12} className="text-accent fill-accent" />
                <span className="text-xs font-bold text-accent">{userData.loyaltyPoints || 0}</span>
              </button>
            )}

            <Link to="/cart" className="relative p-2 hover:bg-muted rounded-lg transition-colors">
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[10px] font-bold min-w-[18px] min-h-[18px] flex items-center justify-center rounded-full">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 hover:bg-muted rounded-lg p-1.5 transition-colors">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.photoURL || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {(user.displayName || user.email || 'U')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User size={14} className="mr-2" /> My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/orders')}>
                    <Package size={14} className="mr-2" /> My Orders
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut size={14} className="mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" onClick={() => navigate('/auth')}>Login</Button>
            )}
          </div>
        </div>
      </header>

      {/* ── Filter Sheet ────────────────────────────────────────────────────── */}
      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle className="text-center">ফিল্টার ও সর্ট</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto max-h-[60vh] pt-4 space-y-5 pb-8">

            {/* Sort */}
            <div className="bg-muted/30 rounded-2xl p-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs">↕</span>
                সর্ট করুন
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {SORT_OPTIONS.map(o => (
                  <button
                    key={o.value}
                    onClick={() => setSort(o.value)}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                      sort === o.value
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                        : 'border-border bg-card hover:bg-muted'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="bg-muted/30 rounded-2xl p-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs">৳</span>
                মূল্য পরিসীমা
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">সর্বনিম্ন</label>
                  <Input
                    type="number"
                    value={priceRange[0]}
                    onChange={e => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
                    className="h-10 rounded-xl text-center"
                    placeholder="৳0"
                  />
                </div>
                <span className="text-muted-foreground mt-5 font-bold">—</span>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">সর্বোচ্চ</label>
                  <Input
                    type="number"
                    value={priceRange[1]}
                    onChange={e => setPriceRange([priceRange[0], Number(e.target.value) || 50000])}
                    className="h-10 rounded-xl text-center"
                    placeholder="৳50000"
                  />
                </div>
              </div>
            </div>

            {/* Min Rating */}
            <div className="bg-muted/30 rounded-2xl p-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs">★</span>
                সর্বনিম্ন রেটিং
              </h3>
              <div className="flex gap-2">
                {[0, 3, 4, 4.5].map(r => (
                  <button
                    key={r}
                    onClick={() => setMinRating(r)}
                    className={`flex-1 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                      minRating === r
                        ? 'border-accent bg-accent text-accent-foreground shadow-sm'
                        : 'border-border bg-card hover:bg-muted'
                    }`}
                  >
                    {r === 0 ? 'সব' : `${r}+ ★`}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-xl"
                onClick={() => { setSort('popular'); setPriceRange([0, 50000]); setMinRating(0); }}
              >
                রিসেট
              </Button>
              <Button className="flex-1 h-12 rounded-xl font-semibold" onClick={applyFilters}>
                ফিল্টার প্রয়োগ
              </Button>
            </div>

          </div>
        </SheetContent>
      </Sheet>

      {/* ── Mobile Menu Drawer ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer — stops above bottom nav bar (bottom-[57px]) */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed left-0 top-0 bottom-[57px] w-[280px] bg-card z-50 lg:hidden flex flex-col shadow-2xl rounded-br-2xl"
            >

              {/* ── Header: logo + close ── */}
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border/60">
                <Link
                  to="/"
                  className="flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <img
                    src="/icon.png"
                    alt={settings.appName}
                    className="h-6 max-w-[110px] object-contain"
                    onError={e => { (e.target as HTMLImageElement).src = '/logo.jpg'; }}
                  />
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
                >
                  <X size={14} className="text-muted-foreground" />
                </button>
              </div>

              {/* ── Nav links ── */}
              <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
                {[
                  { label: 'হোম',          path: '/',         icon: Home },
                  { label: 'ক্যাটাগরি',   path: '/category', icon: LayoutGrid },
                  { label: 'আমার অর্ডার', path: '/orders',   icon: Package },
                  { label: 'প্রোফাইল',    path: '/profile',  icon: User },
                  { label: 'সাপোর্ট',     path: '/support',  icon: Headphones },
                ].map(({ label, path, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="group flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-primary/8 hover:text-primary transition-all duration-150"
                  >
                    <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-muted group-hover:bg-primary/10 transition-colors shrink-0">
                      <Icon size={15} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    </span>
                    <span className="flex-1">{label}</span>
                    <ChevronRight size={14} className="text-muted-foreground/40 group-hover:text-primary/50 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </nav>

              {/* ── Divider ── */}
              <div className="mx-4 border-t border-border/60" />

              {/* ── Auth section — pinned just above bottom nav ── */}
              <div className="p-4 space-y-2.5">
                {user ? (
                  <>
                    {/* User card */}
                    <button
                      onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left"
                    >
                      <Avatar className="w-9 h-9 shrink-0">
                        <AvatarImage src={user.photoURL || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                          {(user.displayName || 'U')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{user.displayName || 'User'}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      {userData && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 shrink-0">
                          <Star size={10} className="text-accent fill-accent" />
                          <span className="text-[10px] font-bold text-accent">{userData.loyaltyPoints || 0}</span>
                        </span>
                      )}
                    </button>
                    {/* Logout */}
                    <button
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/5 transition-colors"
                    >
                      <LogOut size={14} />
                      লগআউট
                    </button>
                  </>
                ) : (
                  <Button
                    className="w-full h-11 rounded-xl font-semibold text-sm"
                    onClick={() => { navigate('/auth'); setMobileMenuOpen(false); }}
                  >
                    লগইন / রেজিস্ট্রেশন
                  </Button>
                )}
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
