import { Category, Product, Order, Review, StoreSetting, OrderStatus } from './types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_REVIEWS, INITIAL_SETTINGS } from './initialData';

// In-Memory persistent store across warm serverless/Node lifecycles
interface StoreData {
  categories: Category[];
  products: Product[];
  orders: Order[];
  reviews: Review[];
  settings: StoreSetting;
}

// Global cache in development
const globalForStore = globalThis as unknown as {
  bohoartStore?: StoreData;
};

function getStore(): StoreData {
  if (!globalForStore.bohoartStore) {
    globalForStore.bohoartStore = {
      categories: [...INITIAL_CATEGORIES],
      products: [...INITIAL_PRODUCTS],
      orders: [...INITIAL_ORDERS],
      reviews: [...INITIAL_REVIEWS],
      settings: { ...INITIAL_SETTINGS },
    };
  }
  return globalForStore.bohoartStore;
}

export const storeService = {
  // --- CATEGORIES ---
  async getCategories(): Promise<Category[]> {
    const store = getStore();
    return store.categories.map((c) => ({
      ...c,
      productCount: store.products.filter((p) => p.categoryId === c.id && p.isActive).length,
    }));
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const store = getStore();
    const cat = store.categories.find((c) => c.slug === slug);
    if (!cat) return null;
    return {
      ...cat,
      productCount: store.products.filter((p) => p.categoryId === cat.id && p.isActive).length,
    };
  },

  async createCategory(data: Omit<Category, 'id'>): Promise<Category> {
    const store = getStore();
    const newCat: Category = {
      ...data,
      id: `cat-${Date.now()}`,
    };
    store.categories.push(newCat);
    return newCat;
  },

  async updateCategory(id: string, data: Partial<Category>): Promise<Category | null> {
    const store = getStore();
    const index = store.categories.findIndex((c) => c.id === id);
    if (index === -1) return null;
    store.categories[index] = { ...store.categories[index], ...data };
    return store.categories[index];
  },

  async deleteCategory(id: string): Promise<boolean> {
    const store = getStore();
    const index = store.categories.findIndex((c) => c.id === id);
    if (index === -1) return false;
    store.categories.splice(index, 1);
    return true;
  },

  // --- PRODUCTS ---
  async getProducts(params?: {
    categorySlug?: string;
    featured?: boolean;
    activeOnly?: boolean;
    search?: string;
    sort?: 'price_asc' | 'price_desc' | 'newest' | 'rating';
  }): Promise<Product[]> {
    const store = getStore();
    let list = [...store.products];

    if (params?.activeOnly !== false) {
      list = list.filter((p) => p.isActive);
    }

    if (params?.featured) {
      list = list.filter((p) => p.isFeatured);
    }

    if (params?.categorySlug) {
      const cat = store.categories.find((c) => c.slug === params.categorySlug);
      if (cat) {
        list = list.filter((p) => p.categoryId === cat.id);
      }
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.materials && p.materials.toLowerCase().includes(q))
      );
    }

    if (params?.sort) {
      switch (params.sort) {
        case 'price_asc':
          list.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          list.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'rating':
          list.sort((a, b) => (b.rating || 5) - (a.rating || 5));
          break;
      }
    }

    return list.map((p) => ({
      ...p,
      category: store.categories.find((c) => c.id === p.categoryId),
    }));
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    const store = getStore();
    const product = store.products.find((p) => p.slug === slug);
    if (!product) return null;
    return {
      ...product,
      category: store.categories.find((c) => c.id === product.categoryId),
    };
  },

  async getProductById(id: string): Promise<Product | null> {
    const store = getStore();
    const product = store.products.find((p) => p.id === id);
    if (!product) return null;
    return {
      ...product,
      category: store.categories.find((c) => c.id === product.categoryId),
    };
  },

  async createProduct(data: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const store = getStore();
    const newProduct: Product = {
      ...data,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      rating: 5,
      reviewCount: 0,
    };
    store.products.unshift(newProduct);
    return newProduct;
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
    const store = getStore();
    const index = store.products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    store.products[index] = { ...store.products[index], ...data };
    return store.products[index];
  },

  async deleteProduct(id: string): Promise<boolean> {
    const store = getStore();
    const index = store.products.findIndex((p) => p.id === id);
    if (index === -1) return false;
    store.products.splice(index, 1);
    return true;
  },

  // --- ORDERS ---
  async getOrders(): Promise<Order[]> {
    const store = getStore();
    return [...store.orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async getOrderById(id: string): Promise<Order | null> {
    const store = getStore();
    return store.orders.find((o) => o.id === id || o.orderNumber === id) || null;
  },

  async createOrder(data: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Promise<Order> {
    const store = getStore();
    const orderNumber = `BH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      ...data,
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      items: data.items.map((item, idx) => ({
        ...item,
        id: `item-${Date.now()}-${idx}`,
        orderId: `ord-${Date.now()}`,
      })),
    };

    // Decrease stock for each item
    for (const item of newOrder.items) {
      const prod = store.products.find((p) => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    }

    store.orders.unshift(newOrder);
    return newOrder;
  },

  async updateOrderStatus(id: string, status: OrderStatus, trackingNumber?: string): Promise<Order | null> {
    const store = getStore();
    const order = store.orders.find((o) => o.id === id || o.orderNumber === id);
    if (!order) return null;
    order.status = status;
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }
    return order;
  },

  // --- REVIEWS ---
  async getReviews(params?: { productId?: string; approvedOnly?: boolean }): Promise<Review[]> {
    const store = getStore();
    let list = [...store.reviews];
    if (params?.productId) {
      list = list.filter((r) => r.productId === params.productId);
    }
    if (params?.approvedOnly !== false) {
      list = list.filter((r) => r.isApproved);
    }
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async createReview(data: Omit<Review, 'id' | 'createdAt' | 'isApproved'>): Promise<Review> {
    const store = getStore();
    const newReview: Review = {
      ...data,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isApproved: false, // requires admin approval
    };
    store.reviews.unshift(newReview);
    return newReview;
  },

  async approveReview(id: string): Promise<Review | null> {
    const store = getStore();
    const rev = store.reviews.find((r) => r.id === id);
    if (!rev) return null;
    rev.isApproved = true;
    return rev;
  },

  async deleteReview(id: string): Promise<boolean> {
    const store = getStore();
    const index = store.reviews.findIndex((r) => r.id === id);
    if (index === -1) return false;
    store.reviews.splice(index, 1);
    return true;
  },

  // --- SETTINGS ---
  async getSettings(): Promise<StoreSetting> {
    const store = getStore();
    return store.settings;
  },

  async updateSettings(data: Partial<StoreSetting>): Promise<StoreSetting> {
    const store = getStore();
    store.settings = { ...store.settings, ...data };
    return store.settings;
  },
};
