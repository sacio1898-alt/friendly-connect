import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, where, getDocs, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  categoryId: string;
  brand: string;
  rating: number;
  reviewCount: number;
  stock: number;
  description: string;
  sizes?: string[];
  colors?: string[];
  tags: string[];
  featured: boolean;
  sold: number;
  order?: number;
  createdAt: any;
  // Digital product fields
  isDigital?: boolean;
  demoUrl?: string;
  sourceCodeUrl?: string;
  filePassword?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  image: string;
  productCount: number;
  order?: number;
}

export interface Banner {
  id: string;
  image: string;
  link: string;
  active: boolean;
  order?: number;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  minOrder: number;
  maxDiscount: number;
  active: boolean;
  expiresAt?: any;
  userId?: string;
  pointsUsed?: number;
}

export interface Order {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  items: any[];
  shipping: any;
  delivery: any;
  payment: any;
  subtotal: number;
  deliveryCharge: number;
  discount?: number;
  discountAmount?: number;
  couponCode?: string;
  total: number;
  earnedPoints?: number;
  status: string;
  statusHistory: any[];
  createdAt: any;
  deliveredAt?: any;
  isDigitalOrder?: boolean;
}

export interface DeliveryArea {
  name: string;
  charge: number;
}

export interface AppSettings {
  appName: string;
  appLogo: string;
  phone: string;
  whatsapp: string;
  email: string;
  bkashNumber: string;
  nagadNumber: string;
  location: string;
  deliveryCharge: number;
  pointsPerTaka: number;
  deliveryAreas: DeliveryArea[];
  facebookPageId?: string;
  messengerEnabled?: boolean;
  whatsappEnabled?: boolean;
  callEnabled?: boolean;
  chatbotEnabled?: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  appName: 'ZupraMart',
  appLogo: '/logo.png',
  phone: '',
  whatsapp: '',
  email: '',
  bkashNumber: '',
  nagadNumber: '',
  location: '',
  deliveryCharge: 60,
  pointsPerTaka: 10,
  deliveryAreas: [],
};

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      const prods = snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
      prods.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
      setProducts(prods);
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);
  return { products, loading };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'categories'), snap => {
      const cats = snap.docs.map(d => ({ id: d.id, ...d.data() } as Category));
      cats.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
      setCategories(cats);
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);
  return { categories, loading };
}

export function useBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'banners'), snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Banner));
      setBanners(data.filter(b => b.active));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);
  return { banners, loading };
}

export function useCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'coupons'), snap => {
      setCoupons(snap.docs.map(d => ({ id: d.id, ...d.data() } as Coupon)));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);
  return { coupons, loading };
}

export function useMyCoupons(userId?: string) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!userId) { setLoading(false); setCoupons([]); return; }
    const q = query(collection(db, 'coupons'), where('userId', '==', userId), where('active', '==', true));
    const unsub = onSnapshot(q, snap => {
      setCoupons(snap.docs.map(d => ({ id: d.id, ...d.data() } as Coupon)));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [userId]);
  return { coupons, loading };
}

export function useOrders(userId?: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!userId) { setLoading(false); setOrders([]); return; }
    const q = query(collection(db, 'orders'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
      setLoading(false);
    }, () => {
      const q2 = query(collection(db, 'orders'), where('userId', '==', userId));
      onSnapshot(q2, snap2 => {
        const sorted = snap2.docs.map(d => ({ id: d.id, ...d.data() } as Order))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setOrders(sorted);
        setLoading(false);
      }, () => setLoading(false));
    });
    return unsub;
  }, [userId]);
  return { orders, loading };
}

export function useAllOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
      setLoading(false);
    }, () => {
      onSnapshot(collection(db, 'orders'), snap2 => {
        const sorted = snap2.docs.map(d => ({ id: d.id, ...d.data() } as Order))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setOrders(sorted);
        setLoading(false);
      }, () => setLoading(false));
    });
    return unsub;
  }, []);
  return { orders, loading };
}

export function useAllUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), snap => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);
  return { users, loading };
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'app'), snap => {
      if (snap.exists()) {
        setSettings({ ...DEFAULT_SETTINGS, ...snap.data() } as AppSettings);
      }
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);
  return { settings, loading };
}

// CRUD operations
export const addProduct = (data: Omit<Product, 'id'>) => addDoc(collection(db, 'products'), { ...data, createdAt: serverTimestamp() });
export const updateProduct = (id: string, data: Partial<Product>) => updateDoc(doc(db, 'products', id), data);
export const deleteProduct = (id: string) => deleteDoc(doc(db, 'products', id));

export const addCategory = (data: Omit<Category, 'id'>) => addDoc(collection(db, 'categories'), data);
export const updateCategory = (id: string, data: Partial<Category>) => updateDoc(doc(db, 'categories', id), data);
export const deleteCategory = (id: string) => deleteDoc(doc(db, 'categories', id));

export const addBanner = (data: Omit<Banner, 'id'>) => addDoc(collection(db, 'banners'), data);
export const updateBanner = (id: string, data: Partial<Banner>) => updateDoc(doc(db, 'banners', id), data);
export const deleteBanner = (id: string) => deleteDoc(doc(db, 'banners', id));

export const addCoupon = (data: Omit<Coupon, 'id'>) => addDoc(collection(db, 'coupons'), data);
export const updateCoupon = (id: string, data: Partial<Coupon>) => updateDoc(doc(db, 'coupons', id), data);
export const deleteCoupon = (id: string) => deleteDoc(doc(db, 'coupons', id));

export const updateOrderStatus = (id: string, status: string) =>
  updateDoc(doc(db, 'orders', id), {
    status,
    statusHistory: [{ status, timestamp: new Date().toISOString() }],
    ...(status === 'delivered' ? { deliveredAt: serverTimestamp() } : {}),
  });

export const updateSettings = (data: Partial<AppSettings>) => setDoc(doc(db, 'settings', 'app'), data, { merge: true });

export const findUserByReferralCode = async (code: string) => {
  const q = query(collection(db, 'users'), where('referralCode', '==', code));
  const snap = await getDocs(q);
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
};

export const bindReferral = async (userId: string, referrerCode: string) => {
  const referrer = await findUserByReferralCode(referrerCode);
  if (!referrer || referrer.id === userId) throw new Error('Invalid referral code');
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists() && userSnap.data().referredBy) throw new Error('Already used a referral code');
  await updateDoc(userRef, { referredBy: referrerCode });
  await updateDoc(doc(db, 'users', referrer.id), { loyaltyPoints: (referrer as any).loyaltyPoints + 50 });
  await updateDoc(userRef, { loyaltyPoints: (userSnap.data()?.loyaltyPoints || 0) + 50 });
};

export const validateCoupon = async (code: string, userId?: string) => {
  const upperCode = code.toUpperCase();
  const q = query(collection(db, 'coupons'), where('code', '==', upperCode), where('active', '==', true));
  const snap = await getDocs(q);
  if (!snap.empty) {
    const coupon = { id: snap.docs[0].id, ...snap.docs[0].data() } as Coupon;
    if (coupon.userId && coupon.userId !== userId) return null;
    return coupon;
  }
  return null;
};

export const generateLoyaltyCoupon = async (userId: string, pointsToUse: number, pointsPerTaka: number) => {
  if (pointsToUse <= 0 || pointsPerTaka <= 0) throw new Error('Invalid points');
  const discountTaka = Math.floor(pointsToUse / pointsPerTaka);
  if (discountTaka <= 0) throw new Error('Not enough points');

  const existing = query(collection(db, 'coupons'), where('userId', '==', userId), where('active', '==', true));
  const existingSnap = await getDocs(existing);
  if (!existingSnap.empty) {
    return { id: existingSnap.docs[0].id, ...existingSnap.docs[0].data() } as Coupon;
  }

  const code = `LOYALTY-${userId.slice(0, 6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  const couponData: Omit<Coupon, 'id'> = {
    code,
    discountPercent: 0,
    minOrder: 0,
    maxDiscount: discountTaka,
    active: true,
    userId,
    pointsUsed: pointsToUse,
  };
  const ref = await addDoc(collection(db, 'coupons'), couponData);
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  const currentPoints = userSnap.data()?.loyaltyPoints || 0;
  await updateDoc(userRef, { loyaltyPoints: Math.max(0, currentPoints - pointsToUse) });
  return { id: ref.id, ...couponData };
};
