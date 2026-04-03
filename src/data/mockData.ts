// Mock data for demonstration
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
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  image: string;
  productCount: number;
  parentId?: string;
}

export interface Banner {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  link: string;
  active: boolean;
}

export const mockCategories: Category[] = [
  { id: 'electronics', name: 'Electronics', icon: '📱', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200', productCount: 156 },
  { id: 'fashion', name: 'Fashion', icon: '👗', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=200', productCount: 234 },
  { id: 'home', name: 'Home & Living', icon: '🏠', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200', productCount: 89 },
  { id: 'sports', name: 'Sports', icon: '⚽', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200', productCount: 67 },
  { id: 'beauty', name: 'Beauty', icon: '💄', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200', productCount: 112 },
  { id: 'books', name: 'Books', icon: '📚', image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=200', productCount: 45 },
  { id: 'toys', name: 'Toys', icon: '🧸', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200', productCount: 78 },
  { id: 'food', name: 'Food', icon: '🍎', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200', productCount: 34 },
];

export const mockBanners: Banner[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800',
    title: 'Summer Sale',
    subtitle: 'Up to 70% off on all items',
    link: '/category/fashion',
    active: true,
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800',
    title: 'New Arrivals',
    subtitle: 'Explore the latest tech gadgets',
    link: '/category/electronics',
    active: true,
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
    title: 'Fashion Week',
    subtitle: 'Trendy styles just for you',
    link: '/category/fashion',
    active: true,
  },
];

export const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Wireless Bluetooth Headphones Pro',
    price: 89.99,
    originalPrice: 149.99,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600',
    ],
    category: 'Electronics',
    categoryId: 'electronics',
    brand: 'SoundMax',
    rating: 4.5,
    reviewCount: 234,
    stock: 50,
    description: 'Premium wireless headphones with 40-hour battery life, active noise cancellation, and crystal-clear sound quality. Perfect for music lovers and professionals.',
    colors: ['Black', 'White', 'Blue'],
    tags: ['wireless', 'bluetooth', 'headphones'],
    featured: true,
    sold: 1205,
    createdAt: '2024-01-01',
  },
  {
    id: 'p2',
    name: 'Smart Watch Series X',
    price: 199.99,
    originalPrice: 299.99,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
      'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600',
    ],
    category: 'Electronics',
    categoryId: 'electronics',
    brand: 'TechWear',
    rating: 4.7,
    reviewCount: 456,
    stock: 30,
    description: 'Advanced smartwatch with health monitoring, GPS, and 7-day battery life.',
    colors: ['Silver', 'Black', 'Gold'],
    tags: ['smartwatch', 'fitness', 'wearable'],
    featured: true,
    sold: 892,
    createdAt: '2024-01-15',
  },
  {
    id: 'p3',
    name: 'Men\'s Classic Slim Fit Shirt',
    price: 34.99,
    originalPrice: 59.99,
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600',
      'https://images.unsplash.com/photo-1604006852748-903fccbc4019?w=600',
    ],
    category: 'Fashion',
    categoryId: 'fashion',
    brand: 'StyleCo',
    rating: 4.3,
    reviewCount: 128,
    stock: 100,
    description: 'Classic slim fit shirt made from premium cotton blend. Available in multiple colors and sizes.',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White', 'Blue', 'Black', 'Gray'],
    tags: ['shirt', 'formal', 'casual'],
    featured: true,
    sold: 567,
    createdAt: '2024-02-01',
  },
  {
    id: 'p4',
    name: 'Running Shoes Ultra Boost',
    price: 119.99,
    originalPrice: 179.99,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
      'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600',
    ],
    category: 'Sports',
    categoryId: 'sports',
    brand: 'SportsPro',
    rating: 4.6,
    reviewCount: 312,
    stock: 45,
    description: 'High-performance running shoes with responsive cushioning and breathable mesh upper.',
    sizes: ['7', '8', '9', '10', '11', '12'],
    colors: ['Black/White', 'Blue/Orange', 'Red/Black'],
    tags: ['running', 'shoes', 'sports'],
    featured: true,
    sold: 734,
    createdAt: '2024-02-15',
  },
  {
    id: 'p5',
    name: 'Luxury Skincare Set',
    price: 79.99,
    originalPrice: 120.00,
    images: [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600',
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600',
    ],
    category: 'Beauty',
    categoryId: 'beauty',
    brand: 'GlowUp',
    rating: 4.8,
    reviewCount: 189,
    stock: 60,
    description: 'Complete skincare routine set including cleanser, toner, serum, and moisturizer.',
    tags: ['skincare', 'beauty', 'luxury'],
    featured: true,
    sold: 423,
    createdAt: '2024-03-01',
  },
  {
    id: 'p6',
    name: 'Ergonomic Office Chair',
    price: 249.99,
    originalPrice: 399.99,
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',
      'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600',
    ],
    category: 'Home & Living',
    categoryId: 'home',
    brand: 'ComfortPlus',
    rating: 4.4,
    reviewCount: 267,
    stock: 20,
    description: 'Ergonomic office chair with lumbar support, adjustable armrests, and breathable mesh back.',
    colors: ['Black', 'Gray', 'Blue'],
    tags: ['chair', 'office', 'ergonomic'],
    featured: false,
    sold: 298,
    createdAt: '2024-03-15',
  },
  {
    id: 'p7',
    name: '4K Webcam Pro',
    price: 69.99,
    originalPrice: 99.99,
    images: [
      'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=600',
    ],
    category: 'Electronics',
    categoryId: 'electronics',
    brand: 'CamTech',
    rating: 4.2,
    reviewCount: 145,
    stock: 35,
    description: '4K Ultra HD webcam with built-in microphone, auto-focus, and wide-angle lens.',
    tags: ['webcam', 'streaming', 'work from home'],
    featured: false,
    sold: 456,
    createdAt: '2024-04-01',
  },
  {
    id: 'p8',
    name: 'Women\'s Floral Summer Dress',
    price: 44.99,
    originalPrice: 74.99,
    images: [
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600',
    ],
    category: 'Fashion',
    categoryId: 'fashion',
    brand: 'FloraStyle',
    rating: 4.5,
    reviewCount: 203,
    stock: 75,
    description: 'Light and breezy floral summer dress perfect for any casual occasion.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Pink', 'Blue', 'Yellow'],
    tags: ['dress', 'summer', 'casual'],
    featured: false,
    sold: 612,
    createdAt: '2024-04-15',
  },
];

export const mockReviews = [
  { id: 'r1', userId: 'u1', userName: 'John D.', avatar: 'https://i.pravatar.cc/40?img=1', rating: 5, comment: 'Excellent product! Exactly as described. Fast shipping too.', date: '2024-05-01', helpful: 12 },
  { id: 'r2', userId: 'u2', userName: 'Sarah M.', avatar: 'https://i.pravatar.cc/40?img=5', rating: 4, comment: 'Great quality for the price. Would definitely recommend.', date: '2024-04-28', helpful: 8 },
  { id: 'r3', userId: 'u3', userName: 'Mike R.', avatar: 'https://i.pravatar.cc/40?img=3', rating: 5, comment: 'Love this! The build quality is outstanding.', date: '2024-04-20', helpful: 15 },
  { id: 'r4', userId: 'u4', userName: 'Emily K.', avatar: 'https://i.pravatar.cc/40?img=9', rating: 3, comment: 'Good product but delivery was slow.', date: '2024-04-15', helpful: 3 },
];
