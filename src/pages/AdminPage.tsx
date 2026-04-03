import { useState } from 'react';
import { useProducts, useCategories, useBanners, useCoupons, useAllOrders, useAllUsers, useSettings, addProduct, updateProduct, deleteProduct, addCategory, updateCategory, deleteCategory, addBanner, updateBanner, deleteBanner, addCoupon, updateCoupon, deleteCoupon, updateOrderStatus, updateSettings, Product, Category, Banner, Coupon } from '@/hooks/useFirestoreData';
import { ChevronDown as ChevronDownIcon, ChevronUp as ChevronUpIcon } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { Package, Users, Tag, TrendingUp, Edit, Trash2, Plus, Save, X, Ticket, Menu, LayoutDashboard, ImageIcon, BadgePercent, ClipboardList, UserCog, Cog, DollarSign, Clock, ExternalLink, ChevronDown, ChevronUp, Eye, Monitor, Globe, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'products', label: 'Products', icon: Package },
  { key: 'categories', label: 'Categories', icon: Tag },
  { key: 'banners', label: 'Banners', icon: ImageIcon },
  { key: 'coupons', label: 'Coupons', icon: BadgePercent },
  { key: 'orders', label: 'Orders', icon: ClipboardList },
  { key: 'users', label: 'Users', icon: UserCog },
  { key: 'settings', label: 'Settings', icon: Cog },
];

export default function AdminPage() {
  const { userData, logout } = useAuth();
  const { products } = useProducts();
  const { categories } = useCategories();
  const { banners } = useBanners();
  const { coupons } = useCoupons();
  const { orders } = useAllOrders();
  const { users } = useAllUsers();
  const { settings } = useSettings();

  const [activeSection, setActiveSection] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialog, setDialog] = useState<{ type: string; item?: any } | null>(null);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');

  const addImageUrl = (field = 'image') => {
    const url = imageUrlInput.trim();
    if (!url) return;
    if (field === 'images') {
      setForm((f: any) => ({ ...f, images: [...(f.images || []), url] }));
    } else {
      setForm((f: any) => ({ ...f, [field]: url }));
    }
    setImageUrlInput('');
  };
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderFilter, setOrderFilter] = useState('all');

  if (userData?.role !== 'admin') return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted-foreground">Access Denied</p></div>;

  const openDialog = (type: string, item?: any) => { setForm(item ? { ...item } : {}); setDialog({ type, item }); };
  const closeDialog = () => { setDialog(null); setForm({}); };

  const saveProduct = async () => {
    try {
      const selectedCat = categories.find(c => c.id === form.categoryId);
      const isDigital = !!form.isDigital;
      const data: any = {
        ...form,
        price: Number(form.price) || 0,
        originalPrice: Number(form.originalPrice) || 0,
        stock: isDigital ? 999 : (Number(form.stock) || 0),
        rating: Number(form.rating) || 0,
        reviewCount: Number(form.reviewCount) || 0,
        sold: Number(form.sold) || 0,
        featured: !!form.featured,
        isDigital,
        images: form.images || [],
        tags: form.tags ? (typeof form.tags === 'string' ? form.tags.split(',').map((t: string) => t.trim()) : form.tags) : [],
        sizes: isDigital ? [] : (form.sizes ? (typeof form.sizes === 'string' ? form.sizes.split(',').map((t: string) => t.trim()) : form.sizes) : []),
        colors: isDigital ? [] : (form.colors ? (typeof form.colors === 'string' ? form.colors.split(',').map((t: string) => t.trim()) : form.colors) : []),
        category: selectedCat?.name || form.category || '',
        categoryId: form.categoryId || '',
        order: Number(form.order) ?? 0,
        demoUrl: form.demoUrl || '',
        sourceCodeUrl: form.sourceCodeUrl || '',
        filePassword: form.filePassword || '',
      };
      delete data.id;
      if (dialog?.item?.id) await updateProduct(dialog.item.id, data);
      else await addProduct(data);
      closeDialog();
    } finally { setSaving(false); }
  };

  const saveCategory = async () => {
    setSaving(true);
    try {
      const data = { name: form.name || '', icon: form.icon || '', image: form.image || '', productCount: Number(form.productCount) || 0, order: Number(form.order) || 0 };
      if (dialog?.item?.id) await updateCategory(dialog.item.id, data);
      else await addCategory({ ...data, order: categories.length });
      closeDialog();
    } finally { setSaving(false); }
  };

  const moveCategoryOrder = async (index: number, direction: 'up' | 'down') => {
    const sorted = [...categories];
    const swapIdx = direction === 'up' ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    await Promise.all([
      updateCategory(sorted[index].id, { order: sorted[swapIdx].order ?? swapIdx }),
      updateCategory(sorted[swapIdx].id, { order: sorted[index].order ?? index }),
    ]);
  };

  const moveProductOrder = async (index: number, direction: 'up' | 'down') => {
    const sorted = [...products];
    const swapIdx = direction === 'up' ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    await Promise.all([
      updateProduct(sorted[index].id, { order: sorted[swapIdx].order ?? swapIdx }),
      updateProduct(sorted[swapIdx].id, { order: sorted[index].order ?? index }),
    ]);
  };

  const saveBanner = async () => {
    setSaving(true);
    try {
      const data = { image: form.image || '', link: form.link || '/', active: form.active !== false };
      if (dialog?.item?.id) await updateBanner(dialog.item.id, data);
      else await addBanner(data);
      closeDialog();
    } finally { setSaving(false); }
  };

  const saveCoupon = async () => {
    setSaving(true);
    try {
      const data = { code: (form.code || '').toUpperCase(), discountPercent: Number(form.discountPercent) || 0, minOrder: Number(form.minOrder) || 0, maxDiscount: Number(form.maxDiscount) || 0, active: form.active !== false };
      if (dialog?.item?.id) await updateCoupon(dialog.item.id, data);
      else await addCoupon(data);
      closeDialog();
    } finally { setSaving(false); }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await updateSettings({ ...settings, ...form });
      closeDialog();
      setForm({});
    } finally { setSaving(false); }
  };

  const totalSales = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'processing').length;



  const filteredOrders = orderFilter === 'all' ? orders : orders.filter(o => o.status === orderFilter);

  const stats = [
    { label: 'Total Sales', value: `৳${totalSales.toFixed(0)}`, icon: DollarSign, color: 'text-green-600 bg-green-500/10', onClick: () => setActiveSection('orders') },
    { label: 'Pending Orders', value: pendingOrders, icon: Clock, color: 'text-amber-600 bg-amber-500/10', onClick: () => setActiveSection('orders') },
    { label: 'Products', value: products.length, icon: Package, color: 'text-primary bg-primary/10', onClick: () => setActiveSection('products') },
    { label: 'Categories', value: categories.length, icon: Tag, color: 'text-purple-600 bg-purple-500/10', onClick: () => setActiveSection('categories') },
    { label: 'Banners', value: banners.length, icon: ImageIcon, color: 'text-blue-600 bg-blue-500/10', onClick: () => setActiveSection('banners') },
    { label: 'Coupons', value: coupons.length, icon: BadgePercent, color: 'text-pink-600 bg-pink-500/10', onClick: () => setActiveSection('coupons') },
    { label: 'Users', value: users.length, icon: Users, color: 'text-destructive bg-destructive/10', onClick: () => setActiveSection('users') },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 px-4 h-14 max-w-screen-xl mx-auto">
          <button onClick={() => setMenuOpen(true)} className="p-2 hover:bg-muted rounded-lg"><Menu size={20} /></button>
          {settings.appLogo ? (
            <img src={settings.appLogo} alt={settings.appName} className="h-6 max-w-[110px] object-contain" />
          ) : (
            <span className="font-bold text-base text-primary">{settings.appName}</span>
          )}
          <span className="flex-1" />
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">Admin</span>
        </div>
      </header>

      {/* Hamburger Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50" onClick={() => setMenuOpen(false)} />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="fixed left-0 top-0 bottom-0 w-64 bg-card z-50 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  {settings.appLogo ? (
                    <img src={settings.appLogo} alt={settings.appName} className="h-6 max-w-[110px] object-contain" />
                  ) : (
                    <span className="font-bold text-base text-primary">{settings.appName}</span>
                  )}
                </div>
                <button onClick={() => setMenuOpen(false)} className="p-2"><X size={20} /></button>
              </div>
              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {menuItems.map(item => (
                  <button key={item.key} onClick={() => { setActiveSection(item.key); setMenuOpen(false); }}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeSection === item.key ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'}`}>
                    <item.icon size={16} /> {item.label}
                  </button>
                ))}
              </nav>
              <div className="p-4 border-t">
                <button onClick={logout} className="text-sm text-destructive font-medium w-full text-left px-3 py-2">Logout</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="max-w-screen-xl mx-auto px-4 py-5 pb-8">
        {/* Dashboard */}
        {activeSection === 'dashboard' && (
          <div>
            <h2 className="font-bold text-xl mb-5">Dashboard</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {stats.map(s => (
                <button key={s.label} onClick={s.onClick} className="bg-card border border-border rounded-xl p-4 text-left hover:shadow-md transition-shadow">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}><s.icon size={20} /></div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </button>
              ))}
            </div>
            <div>
              <h3 className="font-bold mb-3">Recent Orders</h3>
              <div className="space-y-2">
                {orders.slice(0, 5).map(o => (
                  <div key={o.id} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-muted-foreground">#{o.id.slice(0, 8)}</p>
                      <p className="text-sm font-medium truncate">{o.shipping?.name} — ৳{o.total?.toFixed(0)}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${o.status === 'delivered' ? 'bg-green-500/10 text-green-600' : o.status === 'cancelled' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>{o.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Products */}
        {activeSection === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-xl">{products.length} Products</h2>
              <Button size="sm" className="h-8 gap-1 text-xs" onClick={() => openDialog('product')}><Plus size={12} /> Add Product</Button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">↑↓ বাটন দিয়ে প্রোডাক্টের সিরিয়াল পরিবর্তন করুন</p>
            <div className="space-y-2">
              {products.map((p, idx) => (
                <div key={p.id} className="flex items-center gap-3 bg-card border border-border rounded-xl p-3">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moveProductOrder(idx, 'up')} disabled={idx === 0} className="p-0.5 hover:bg-muted rounded disabled:opacity-20"><ChevronUpIcon size={14} /></button>
                    <button onClick={() => moveProductOrder(idx, 'down')} disabled={idx === products.length - 1} className="p-0.5 hover:bg-muted rounded disabled:opacity-20"><ChevronDownIcon size={14} /></button>
                  </div>
                  <img src={p.images?.[0] || '/placeholder.svg'} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      {p.isDigital && <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1 py-0.5 rounded">Digital</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">{p.brand} · ৳{p.price} · {p.category}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.isDigital ? 'bg-primary/10 text-primary' : p.stock > 0 ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>{p.isDigital ? 'Digital' : p.stock > 0 ? `${p.stock}` : 'Out'}</span>
                    <button onClick={() => openDialog('product', p)} className="p-1.5 hover:bg-muted rounded-lg"><Edit size={13} /></button>
                    <button onClick={() => deleteProduct(p.id)} className="p-1.5 hover:bg-destructive/10 rounded-lg text-destructive"><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        {activeSection === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-xl">{categories.length} Categories</h2>
              <Button size="sm" className="h-8 gap-1 text-xs" onClick={() => openDialog('category')}><Plus size={12} /> Add</Button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">↑↓ বাটন দিয়ে ক্যাটাগরির সিরিয়াল পরিবর্তন করুন</p>
            <div className="space-y-2">
              {categories.map((cat, idx) => (
                <div key={cat.id} className="flex items-center gap-3 bg-card border border-border rounded-xl p-3">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moveCategoryOrder(idx, 'up')} disabled={idx === 0} className="p-0.5 hover:bg-muted rounded disabled:opacity-20"><ChevronUpIcon size={14} /></button>
                    <button onClick={() => moveCategoryOrder(idx, 'down')} disabled={idx === categories.length - 1} className="p-0.5 hover:bg-muted rounded disabled:opacity-20"><ChevronDownIcon size={14} /></button>
                  </div>
                  <img src={cat.image || '/placeholder.svg'} alt={cat.name} className="w-10 h-10 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{cat.name}</p>
                    <p className="text-[10px] text-muted-foreground">Order: {cat.order ?? idx}</p>
                  </div>
                  <button onClick={() => openDialog('category', cat)} className="p-1.5 hover:bg-muted rounded-lg"><Edit size={13} /></button>
                  <button onClick={() => deleteCategory(cat.id)} className="p-1.5 hover:bg-destructive/10 rounded-lg text-destructive"><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Banners */}
        {activeSection === 'banners' && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-xl">{banners.length} Banners</h2>
              <Button size="sm" className="h-8 gap-1 text-xs" onClick={() => openDialog('banner')}><Plus size={12} /> Add</Button>
            </div>
            <div className="space-y-3">
              {banners.map(b => (
                <div key={b.id} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
                  <img src={b.image} alt="" className="w-24 h-14 rounded-lg object-cover" />
                  <div className="flex-1"><p className="text-sm font-medium">{b.link}</p></div>
                  <button onClick={() => openDialog('banner', b)} className="p-1.5 hover:bg-muted rounded-lg"><Edit size={13} /></button>
                  <button onClick={() => deleteBanner(b.id)} className="p-1.5 hover:bg-destructive/10 rounded-lg text-destructive"><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coupons */}
        {activeSection === 'coupons' && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-xl">{coupons.length} Coupons</h2>
              <Button size="sm" className="h-8 gap-1 text-xs" onClick={() => openDialog('coupon')}><Plus size={12} /> Add</Button>
            </div>
            <div className="space-y-2">
              {coupons.map(c => (
                <div key={c.id} className="flex items-center gap-3 bg-card border border-border rounded-xl p-3">
                  <Ticket size={18} className="text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold">{c.code}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.discountPercent > 0 ? `${c.discountPercent}% off` : `৳${c.maxDiscount} flat`}
                      {c.userId ? ' · User-specific' : ''}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${c.active ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}`}>{c.active ? 'Active' : 'Inactive'}</span>
                  <button onClick={() => openDialog('coupon', c)} className="p-1.5 hover:bg-muted rounded-lg"><Edit size={13} /></button>
                  <button onClick={() => deleteCoupon(c.id)} className="p-1.5 hover:bg-destructive/10 rounded-lg text-destructive"><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders */}
        {activeSection === 'orders' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-xl">Orders ({orders.length})</h2>
              <select value={orderFilter} onChange={e => setOrderFilter(e.target.value)} className="text-sm border border-border rounded-lg px-3 py-1.5 bg-card">
                <option value="all">All</option>
                <option value="processing">Processing</option>
                <option value="packed">Packed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="space-y-3">
              {filteredOrders.length === 0 && (
                <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
                  <p className="text-sm">No orders found</p>
                </div>
              )}
              {filteredOrders.map(o => (
                <div key={o.id} className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-xs font-mono text-muted-foreground">Order #{o.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">
                          {o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString('en-BD', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)} className="text-xs border border-border rounded-lg px-2 py-1 bg-card">
                          <option value="processing">Processing</option>
                          <option value="packed">Packed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground font-medium mb-1">Customer</p>
                        <p className="text-sm font-semibold">{o.shipping?.name || o.userName || '—'}</p>
                        <p className="text-xs text-muted-foreground">{o.shipping?.phone}</p>
                        {o.userEmail && <p className="text-xs text-muted-foreground truncate">{o.userEmail}</p>}
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground font-medium mb-1">Delivery Address</p>
                        <p className="text-xs">{o.shipping?.address}</p>
                        <p className="text-xs text-muted-foreground mt-1">{o.delivery?.label}</p>
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-3 mb-3">
                      <p className="text-xs text-muted-foreground font-medium mb-2">Payment</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${o.payment?.method === 'cod' ? 'bg-green-500/10 text-green-600' : 'bg-pink-500/10 text-pink-600'}`}>
                          {o.payment?.method === 'cod' ? 'Cash on Delivery' : 'Mobile Banking'}
                        </span>
                        {o.payment?.method === 'mobile' && (
                          <>
                            {o.payment?.number && <span className="text-xs text-muted-foreground">📱 {o.payment.number}</span>}
                            {o.payment?.transactionId && <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">TrxID: {o.payment.transactionId}</span>}
                          </>
                        )}
                        {o.couponCode && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Coupon: {o.couponCode}</span>}
                      </div>
                      {o.payment?.screenshot && (
                        <a href={o.payment.screenshot} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2">
                          <ExternalLink size={12} /> View Payment Screenshot
                        </a>
                      )}
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {o.items?.slice(0, 5).map((item: any, i: number) => (
                        <div key={i} className="shrink-0 flex flex-col items-center">
                          <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          <span className="text-[10px] text-muted-foreground">×{item.quantity || 1}</span>
                        </div>
                      ))}
                      {(o.items?.length || 0) > 5 && <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xs font-bold shrink-0">+{o.items.length - 5}</div>}
                    </div>

                    <button
                      className="mt-2 text-xs text-primary flex items-center gap-1 hover:underline"
                      onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}
                    >
                      {expandedOrder === o.id ? <><ChevronUp size={12} /> Hide Details</> : <><Eye size={12} /> Full Details</>}
                    </button>
                  </div>

                  {expandedOrder === o.id && (
                    <div className="border-t border-border px-4 py-3 bg-muted/30">
                      <p className="text-xs font-semibold mb-2">Order Items</p>
                      <div className="space-y-2 mb-3">
                        {o.items?.map((item: any, i: number) => (
                          <div key={i} className="flex items-center gap-3 bg-card rounded-lg p-2">
                            <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{item.name}</p>
                              <p className="text-[10px] text-muted-foreground">{item.selectedColor} {item.selectedSize}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold">৳{(item.price * (item.quantity || 1)).toFixed(0)}</p>
                              <p className="text-[10px] text-muted-foreground">৳{item.price} × {item.quantity || 1}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs space-y-1 border-t border-border pt-2">
                        <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>৳{o.subtotal?.toFixed(0)}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>৳{o.deliveryCharge?.toFixed(0)}</span></div>
                        {(o.discountAmount || 0) > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-৳{o.discountAmount?.toFixed(0)}</span></div>}
                        <div className="flex justify-between font-bold text-sm"><span>Total</span><span className="text-primary">৳{o.total?.toFixed(0)}</span></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users */}
        {activeSection === 'users' && (
          <div>
            <h2 className="font-bold text-xl mb-3">Users ({users.length})</h2>
            <div className="space-y-2">
              {users.map(u => (
                <div key={u.id} className="flex items-center gap-3 bg-card border border-border rounded-xl p-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{(u.displayName || u.email || 'U')[0].toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{u.displayName || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>{u.role}</span>
                    {u.loyaltyPoints > 0 && <p className="text-xs text-accent mt-0.5">⭐ {u.loyaltyPoints} pts</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings */}
        {activeSection === 'settings' && (
          <div className="bg-card border border-border rounded-xl p-4 space-y-4 max-w-lg">
            <h2 className="font-bold text-xl">App Settings</h2>
            {[
              { key: 'appName', label: 'App Name' },
              { key: 'phone', label: 'Phone' },
              { key: 'whatsapp', label: 'WhatsApp' },
              { key: 'facebookPageId', label: 'Facebook Page ID / Username' },
              { key: 'email', label: 'Email' },
              { key: 'bkashNumber', label: 'bKash Number' },
              { key: 'nagadNumber', label: 'Nagad Number' },
              { key: 'location', label: 'Location' },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-1.5">
                <Label>{label}</Label>
                <Input value={(form as any)[key] ?? (settings as any)[key] ?? ''} onChange={e => setForm((f: any) => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}

            <div className="space-y-2">
              <Label>Delivery Areas & Charges</Label>
              <p className="text-xs text-muted-foreground">ইউজার চেকআউটে কার্ড সিলেক্ট করে এরিয়া বেছে নেবে।</p>
              {(form.deliveryAreas ?? settings.deliveryAreas ?? []).map((area: any, i: number) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input value={area.name} placeholder="Area name" onChange={e => {
                    const areas = [...(form.deliveryAreas ?? settings.deliveryAreas ?? [])];
                    areas[i] = { ...areas[i], name: e.target.value };
                    setForm((f: any) => ({ ...f, deliveryAreas: areas }));
                  }} className="flex-1 h-9 text-sm" />
                  <Input type="number" value={area.charge} placeholder="৳" onChange={e => {
                    const areas = [...(form.deliveryAreas ?? settings.deliveryAreas ?? [])];
                    areas[i] = { ...areas[i], charge: Number(e.target.value) };
                    setForm((f: any) => ({ ...f, deliveryAreas: areas }));
                  }} className="w-24 h-9 text-sm" />
                  <button onClick={() => {
                    const areas = [...(form.deliveryAreas ?? settings.deliveryAreas ?? [])];
                    areas.splice(i, 1);
                    setForm((f: any) => ({ ...f, deliveryAreas: areas }));
                  }} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 size={13} /></button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => {
                const areas = [...(form.deliveryAreas ?? settings.deliveryAreas ?? []), { name: '', charge: 0 }];
                setForm((f: any) => ({ ...f, deliveryAreas: areas }));
              }}><Plus size={12} /> Add Area</Button>
            </div>

            <div className="space-y-1.5">
              <Label>Points Per Taka Discount</Label>
              <Input type="number" value={(form.pointsPerTaka ?? settings.pointsPerTaka) || 10} onChange={e => setForm((f: any) => ({ ...f, pointsPerTaka: Number(e.target.value) }))} />
              <p className="text-xs text-muted-foreground">e.g., 10 = 10 points = ৳1 discount.</p>
            </div>

            <div className="space-y-1.5">
              <Label>App Logo</Label>
              {(form.appLogo || settings.appLogo) && <img src={form.appLogo || settings.appLogo} alt="Logo" className="w-16 h-16 rounded-lg object-contain border border-border" />}
              <div className="flex gap-2">
                <Input value={imageUrlInput} onChange={e => setImageUrlInput(e.target.value)} placeholder="Image URL paste করুন" className="flex-1 text-xs" />
                <Button type="button" size="sm" variant="outline" onClick={() => addImageUrl('appLogo')}>Add</Button>
                <Button type="button" size="sm" variant="secondary" onClick={() => window.open('https://postimg.cc', '_blank')}>Get URL</Button>
              </div>
            </div>
            {/* Support Channel Toggles */}
            <div className="space-y-3 p-3 bg-muted/50 rounded-xl border border-border">
              <p className="text-xs font-semibold text-primary">সাপোর্ট চ্যানেল (ফ্লোটিং বাটনে দেখাবে)</p>
              {[
                { key: 'chatbotEnabled', label: 'চ্যাটবট' },
                { key: 'whatsappEnabled', label: 'WhatsApp' },
                { key: 'callEnabled', label: 'কল' },
                { key: 'messengerEnabled', label: 'Messenger' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <Label className="text-sm">{label}</Label>
                  <Switch checked={(form as any)[key] ?? (settings as any)[key] ?? true} onCheckedChange={v => setForm((f: any) => ({ ...f, [key]: v }))} />
                </div>
              ))}
            </div>

            <Button onClick={saveSettings} disabled={saving} className="w-full gap-2"><Save size={14} /> Save Settings</Button>
          </div>
        )}
      </div>

      {/* Product Dialog */}
      <Dialog open={dialog?.type === 'product'} onOpenChange={open => !open && closeDialog()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{dialog?.item ? 'Edit Product' : 'Add Product'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-xl">
              <Switch checked={!!form.isDigital} onCheckedChange={v => setForm((f: any) => ({ ...f, isDigital: v }))} />
              <Label className="flex items-center gap-1"><Monitor size={14} className="text-primary" /> Digital Product</Label>
            </div>

            <div className="space-y-1.5"><Label>Name</Label><Input value={form.name || ''} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Price (৳)</Label><Input type="number" value={form.price || ''} onChange={e => setForm((f: any) => ({ ...f, price: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Original Price (৳)</Label><Input type="number" value={form.originalPrice || ''} onChange={e => setForm((f: any) => ({ ...f, originalPrice: e.target.value }))} /></div>
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <select value={form.categoryId || ''} onChange={e => { const cat = categories.find(c => c.id === e.target.value); setForm((f: any) => ({ ...f, categoryId: e.target.value, category: cat?.name || '' })); }} className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm">
                <option value="">Select Category</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Rating (0-5)</Label><Input type="number" step="0.1" min="0" max="5" value={form.rating || ''} onChange={e => setForm((f: any) => ({ ...f, rating: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Review Count</Label><Input type="number" value={form.reviewCount || ''} onChange={e => setForm((f: any) => ({ ...f, reviewCount: e.target.value }))} /></div>
            </div>

            {!form.isDigital && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>Brand</Label><Input value={form.brand || ''} onChange={e => setForm((f: any) => ({ ...f, brand: e.target.value }))} /></div>
                  <div className="space-y-1.5"><Label>Stock</Label><Input type="number" value={form.stock || ''} onChange={e => setForm((f: any) => ({ ...f, stock: e.target.value }))} /></div>
                </div>
                <div className="space-y-1.5"><Label>Sizes (comma separated)</Label><Input value={Array.isArray(form.sizes) ? form.sizes.join(', ') : form.sizes || ''} onChange={e => setForm((f: any) => ({ ...f, sizes: e.target.value }))} placeholder="S, M, L, XL" /></div>
                <div className="space-y-1.5"><Label>Colors (comma separated)</Label><Input value={Array.isArray(form.colors) ? form.colors.join(', ') : form.colors || ''} onChange={e => setForm((f: any) => ({ ...f, colors: e.target.value }))} placeholder="Red, Blue, Green" /></div>
              </>
            )}

            <div className="space-y-1.5">
              <Label>Description (প্রতি লাইনে একটি পয়েন্ট)</Label>
              <textarea value={form.description || ''} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))} className="w-full h-28 rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none" placeholder="প্রতিটি লাইনে একটি বুলেট পয়েন্ট লিখুন&#10;উদাহরণ: প্রিমিয়াম কোয়ালিটি ফেব্রিক&#10;আরামদায়ক ও টেকসই" />
            </div>
            <div className="space-y-1.5"><Label>Tags (comma separated)</Label><Input value={Array.isArray(form.tags) ? form.tags.join(', ') : form.tags || ''} onChange={e => setForm((f: any) => ({ ...f, tags: e.target.value }))} /></div>
            <div className="flex items-center gap-2"><Switch checked={!!form.featured} onCheckedChange={v => setForm((f: any) => ({ ...f, featured: v }))} /><Label>Featured</Label></div>

            {form.isDigital && (
              <div className="space-y-3 p-3 bg-muted/50 rounded-xl border border-border">
                <p className="text-xs font-semibold text-primary flex items-center gap-1"><Monitor size={12} /> Digital Product Fields</p>
                <div className="space-y-1.5"><Label className="text-xs flex items-center gap-1"><Globe size={12} /> Demo URL</Label><Input value={form.demoUrl || ''} onChange={e => setForm((f: any) => ({ ...f, demoUrl: e.target.value }))} placeholder="https://demo.example.com" /></div>
                <div className="space-y-1.5"><Label className="text-xs flex items-center gap-1"><ExternalLink size={12} /> Source Code / Download URL</Label><Input value={form.sourceCodeUrl || ''} onChange={e => setForm((f: any) => ({ ...f, sourceCodeUrl: e.target.value }))} placeholder="https://drive.google.com/..." /></div>
                <div className="space-y-1.5"><Label className="text-xs flex items-center gap-1"><Lock size={12} /> File Password (optional)</Label><Input value={form.filePassword || ''} onChange={e => setForm((f: any) => ({ ...f, filePassword: e.target.value }))} placeholder="Password for the file" /></div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Images</Label>
              <div className="flex gap-2 flex-wrap">{(form.images || []).map((img: string, i: number) => (
                <div key={i} className="relative">
                  <img src={img} className="w-16 h-16 rounded-lg object-cover" />
                  <button onClick={() => setForm((f: any) => ({ ...f, images: f.images.filter((_: any, idx: number) => idx !== i) }))} className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full text-[10px] flex items-center justify-center">×</button>
                </div>
              ))}</div>
              <div className="flex gap-2">
                <Input value={imageUrlInput} onChange={e => setImageUrlInput(e.target.value)} placeholder="Image URL paste করুন" className="flex-1 text-xs" />
                <Button type="button" size="sm" variant="outline" onClick={() => addImageUrl('images')}>Add</Button>
                <Button type="button" size="sm" variant="secondary" onClick={() => window.open('https://postimg.cc', '_blank')}>Get URL</Button>
              </div>
            </div>
            <Button onClick={saveProduct} disabled={saving} className="w-full">{saving ? 'Saving...' : 'Save Product'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={dialog?.type === 'category'} onOpenChange={open => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader><DialogTitle>{dialog?.item ? 'Edit Category' : 'Add Category'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Name</Label><Input value={form.name || ''} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Icon (emoji)</Label><Input value={form.icon || ''} onChange={e => setForm((f: any) => ({ ...f, icon: e.target.value }))} placeholder="e.g. 👗 or 📱" /></div>
            <div className="space-y-1.5">
              <Label>Image</Label>
              {form.image && <img src={form.image} className="w-20 h-20 rounded-lg object-cover" />}
              <div className="flex gap-2">
                <Input value={imageUrlInput} onChange={e => setImageUrlInput(e.target.value)} placeholder="Image URL paste করুন" className="flex-1 text-xs" />
                <Button type="button" size="sm" variant="outline" onClick={() => addImageUrl('image')}>Add</Button>
                <Button type="button" size="sm" variant="secondary" onClick={() => window.open('https://postimg.cc', '_blank')}>Get URL</Button>
              </div>
            </div>
            <Button onClick={saveCategory} disabled={saving} className="w-full">{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Banner Dialog */}
      <Dialog open={dialog?.type === 'banner'} onOpenChange={open => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader><DialogTitle>{dialog?.item ? 'Edit Banner' : 'Add Banner'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Link</Label><Input value={form.link || ''} onChange={e => setForm((f: any) => ({ ...f, link: e.target.value }))} placeholder="/category/electronics" /></div>
            <div className="flex items-center gap-2"><Switch checked={form.active !== false} onCheckedChange={v => setForm((f: any) => ({ ...f, active: v }))} /><Label>Active</Label></div>
            <div className="space-y-1.5">
              <Label>Image</Label>
              {form.image && <img src={form.image} className="w-full h-32 rounded-lg object-cover" />}
              <div className="flex gap-2">
                <Input value={imageUrlInput} onChange={e => setImageUrlInput(e.target.value)} placeholder="Image URL paste করুন" className="flex-1 text-xs" />
                <Button type="button" size="sm" variant="outline" onClick={() => addImageUrl('image')}>Add</Button>
                <Button type="button" size="sm" variant="secondary" onClick={() => window.open('https://postimg.cc', '_blank')}>Get URL</Button>
              </div>
            </div>
            <Button onClick={saveBanner} disabled={saving} className="w-full">{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Coupon Dialog */}
      <Dialog open={dialog?.type === 'coupon'} onOpenChange={open => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader><DialogTitle>{dialog?.item ? 'Edit Coupon' : 'Add Coupon'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Code</Label><Input value={form.code || ''} onChange={e => setForm((f: any) => ({ ...f, code: e.target.value }))} placeholder="SAVE20" /></div>
            <div className="space-y-1.5"><Label>Discount % (0 for flat discount)</Label><Input type="number" value={form.discountPercent || ''} onChange={e => setForm((f: any) => ({ ...f, discountPercent: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Min Order (৳)</Label><Input type="number" value={form.minOrder || ''} onChange={e => setForm((f: any) => ({ ...f, minOrder: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Max / Flat Discount (৳)</Label><Input type="number" value={form.maxDiscount || ''} onChange={e => setForm((f: any) => ({ ...f, maxDiscount: e.target.value }))} /></div>
            </div>
            <div className="flex items-center gap-2"><Switch checked={form.active !== false} onCheckedChange={v => setForm((f: any) => ({ ...f, active: v }))} /><Label>Active</Label></div>
            <Button onClick={saveCoupon} disabled={saving} className="w-full">{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
