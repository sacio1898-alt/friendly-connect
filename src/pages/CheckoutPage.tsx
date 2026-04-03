import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings, validateCoupon } from '@/hooks/useFirestoreData';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Check, MapPin, CreditCard, ChevronRight, Smartphone, Copy, ImageIcon, Tag, X, Gift, Shield, CheckCircle, Monitor, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

// ── Validation helpers ──────────────────────────────────────────────────────
const BD_PHONE_REGEX = /^(?:\+?880|0)1[3-9]\d{8}$/;
const TRXID_REGEX = /^[A-Za-z0-9]{6,20}$/;

function validatePhone(phone: string): string | null {
  const cleaned = phone.replace(/[\s-]/g, '');
  if (!cleaned) return 'ফোন নম্বর দিন';
  if (!BD_PHONE_REGEX.test(cleaned)) return 'সঠিক বাংলাদেশি নম্বর দিন (01XXXXXXXXX)';
  return null;
}

function validateTrxId(id: string): string | null {
  const cleaned = id.trim();
  if (!cleaned) return null; // optional if screenshot given
  if (!TRXID_REGEX.test(cleaned)) return 'Transaction ID ৬-২০ অক্ষরের হতে হবে (শুধু letters/numbers)';
  return null;
}

function validateName(name: string): string | null {
  const t = name.trim();
  if (!t) return 'নাম দিন';
  if (t.length < 3) return 'নাম কমপক্ষে ৩ অক্ষরের হতে হবে';
  if (t.length > 100) return 'নাম অনেক বড়';
  return null;
}

function validateAddress(address: string): string | null {
  const t = address.trim();
  if (!t) return 'ঠিকানা দিন';
  if (t.length < 10) return 'সম্পূর্ণ ঠিকানা দিন (কমপক্ষে ১০ অক্ষর)';
  return null;
}

export default function CheckoutPage() {
  const { items: cartItems, total: cartTotal, clearCart } = useCart();
  const { user, userData, refreshUserData } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const stateItems = location.state?.selectedItems || cartItems;
  const isDigitalOrder = location.state?.isDigitalOrder || stateItems.every((i: any) => i.isDigital);
  const stateDiscount = location.state?.discount || 0;
  const stateCouponCode = location.state?.couponCode || '';
  const stateCouponData = location.state?.couponData || null;

  const subtotal = stateItems.reduce((sum: number, i: any) => sum + i.price * (i.quantity || 1), 0);

  const [shipping, setShipping] = useState({ name: '', phone: '', address: '' });
  
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'mobile'>(isDigitalOrder ? 'mobile' : 'cod');
  const [mobilePayment, setMobilePayment] = useState({ method: 'bKash', number: '', transactionId: '', screenshot: '' });

  const deliveryAreas = settings.deliveryAreas || [];
  const [selectedAreaIndex, setSelectedAreaIndex] = useState<number>(-1);

  const deliveryCharge = isDigitalOrder ? 0 : (selectedAreaIndex >= 0 ? (deliveryAreas[selectedAreaIndex]?.charge || 0) : 0);

  let discountAmount = 0;
  let effectiveCouponCode = stateCouponCode;
  if (appliedCoupon) {
    if (appliedCoupon.discountPercent > 0) {
      discountAmount = Math.min((subtotal * appliedCoupon.discountPercent) / 100, appliedCoupon.maxDiscount || Infinity);
    } else if (appliedCoupon.maxDiscount > 0) {
      discountAmount = Math.min(appliedCoupon.maxDiscount, subtotal);
    }
    effectiveCouponCode = appliedCoupon.code;
  } else if (stateDiscount > 0) {
    discountAmount = (subtotal * stateDiscount) / 100;
  }
  const finalTotal = subtotal - discountAmount + deliveryCharge;

  const steps = isDigitalOrder
    ? [{ id: 1, label: 'Contact', icon: MapPin }, { id: 2, label: 'Payment', icon: CreditCard }]
    : [{ id: 1, label: 'Shipping', icon: MapPin }, { id: 2, label: 'Payment', icon: CreditCard }];

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        if (userSnap.exists()) {
          const data = userSnap.data();
          setShipping(s => ({
            ...s,
            name: s.name || data.displayName || user.displayName || '',
            phone: s.phone || data.phone || '',
            address: s.address || data.deliveryAddress || '',
          }));
        }
      };
      fetchProfile();
    }
  }, [user]);

  const applyCouponCode = async () => {
    if (!couponCode.trim()) return;
    setCouponError('');
    setCouponLoading(true);
    try {
      const found = await validateCoupon(couponCode.trim(), user?.uid);
      if (found) setAppliedCoupon(found);
      else setCouponError('Invalid or expired coupon code');
    } finally { setCouponLoading(false); }
  };

  const [uploading, setUploading] = useState(false);

  const uploadToImgbb = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setErrors(e => ({ ...e, screenshot: 'ফাইল সাইজ 5MB এর বেশি হতে পারবে না' }));
      return;
    }
    setUploading(true);
    setErrors(e => ({ ...e, screenshot: '' }));
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('https://api.imgbb.com/1/upload?key=0017c424481e045d90f4deee3cad4051', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setMobilePayment(m => ({ ...m, screenshot: data.data.url }));
      }
    } catch (e) {
      setErrors(er => ({ ...er, screenshot: 'আপলোড ব্যর্থ হয়েছে' }));
    } finally {
      setUploading(false);
    }
  };

  // ── Step 1 validation ─────────────────────────────────────────────────────
  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};
    const nameErr = validateName(shipping.name);
    if (nameErr) errs.name = nameErr;
    const phoneErr = validatePhone(shipping.phone);
    if (phoneErr) errs.phone = phoneErr;
    if (!isDigitalOrder) {
      const addrErr = validateAddress(shipping.address);
      if (addrErr) errs.address = addrErr;
      if (deliveryAreas.length > 0 && selectedAreaIndex === -1) errs.area = 'ডেলিভারি এরিয়া সিলেক্ট করুন';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Step 2 (payment) validation ───────────────────────────────────────────
  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};
    if (paymentMethod === 'mobile') {
      const pErr = validatePhone(mobilePayment.number);
      if (pErr) errs.paymentPhone = pErr;
      const tErr = validateTrxId(mobilePayment.transactionId);
      if (tErr) errs.trxId = tErr;
      if (!mobilePayment.transactionId.trim() && !mobilePayment.screenshot) {
        errs.proof = 'Transaction ID অথবা Screenshot — যেকোনো একটি দিন';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const placeOrder = async () => {
    if (!user) { navigate('/auth'); return; }
    if (!validateStep2()) return;
    setLoading(true);
    try {
      const earnedPoints = Math.floor(finalTotal / 10);
      const orderData = {
        userId: user.uid,
        userEmail: user.email || '',
        userName: shipping.name.trim(),
        items: stateItems.map((item: any) => ({
          productId: item.productId || '',
          name: item.name || '',
          price: Number(item.price) || 0,
          originalPrice: Number(item.originalPrice) || 0,
          image: item.image || '',
          quantity: Number(item.quantity) || 1,
          selectedSize: item.selectedSize || '',
          selectedColor: item.selectedColor || '',
          isDigital: !!item.isDigital,
        })),
        shipping: {
          name: shipping.name.trim(),
          phone: shipping.phone.replace(/[\s-]/g, ''),
          address: isDigitalOrder ? 'Digital Product' : shipping.address.trim(),
        },
        delivery: isDigitalOrder ? { id: 'digital', label: 'Digital Delivery', time: 'Instant', price: 0 } : {
          id: 'standard',
          label: selectedAreaIndex >= 0 ? deliveryAreas[selectedAreaIndex]?.name || 'Delivery' : 'Delivery',
          time: '',
          price: Number(deliveryCharge) || 0,
        },
        payment: {
          method: paymentMethod || 'mobile',
          ...(paymentMethod === 'mobile' ? {
            method2: mobilePayment.method || '',
            number: mobilePayment.number.replace(/[\s-]/g, ''),
            transactionId: mobilePayment.transactionId.trim(),
            screenshot: mobilePayment.screenshot || '',
          } : {}),
        },
        subtotal: Number(subtotal) || 0,
        discount: appliedCoupon ? (Number(appliedCoupon.discountPercent) || 0) : (Number(stateDiscount) || 0),
        discountAmount: Number(discountAmount) || 0,
        couponCode: effectiveCouponCode || '',
        deliveryCharge: Number(deliveryCharge) || 0,
        total: Number(finalTotal) || 0,
        earnedPoints: Number(earnedPoints) || 0,
        status: 'processing',
        statusHistory: [{ status: 'processing', timestamp: new Date().toISOString() }],
        isDigitalOrder: !!isDigitalOrder,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);

      if (earnedPoints > 0) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          const currentPoints = userSnap.data()?.loyaltyPoints || 0;
          await updateDoc(userRef, { loyaltyPoints: currentPoints + earnedPoints });
        } catch {}
      }

      const couponToDelete = appliedCoupon || stateCouponData;
      if (couponToDelete?.id && couponToDelete?.userId) {
        try {
          const { deleteCoupon } = await import('@/hooks/useFirestoreData');
          await deleteCoupon(couponToDelete.id);
        } catch {}
      }

      await clearCart();
      if (user) refreshUserData();
      navigate('/order-success', { state: { orderId: docRef.id, earnedPoints } });
    } catch (err: any) {
      alert('অর্ডার সেভ করতে সমস্যা হয়েছে: ' + (err?.message || 'Unknown error'));
    } finally { setLoading(false); }
  };

  const sf = (k: string, v: string) => {
    setShipping(s => ({ ...s, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };
  const copyNum = (num: string) => navigator.clipboard.writeText(num);

  const paymentStep = 2;

  const FieldError = ({ field }: { field: string }) => {
    if (!errors[field]) return null;
    return (
      <p className="text-destructive text-xs mt-1 flex items-center gap-1">
        <AlertCircle size={11} /> {errors[field]}
      </p>
    );
  };

  return (
    <div className="max-w-screen-md mx-auto px-4 py-5 pb-nav lg:pb-8">
      <h1 className="font-bold text-xl mb-2">Checkout</h1>
      <p className="text-sm text-muted-foreground mb-5">
        {isDigitalOrder ? 'ডিজিটাল প্রোডাক্ট অর্ডার নিশ্চিত করুন' : 'আপনার অর্ডার নিশ্চিত করুন'}
      </p>

      {isDigitalOrder && (
        <div className="mb-4 bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center gap-2">
          <Monitor size={16} className="text-primary shrink-0" />
          <p className="text-xs text-primary font-medium">এটি একটি ডিজিটাল প্রোডাক্ট। পেমেন্ট কনফার্ম হলে ডাউনলোড লিংক পাবেন।</p>
        </div>
      )}

      {/* Step Indicator */}
      <div className="flex items-center mb-6">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${step > s.id ? 'bg-green-500 text-white' : step === s.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {step > s.id ? <Check size={16} /> : <s.icon size={16} />}
              </div>
              <span className={`text-[11px] mt-1 font-medium ${step >= s.id ? 'text-foreground' : 'text-muted-foreground'}`}>{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 mb-4 mx-2 ${step > s.id ? 'bg-green-500' : 'bg-border'}`} />}
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="mb-5 bg-card border border-border rounded-xl overflow-hidden">
        <details open>
          <summary className="p-4 text-sm font-semibold cursor-pointer flex justify-between items-center select-none">
            <span>Order Summary ({stateItems.length} items)</span>
            <span className="text-primary font-bold">৳{finalTotal.toFixed(0)}</span>
          </summary>
          <div className="px-4 pb-4 space-y-3 border-t border-border">
            <div className="space-y-2 pt-3">
              {stateItems.map((item: any, idx: number) => (
                <div key={`${item.productId}-${idx}`} className="flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{item.name}</p>
                    {item.isDigital && <span className="text-[10px] text-primary font-medium">Digital</span>}
                    {(item.selectedSize || item.selectedColor) && <p className="text-[10px] text-muted-foreground">{item.selectedColor} {item.selectedSize}</p>}
                    <p className="text-xs text-muted-foreground">৳{item.price} × {item.quantity || 1}</p>
                  </div>
                  <span className="text-xs font-bold">৳{(item.price * (item.quantity || 1)).toFixed(0)}</span>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-border space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>৳{subtotal.toFixed(0)}</span></div>
              {!isDigitalOrder && <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>৳{deliveryCharge}</span></div>}
              {discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-৳{discountAmount.toFixed(0)}</span></div>}
              <div className="flex justify-between font-bold text-base border-t border-border pt-2"><span>Total</span><span className="text-primary">৳{finalTotal.toFixed(0)}</span></div>
            </div>
          </div>
        </details>
      </div>

      {/* Step 1: Shipping / Contact */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <h2 className="font-bold">{isDigitalOrder ? 'Contact Information' : 'Shipping Address'}</h2>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Full Name *</Label>
              <Input value={shipping.name} onChange={e => sf('name', e.target.value)} placeholder="আপনার পূর্ণ নাম" maxLength={100} />
              <FieldError field="name" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone Number *</Label>
              <Input value={shipping.phone} onChange={e => sf('phone', e.target.value)} placeholder="01XXXXXXXXX" maxLength={15} inputMode="tel" />
              <FieldError field="phone" />
            </div>
            {!isDigitalOrder && (
              <>
                <div className="space-y-1.5">
                  <Label>Detailed Address *</Label>
                  <Input value={shipping.address} onChange={e => sf('address', e.target.value)} placeholder="বাড়ি নং, রোড, এলাকা, জেলা" maxLength={300} />
                  <FieldError field="address" />
                </div>
                {deliveryAreas.length > 0 && (
                  <div className="space-y-2">
                    <Label>Delivery Area *</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {deliveryAreas.map((area, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => { setSelectedAreaIndex(i); setErrors(e => ({ ...e, area: '' })); }}
                          className={`relative flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition-all ${
                            selectedAreaIndex === i
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-border bg-card hover:border-primary/40 hover:bg-muted/40'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-sm font-semibold truncate">{area.name}</span>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ml-1 transition-all ${
                              selectedAreaIndex === i ? 'border-primary' : 'border-muted-foreground/40'
                            }`}>
                              {selectedAreaIndex === i && <div className="w-2 h-2 rounded-full bg-primary" />}
                            </div>
                          </div>
                          <span className={`text-xs font-bold ${selectedAreaIndex === i ? 'text-primary' : 'text-muted-foreground'}`}>
                            ৳{area.charge}
                          </span>
                        </button>
                      ))}
                    </div>
                    <FieldError field="area" />
                  </div>
                )}
              </>
            )}
          </div>
          <Button className="w-full h-12 font-semibold" onClick={() => { if (validateStep1()) setStep(2); }}>
            Continue <ChevronRight size={16} className="ml-2" />
          </Button>
        </motion.div>
      )}


      {/* Payment Step */}
      {step === paymentStep && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <h2 className="font-bold">Payment Method</h2>

          {/* Coupon */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><Tag size={14} className="text-primary" /><p className="text-sm font-semibold">Apply Coupon</p></div>
              <button onClick={() => navigate('/profile?tab=rewards')} className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"><Gift size={12} /> Get Coupon</button>
            </div>
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <span className="text-green-600 text-sm font-semibold flex items-center gap-1"><Check size={14} /> {appliedCoupon.code} applied (-৳{discountAmount.toFixed(0)})</span>
                <button onClick={() => setAppliedCoupon(null)} className="text-muted-foreground hover:text-destructive"><X size={14} /></button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <Input placeholder="Coupon code" value={couponCode} onChange={e => setCouponCode(e.target.value)} className="h-9 text-sm flex-1" maxLength={30} />
                  <Button size="sm" variant="outline" onClick={applyCouponCode} disabled={couponLoading} className="h-9">Apply</Button>
                </div>
                {couponError && <p className="text-destructive text-xs mt-2">{couponError}</p>}
                {stateCouponCode && !appliedCoupon && <p className="text-xs text-muted-foreground mt-1">Cart coupon: {stateCouponCode} applied</p>}
              </>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {!isDigitalOrder && (
              <button
                onClick={() => setPaymentMethod('cod')}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${paymentMethod === 'cod' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/40'}`}
              >
                <img src="/cod.png" alt="Cash on Delivery" className="h-10 w-auto object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-primary' : 'border-muted-foreground/40'}`}>
                  {paymentMethod === 'cod' && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
              </button>
            )}
            {['bKash', 'Nagad'].map(m => (
              <button
                key={m}
                onClick={() => { setPaymentMethod('mobile'); setMobilePayment(p => ({ ...p, method: m })); }}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${paymentMethod === 'mobile' && mobilePayment.method === m ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/40'}`}
              >
                <img src={m === 'bKash' ? '/bkash.png' : '/nagad.png'} alt={m} className="h-10 w-auto object-contain" />
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'mobile' && mobilePayment.method === m ? 'border-primary' : 'border-muted-foreground/40'}`}>
                  {paymentMethod === 'mobile' && mobilePayment.method === m && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
              </button>
            ))}
          </div>

          {paymentMethod === 'mobile' && (
            <div className="bg-muted/50 rounded-xl p-4 space-y-4 border border-border">

              <div className="bg-card rounded-xl p-3 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Send Money to this number:</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg">{mobilePayment.method === 'bKash' ? (settings.bkashNumber || 'Not set') : (settings.nagadNumber || 'Not set')}</span>
                  <button onClick={() => copyNum(mobilePayment.method === 'bKash' ? settings.bkashNumber : settings.nagadNumber)} className="p-2 hover:bg-muted rounded-lg"><Copy size={14} /></button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Amount: <span className="font-bold text-primary">৳{finalTotal.toFixed(0)}</span></p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Payment Number *</Label>
                <Input
                  value={mobilePayment.number}
                  onChange={e => { setMobilePayment(m => ({ ...m, number: e.target.value })); setErrors(er => ({ ...er, paymentPhone: '' })); }}
                  placeholder="01XXXXXXXXX"
                  className="h-9 text-sm"
                  maxLength={15}
                  inputMode="tel"
                />
                <FieldError field="paymentPhone" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Transaction ID</Label>
                <Input
                  value={mobilePayment.transactionId}
                  onChange={e => { setMobilePayment(m => ({ ...m, transactionId: e.target.value })); setErrors(er => ({ ...er, trxId: '', proof: '' })); }}
                  placeholder="TrxID (e.g. ABC123XYZ)"
                  className="h-9 text-sm"
                  maxLength={20}
                />
                <FieldError field="trxId" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Payment Screenshot</Label>
                {mobilePayment.screenshot ? (
                  <div className="relative group w-fit">
                    <img src={mobilePayment.screenshot} className="w-32 h-32 rounded-xl object-cover border-2 border-primary/30 shadow-sm" />
                    <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => setMobilePayment(m => ({ ...m, screenshot: '' }))} className="p-2 bg-destructive text-destructive-foreground rounded-full shadow-lg hover:scale-110 transition-transform">
                        <X size={14} />
                      </button>
                    </div>
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                      <CheckCircle size={12} className="text-white" />
                    </div>
                  </div>
                ) : (
                  <label className={`relative flex flex-col items-center justify-center gap-3 cursor-pointer border-2 border-dashed rounded-xl p-6 transition-all ${uploading ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-primary/5'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${uploading ? 'bg-primary/20' : 'bg-muted'}`}>
                      {uploading ? (
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ImageIcon size={20} className="text-muted-foreground" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">{uploading ? 'আপলোড হচ্ছে...' : 'Screenshot আপলোড করুন'}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">JPG, PNG — Max 5MB</p>
                    </div>
                    <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={e => { const f = e.target.files?.[0]; if (f) uploadToImgbb(f); }} />
                  </label>
                )}
                <FieldError field="screenshot" />
              </div>
              <FieldError field="proof" />
              <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Shield size={10} /> Transaction ID অথবা Screenshot — যেকোনো একটি দিন।</p>
            </div>
          )}

          {/* Order Summary Final */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>৳{subtotal.toFixed(0)}</span></div>
            {!isDigitalOrder && <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>৳{deliveryCharge}</span></div>}
            {discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-৳{discountAmount.toFixed(0)}</span></div>}
            <div className="flex justify-between font-bold text-base border-t border-border pt-2"><span>Total</span><span className="text-primary">৳{finalTotal.toFixed(0)}</span></div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 h-12" onClick={() => setStep(1)}>Back</Button>
            <Button className="flex-1 h-12 font-semibold" onClick={placeOrder} disabled={loading}>
              {loading ? 'Processing...' : `Place Order — ৳${finalTotal.toFixed(0)}`}
            </Button>
          </div>

          <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground mt-2">
            <Shield size={12} /> <span>আপনার তথ্য সম্পূর্ণ নিরাপদ</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
