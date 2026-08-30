export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  sortOrder: number;
  productCount?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string | null;
  price: number;
  comparePrice?: number | null;
  costPrice?: number | null;
  stock: number;
  sku?: string | null;
  materials?: string | null;
  dimensions?: string | null;
  weightGrams?: number | null;
  images: string[]; // parsed array of URLs
  isFeatured: boolean;
  isActive: boolean;
  categoryId: string;
  category?: Category;
  createdAt: string;
  rating?: number;
  reviewCount?: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage?: string | null;
  unitPrice: number;
  quantity: number;
}

export type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  shippingAddress: string;
  city: string;
  postalCode: string;
  province: string;
  country: string;
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: string;
  paypalOrderId?: string | null;
  trackingNumber?: string | null;
  notes?: string | null;
  createdAt: string;
  items: OrderItem[];
}

export interface Review {
  id: string;
  productId: string;
  productName?: string;
  authorName: string;
  authorEmail: string;
  rating: number;
  title?: string | null;
  comment: string;
  isApproved: boolean;
  isVerifiedBuyer: boolean;
  createdAt: string;
}

export interface StoreSetting {
  id: string;
  storeName: string;
  announcementText: string;
  freeShippingThreshold: number;
  standardShippingCost: number;
  paypalClientId?: string | null;
  contactEmail: string;
  instagramUrl: string;
  maintenanceMode: boolean;
  maintenanceAllowedIps: string;
  maintenanceTitle?: string;
  maintenanceMessage?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
}
