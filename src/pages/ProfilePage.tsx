import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders, useSettings, bindReferral, generateLoyaltyCoupon, useMyCoupons } from '@/hooks/useFirestoreData';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, MapPin, Package, Gift, Settings, Star, Copy, Check, ExternalLink, Clock, Shield, FileText, RotateCcw, Save, Ticket, Link2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SocialShareButtons from '@/components/SocialShareButtons';

export default function ProfilePage() {
  const { user, userData, logout, refreshUserData } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [referralInput, setReferralInput] = useState('');
  const [referralMsg, setReferralMsg] = useState('');
  const [referralErr, setReferralErr] = useState('');
  const [profileForm, setProfileForm] = useState({ displayName: '', phone: '', deliveryAddress: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [generatingCoupon, setGeneratingCoupon] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState('');
  const [redeemMsg, setRedeemMsg] = useState('');
  const [redeemErr, setRedeemErr] = useState('');

  const { orders, loading: ordersLoading } = useOrders(user?.uid);
  const { coupons: myCoupons } = useMyCoupons(user?.uid);
  const [couponCopied, setCouponCopied] = useState('');

  const defaultTab = searchParams.get('tab') || 'orders';

  useEffect(() => {
    if (userData) {
      setProfileForm({
        displayName: userData.displayName || user?.displayName || '',
        phone: userData.phone || '',
        deliveryAddress: (userData as any).deliveryAddress || '',
      });
    }
  }, [userData, user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center"><User size={36} className="text-muted-foreground" /></div>
        <h2 className="text-xl font-bold">Please Login</h2>
        <p className="text-muted-foreground text-sm">Sign in to access your profile</p>
        <Button onClick={() => navigate('/auth')} className="mt-2">Login / Register</Button>
      </div>
    );
  }

  const referralCode = userData?.referralCode || '';
  const referralLink = `${window.location.origin}/auth?ref=${referralCode}`;

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleBindReferral = async () => {
    setReferralErr(''); setReferralMsg('');
    if (!referralInput.trim()) return;
    try {
      await bindReferral(user.uid, referralInput.trim());
      setReferralMsg('রেফারেল কোড সফলভাবে যুক্ত হয়েছে! ৫০ পয়েন্ট পেয়েছেন।');
      setReferralInput('');
      await refreshUserData();
    } catch (err: any) {
      setReferralErr(err.message || 'Invalid referral code');
    }
  };

  const handleRedeemPoints = async () => {
    setRedeemErr(''); setRedeemMsg('');
    const pts = Number(pointsToRedeem);
    if (!pts || pts <= 0) { setRedeemErr('কতটা পয়েন্ট ব্যবহার করবেন লিখুন'); return; }
    if (pts > (userData?.loyaltyPoints || 0)) { setRedeemErr('পর্যাপ্ত পয়েন্ট নেই'); return; }
    setGeneratingCoupon(true);
    try {
      const pointsPerTaka = settings.pointsPerTaka || 10;
      const coupon = await generateLoyaltyCoupon(user.uid, pts, pointsPerTaka);
      const discount = Math.floor(pts / pointsPerTaka);
      setRedeemMsg(`কুপন তৈরি হয়েছে: ${coupon.code} — ৳${discount} ডিসকাউন্ট পাবেন!`);
      setPointsToRedeem('');
      await refreshUserData();
    } catch (err: any) {
      setRedeemErr(err.message || 'কুপন তৈরি করতে সমস্যা হয়েছে');
    } finally {
      setGeneratingCoupon(false);
    }
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: profileForm.displayName,
        phone: profileForm.phone,
        deliveryAddress: profileForm.deliveryAddress,
      });
      await refreshUserData();
      toast({ title: 'সেভ হয়েছে', description: 'প্রোফাইল তথ্য আপডেট করা হয়েছে।' });
    } catch {
      toast({ title: 'Error', description: 'আপডেট করতে সমস্যা হয়েছে।', variant: 'destructive' });
    } finally {
      setProfileSaving(false);
    }
  };

  const pointsPerTaka = settings.pointsPerTaka || 10;
  const maxRedeemable = userData?.loyaltyPoints || 0;
  const previewDiscount = pointsToRedeem ? Math.floor(Number(pointsToRedeem) / pointsPerTaka) : 0;

  return (
    <div className="pb-nav lg:pb-8 max-w-screen-md mx-auto px-4 py-5">
      <div className="flex items-center gap-4 mb-6 p-4 bg-card border border-border rounded-2xl">
        <Avatar className="w-16 h-16">
          <AvatarImage src={user.photoURL || undefined} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">{(user.displayName || 'U')[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="font-bold text-lg">{profileForm.displayName || user.displayName || 'User'}</h1>
          <p className="text-muted-foreground text-sm">{user.email}</p>
          {userData?.loyaltyPoints !== undefined && (
            <div className="flex items-center gap-1 mt-1"><Star size={12} className="text-accent fill-accent" /><span className="text-xs font-semibold text-accent">{userData.loyaltyPoints} points</span></div>
          )}
        </div>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList className="w-full grid grid-cols-4 mb-5 h-auto rounded-xl">
          <TabsTrigger value="orders" className="py-2 text-xs rounded-lg flex-col gap-1 h-14"><Package size={14} />Orders</TabsTrigger>
          <TabsTrigger value="rewards" className="py-2 text-xs rounded-lg flex-col gap-1 h-14"><Gift size={14} />Rewards</TabsTrigger>
          <TabsTrigger value="profile" className="py-2 text-xs rounded-lg flex-col gap-1 h-14"><User size={14} />Profile</TabsTrigger>
          <TabsTrigger value="settings" className="py-2 text-xs rounded-lg flex-col gap-1 h-14"><Settings size={14} />Settings</TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <div className="space-y-3">
            {ordersLoading ? (
              <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
            ) : orders.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <Package size={40} className="mx-auto mb-3 text-muted-foreground opacity-30" />
                <p className="text-sm text-muted-foreground">No orders yet</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/')}>Start Shopping</Button>
              </div>
            ) : orders.map(order => (
              <Link key={order.id} to="/orders" state={{ orderId: order.id }} className="block bg-card border border-border rounded-xl p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-mono text-muted-foreground">#{order.id.slice(0, 8)}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${order.status === 'delivered' ? 'bg-green-500/10 text-green-600' : order.status === 'cancelled' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>{order.status}</span>
                </div>
                <p className="text-sm font-medium">{order.items?.length || 0} items &middot; ৳{order.total?.toFixed(0)}</p>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={12} /> {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('bn-BD') : 'Recent'}
                  </div>
                  <div className="flex items-center gap-2">
                    {order.status === 'delivered' && (
                      <Link to="/support" onClick={e => e.stopPropagation()} className="text-xs text-primary font-medium flex items-center gap-1">
                        <RotateCcw size={12} /> Return
                      </Link>
                    )}
                    <span className="text-xs text-primary flex items-center gap-1"><ExternalLink size={12} /> Details</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-4">
          <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-primary-foreground/70 text-sm">Loyalty Points</p>
                <p className="text-4xl font-bold mt-1">{userData?.loyaltyPoints || 0}</p>
                <p className="text-primary-foreground/60 text-xs mt-1">{pointsPerTaka} points = ৳1 discount</p>
              </div>
              <Star size={40} className="opacity-30" />
            </div>
          </div>

          {/* Redeem Points for Coupon */}
          {(userData?.loyaltyPoints || 0) >= pointsPerTaka && (
            <div className="bg-card border border-border rounded-xl p-4">
              <h2 className="font-semibold text-sm mb-1 flex items-center gap-2"><Ticket size={14} className="text-primary" /> পয়েন্ট দিয়ে কুপন তৈরি</h2>
              <p className="text-xs text-muted-foreground mb-3">আপনার পয়েন্ট ব্যবহার করে একটি ডিসকাউন্ট কুপন তৈরি করুন।</p>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input type="number" value={pointsToRedeem} onChange={e => setPointsToRedeem(e.target.value)} placeholder={`Max: ${maxRedeemable} pts`} className="h-9 text-sm flex-1" max={maxRedeemable} min={pointsPerTaka} />
                  <Button size="sm" onClick={handleRedeemPoints} disabled={generatingCoupon} className="h-9">{generatingCoupon ? 'Creating...' : 'Generate'}</Button>
                </div>
                {previewDiscount > 0 && <p className="text-xs text-primary font-medium">{pointsToRedeem} points = ৳{previewDiscount} discount</p>}
                {redeemMsg && <p className="text-xs text-green-600 bg-green-500/10 p-2 rounded-lg">{redeemMsg}</p>}
                {redeemErr && <p className="text-xs text-destructive">{redeemErr}</p>}
              </div>
            </div>
          )}

          {/* My Active Coupons */}
          {myCoupons.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-4">
              <h2 className="font-semibold text-sm mb-3 flex items-center gap-2"><Ticket size={14} className="text-primary" /> আপনার কুপন</h2>
              <div className="space-y-2">
                {myCoupons.map(c => (
                  <div key={c.id} className="flex items-center gap-3 bg-muted/50 rounded-xl p-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold font-mono text-primary">{c.code}</p>
                      <p className="text-xs text-muted-foreground">{c.discountPercent > 0 ? `${c.discountPercent}% off` : `৳${c.maxDiscount} flat discount`}</p>
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(c.code); setCouponCopied(c.id); setTimeout(() => setCouponCopied(''), 2000); }} className="p-2 hover:bg-border rounded-lg">
                      {couponCopied === c.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-muted-foreground" />}
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">কুপন একবার ব্যবহার করলে স্বয়ংক্রিয়ভাবে মুছে যাবে।</p>
            </div>
          )}

          {/* Referral Program */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h2 className="font-semibold text-sm mb-3 flex items-center gap-2"><Gift size={14} /> Referral Program</h2>
            <p className="text-xs text-muted-foreground mb-3">আপনার রেফারেল লিংক শেয়ার করুন এবং প্রতি রেফারেলে ৫০ পয়েন্ট পান।</p>
            
            <div className="flex items-center gap-2 bg-muted rounded-xl p-3 mb-3">
              <code className="flex-1 text-sm font-bold font-mono text-primary">{referralCode || '--------'}</code>
              <button onClick={copyReferralCode} className="p-1.5 hover:bg-border rounded-lg">{copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-muted-foreground" />}</button>
            </div>

            <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-xl p-3 mb-3">
              <Link2 size={14} className="text-primary shrink-0" />
              <span className="flex-1 text-xs font-mono text-primary truncate">{referralLink}</span>
              <button onClick={copyReferralLink} className="p-1.5 hover:bg-border rounded-lg shrink-0">
                {linkCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-muted-foreground" />}
              </button>
            </div>

            <div className="mb-4">
              <SocialShareButtons text={`${settings.appName} এ জয়েন করুন!`} url={referralLink} size="sm" />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">রেফারেল কোড ব্যবহার করুন</Label>
              <div className="flex gap-2">
                <Input value={referralInput} onChange={e => setReferralInput(e.target.value)} placeholder="রেফারেল কোড দিন" className="flex-1 h-9 text-sm" disabled={!!userData?.referredBy} />
                <Button size="sm" onClick={handleBindReferral} className="h-9" disabled={!!userData?.referredBy}>Apply</Button>
              </div>
              {referralMsg && <p className="text-xs text-green-600">{referralMsg}</p>}
              {referralErr && <p className="text-xs text-destructive">{referralErr}</p>}
              {userData?.referredBy && <p className="text-xs text-muted-foreground">✓ Referred by: {userData.referredBy}</p>}
            </div>
          </div>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h2 className="font-semibold text-sm">Personal Information</h2>
            <div className="space-y-1.5"><Label className="text-xs">Full Name</Label><Input value={profileForm.displayName} onChange={e => setProfileForm(f => ({ ...f, displayName: e.target.value }))} className="h-10" /></div>
            <div className="space-y-1.5"><Label className="text-xs">Email</Label><Input defaultValue={user.email || ''} disabled className="h-10 bg-muted" /></div>
            <div className="space-y-1.5"><Label className="text-xs">Phone</Label><Input value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} placeholder="+880" className="h-10" /></div>
            <div className="space-y-1.5"><Label className="text-xs">Delivery Address</Label><Input value={profileForm.deliveryAddress} onChange={e => setProfileForm(f => ({ ...f, deliveryAddress: e.target.value }))} placeholder="আপনার ডেলিভারি ঠিকানা" className="h-10" /></div>
            <Button size="sm" className="w-full gap-2" onClick={handleSaveProfile} disabled={profileSaving}><Save size={14} /> {profileSaving ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-3">
          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            {[
              { label: 'Privacy Policy', sub: 'প্রাইভেসি পলিসি দেখুন', path: '/privacy-policy', icon: Shield },
              { label: 'Terms & Conditions', sub: 'শর্তাবলী দেখুন', path: '/terms', icon: FileText },
              { label: 'Return Policy', sub: 'রিটার্ন পলিসি দেখুন', path: '/return-policy', icon: RotateCcw },
              { label: 'Support', sub: 'সাহায্য কেন্দ্র', path: '/support', icon: Settings },
            ].map(item => (
              <Link key={item.label} to={item.path} className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors text-left">
                <div className="flex items-center gap-3"><item.icon size={16} className="text-muted-foreground" /><div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-muted-foreground">{item.sub}</p></div></div>
                <span className="text-muted-foreground text-xs">›</span>
              </Link>
            ))}
          </div>
          <Button variant="destructive" className="w-full h-11" onClick={logout}>Logout</Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
