import { Prisma } from '@prisma/client';
import { prisma } from './prisma';
import { Category, Product, Order, Review, StoreSetting, OrderStatus, Collection } from './types';
import { resolveSchedule } from './collectionSchedule';

const SETTINGS_ID = 'store-default';

export class StoreError extends Error {
  constructor(message: string, public status: number = 400) {
    super(message);
  }
}

/** Translates Prisma known errors into user-facing StoreErrors. */
function rethrow(err: unknown, what: string): never {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') throw new StoreError(`Ya existe ${what} con ese slug o identificador único.`, 409);
    if (err.code === 'P2003') throw new StoreError(`Referencia inválida o elemento en uso (${what}).`, 409);
    if (err.code === 'P2025') throw new StoreError(`${what} no encontrado.`, 404);
  }
  throw err;
}

const num = (v: Prisma.Decimal | number | null | undefined): number => (v == null ? 0 : Number(v));
const numOrNull = (v: Prisma.Decimal | number | null | undefined): number | null => (v == null ? null : Number(v));

function parseImages(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return raw.startsWith('http') || raw.startsWith('/') ? [raw] : [];
  }
}

type CategoryRow = Prisma.CategoryGetPayload<object>;
type ProductRow = Prisma.ProductGetPayload<{ include: { category: true } }>;

function mapCategory(c: CategoryRow, productCount?: number): Category {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.image,
    sortOrder: c.sortOrder,
    ...(productCount !== undefined ? { productCount } : {}),
  };
}

function mapProduct(p: ProductRow, rating?: { avg: number; count: number }): Product {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    shortDescription: p.shortDescription,
    price: num(p.price),
    comparePrice: numOrNull(p.comparePrice),
    costPrice: numOrNull(p.costPrice),
    stock: p.stock,
    sku: p.sku,
    materials: p.materials,
    dimensions: p.dimensions,
    weightGrams: p.weightGrams,
    images: parseImages(p.images),
    isFeatured: p.isFeatured,
    isActive: p.isActive,
    categoryId: p.categoryId,
    category: p.category ? mapCategory(p.category) : undefined,
    createdAt: p.createdAt.toISOString(),
    rating: rating?.count ? Math.round(rating.avg * 10) / 10 : 5,
    reviewCount: rating?.count ?? 0,
  };
}

async function ratingsByProduct(ids: string[]): Promise<Map<string, { avg: number; count: number }>> {
  const map = new Map<string, { avg: number; count: number }>();
  if (ids.length === 0) return map;
  const groups = await prisma.review.groupBy({
    by: ['productId'],
    where: { isApproved: true, productId: { in: ids } },
    _avg: { rating: true },
    _count: { _all: true },
  });
  for (const g of groups) {
    if (g.productId) map.set(g.productId, { avg: g._avg.rating ?? 5, count: g._count._all });
  }
  return map;
}

function mapOrder(
  o: Prisma.OrderGetPayload<{ include: { items: true } }>
): Order {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    customerPhone: o.customerPhone,
    shippingAddress: o.shippingAddress,
    city: o.city,
    postalCode: o.postalCode,
    province: o.province,
    country: o.country,
    subtotal: num(o.subtotal),
    shippingCost: num(o.shippingCost),
    totalAmount: num(o.totalAmount),
    status: o.status as OrderStatus,
    paymentMethod: o.paymentMethod,
    paypalOrderId: o.paypalOrderId,
    trackingNumber: o.trackingNumber,
    notes: o.notes,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({
      id: i.id,
      orderId: i.orderId,
      productId: i.productId,
      productName: i.productName,
      productImage: i.productImage,
      unitPrice: num(i.unitPrice),
      quantity: i.quantity,
    })),
  };
}

type ReviewRow = Prisma.ReviewGetPayload<{ include: { product: { select: { name: true } } } }>;

function mapReview(r: ReviewRow): Review {
  return {
    id: r.id,
    productId: r.productId ?? 'general',
    productName: r.product?.name ?? 'Bohoart Jewelry',
    authorName: r.authorName,
    authorEmail: r.authorEmail,
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    isApproved: r.isApproved,
    isVerifiedBuyer: r.isVerifiedBuyer,
    createdAt: r.createdAt.toISOString(),
  };
}

function mapSettings(s: Prisma.StoreSettingGetPayload<object>): StoreSetting {
  return {
    id: s.id,
    storeName: s.storeName,
    announcementText: s.announcementText,
    freeShippingThreshold: num(s.freeShippingThreshold),
    standardShippingCost: num(s.standardShippingCost),
    paypalClientId: s.paypalClientId,
    contactEmail: s.contactEmail,
    instagramUrl: s.instagramUrl,
    bizumPhone: s.bizumPhone,
    paypalMeUrl: s.paypalMeUrl,
    maintenanceMode: s.maintenanceMode,
    maintenanceAllowedIps: s.maintenanceAllowedIps ?? '',
    maintenanceTitle: s.maintenanceTitle ?? undefined,
    maintenanceMessage: s.maintenanceMessage ?? undefined,
  };
}

const str = (v: unknown): string | null => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null);

/** Whitelists and normalises product input so the API never spreads raw request bodies into Prisma. */
function productData(data: Partial<Product>): Prisma.ProductUncheckedUpdateInput {
  const out: Prisma.ProductUncheckedUpdateInput = {};
  if (data.name !== undefined) out.name = data.name;
  if (data.slug !== undefined) out.slug = data.slug;
  if (data.description !== undefined) out.description = data.description ?? '';
  if (data.shortDescription !== undefined) out.shortDescription = str(data.shortDescription);
  if (data.price !== undefined) out.price = data.price;
  if (data.comparePrice !== undefined) out.comparePrice = data.comparePrice;
  if (data.costPrice !== undefined) out.costPrice = data.costPrice;
  if (data.stock !== undefined) out.stock = data.stock;
  if (data.sku !== undefined) out.sku = str(data.sku);
  if (data.materials !== undefined) out.materials = str(data.materials);
  if (data.dimensions !== undefined) out.dimensions = str(data.dimensions);
  if (data.weightGrams !== undefined) out.weightGrams = data.weightGrams;
  if (data.images !== undefined) out.images = JSON.stringify(data.images);
  if (data.isFeatured !== undefined) out.isFeatured = data.isFeatured;
  if (data.isActive !== undefined) out.isActive = data.isActive;
  if (data.categoryId !== undefined) out.categoryId = data.categoryId;
  return out;
}

export interface CollectionInput {
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  heroImage: string | null;
  accentColor: string;
  startsAt: Date | null;
  endsAt: Date | null;
  repeatYearly: boolean;
  isActive: boolean;
  showOnHome: boolean;
  sortOrder: number;
  productIds: string[];
}

function collectionScalars(d: CollectionInput) {
  return {
    tagline: str(d.tagline),
    description: str(d.description),
    heroImage: str(d.heroImage),
    accentColor: d.accentColor,
    startsAt: d.startsAt,
    endsAt: d.endsAt,
    repeatYearly: d.repeatYearly,
    isActive: d.isActive,
    showOnHome: d.showOnHome,
    sortOrder: d.sortOrder,
  };
}

function mapCollection(
  c: Prisma.CollectionGetPayload<object> & { products: { productId: string }[] }
): Collection {
  const sched = resolveSchedule(c);
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    tagline: c.tagline,
    description: c.description,
    heroImage: c.heroImage,
    accentColor: c.accentColor,
    startsAt: c.startsAt?.toISOString() ?? null,
    endsAt: c.endsAt?.toISOString() ?? null,
    repeatYearly: c.repeatYearly,
    isActive: c.isActive,
    showOnHome: c.showOnHome,
    sortOrder: c.sortOrder,
    status: sched.status,
    windowStart: sched.windowStart?.toISOString() ?? null,
    windowEnd: sched.windowEnd?.toISOString() ?? null,
    productCount: c.products.length,
    productIds: c.products.map((p) => p.productId),
  };
}

export const storeService = {
  // --- CATEGORIES ---
  async getCategories(): Promise<Category[]> {
    const rows = await prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { products: { where: { isActive: true } } } } },
    });
    return rows.map((c) => mapCategory(c, c._count.products));
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const c = await prisma.category.findUnique({
      where: { slug },
      include: { _count: { select: { products: { where: { isActive: true } } } } },
    });
    return c ? mapCategory(c, c._count.products) : null;
  },

  async createCategory(data: Omit<Category, 'id'>): Promise<Category> {
    try {
      const c = await prisma.category.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: str(data.description),
          image: str(data.image),
          sortOrder: data.sortOrder ?? 0,
        },
      });
      return mapCategory(c, 0);
    } catch (err) {
      rethrow(err, 'una categoría');
    }
  },

  async updateCategory(id: string, data: Partial<Category>): Promise<Category | null> {
    try {
      const c = await prisma.category.update({
        where: { id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.slug !== undefined && { slug: data.slug }),
          ...(data.description !== undefined && { description: str(data.description) }),
          ...(data.image !== undefined && { image: str(data.image) }),
          ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        },
        include: { _count: { select: { products: { where: { isActive: true } } } } },
      });
      return mapCategory(c, c._count.products);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') return null;
      rethrow(err, 'una categoría');
    }
  },

  async deleteCategory(id: string): Promise<boolean> {
    const linked = await prisma.product.count({ where: { categoryId: id } });
    if (linked > 0) {
      throw new StoreError(
        `No se puede eliminar: la categoría tiene ${linked} producto(s). Muévelos a otra categoría primero.`,
        409
      );
    }
    try {
      await prisma.category.delete({ where: { id } });
      return true;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') return false;
      throw err;
    }
  },

  // --- PRODUCTS ---
  async getProducts(params?: {
    categorySlug?: string;
    featured?: boolean;
    activeOnly?: boolean;
    search?: string;
    sort?: 'price_asc' | 'price_desc' | 'newest' | 'rating';
  }): Promise<Product[]> {
    const where: Prisma.ProductWhereInput = {};
    if (params?.activeOnly !== false) where.isActive = true;
    if (params?.featured) where.isFeatured = true;
    if (params?.categorySlug) where.category = { slug: params.categorySlug };
    if (params?.search) {
      const q = params.search.trim();
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
        { materials: { contains: q } },
      ];
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (params?.sort === 'price_asc') orderBy = { price: 'asc' };
    if (params?.sort === 'price_desc') orderBy = { price: 'desc' };

    const rows = await prisma.product.findMany({ where, orderBy, include: { category: true } });
    const ratings = await ratingsByProduct(rows.map((r) => r.id));
    const list = rows.map((r) => mapProduct(r, ratings.get(r.id)));
    if (params?.sort === 'rating') list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return list;
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    const p = await prisma.product.findUnique({ where: { slug }, include: { category: true } });
    if (!p) return null;
    return mapProduct(p, (await ratingsByProduct([p.id])).get(p.id));
  },

  async getProductById(id: string): Promise<Product | null> {
    const p = await prisma.product.findUnique({ where: { id }, include: { category: true } });
    if (!p) return null;
    return mapProduct(p, (await ratingsByProduct([p.id])).get(p.id));
  },

  async createProduct(data: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    try {
      const p = await prisma.product.create({
        data: {
          ...(productData(data) as Prisma.ProductUncheckedCreateInput),
          name: data.name,
          slug: data.slug,
          description: data.description ?? '',
          price: data.price,
          images: JSON.stringify(data.images ?? []),
          categoryId: data.categoryId,
        },
        include: { category: true },
      });
      return mapProduct(p);
    } catch (err) {
      rethrow(err, 'un producto');
    }
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
    try {
      const p = await prisma.product.update({
        where: { id },
        data: productData(data),
        include: { category: true },
      });
      return mapProduct(p, (await ratingsByProduct([p.id])).get(p.id));
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') return null;
      rethrow(err, 'un producto');
    }
  },

  /** Hard-deletes unless the product appears in past orders, in which case it is archived (isActive=false). */
  async deleteProduct(id: string): Promise<boolean> {
    const existing = await prisma.product.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return false;
    const inOrders = await prisma.orderItem.count({ where: { productId: id } });
    if (inOrders > 0) {
      await prisma.product.update({ where: { id }, data: { isActive: false, isFeatured: false } });
      return true;
    }
    await prisma.$transaction([
      prisma.collectionProduct.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } }),
    ]);
    return true;
  },

  // --- ORDERS ---
  async getOrders(): Promise<Order[]> {
    const rows = await prisma.order.findMany({ orderBy: { createdAt: 'desc' }, include: { items: true } });
    return rows.map(mapOrder);
  },

  async getOrdersPaged(params: {
    page?: number;
    pageSize?: number;
    status?: string;
    q?: string;
  }): Promise<{ items: Order[]; total: number; page: number; pageSize: number }> {
    const pageSize = Math.min(100, Math.max(1, params.pageSize || 20));
    const page = Math.max(1, params.page || 1);
    const where: Prisma.OrderWhereInput = {};
    if (params.status && params.status !== 'ALL') where.status = params.status;
    if (params.q?.trim()) {
      const q = params.q.trim();
      where.OR = [
        { orderNumber: { contains: q } },
        { customerName: { contains: q } },
        { customerEmail: { contains: q } },
        { city: { contains: q } },
      ];
    }
    const [total, rows] = await prisma.$transaction([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { items: true },
      }),
    ]);
    return { items: rows.map(mapOrder), total, page, pageSize };
  },

  /** Server-side price quote for a cart (prices/shipping from DB) and stock validation. */
  async quoteCart(
    items: { productId: string; quantity: number }[]
  ): Promise<{ subtotal: number; shippingCost: number; totalAmount: number }> {
    const ids = [...new Set(items.map((i) => i.productId))];
    const products = await prisma.product.findMany({ where: { id: { in: ids }, isActive: true } });
    const byId = new Map(products.map((p) => [p.id, p]));
    for (const item of items) {
      const p = byId.get(item.productId);
      if (!p) throw new StoreError('Uno de los productos ya no está disponible.', 409);
      if (p.stock < item.quantity) throw new StoreError(`Stock insuficiente para "${p.name}".`, 409);
    }
    const settings = await this.getSettings();
    const subtotal = Math.round(items.reduce((sum, i) => sum + num(byId.get(i.productId)!.price) * i.quantity, 0) * 100) / 100;
    const shippingCost = subtotal >= settings.freeShippingThreshold ? 0 : settings.standardShippingCost;
    return { subtotal, shippingCost, totalAmount: Math.round((subtotal + shippingCost) * 100) / 100 };
  },

  async getOrderByPaypalId(paypalOrderId: string): Promise<Order | null> {
    const o = await prisma.order.findFirst({ where: { paypalOrderId }, include: { items: true } });
    return o ? mapOrder(o) : null;
  },

  async getOrderById(id: string): Promise<Order | null> {
    const o = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
      include: { items: true },
    });
    return o ? mapOrder(o) : null;
  },

  /**
   * Creates an order. Prices, names and totals are taken from the database (never trusted from the client)
   * and stock is decremented atomically in the same transaction.
   */
  async createOrder(data: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Promise<Order> {
    const productIds = [...new Set(data.items.map((i) => i.productId))];
    const products = await prisma.product.findMany({ where: { id: { in: productIds }, isActive: true } });
    const byId = new Map(products.map((p) => [p.id, p]));

    for (const item of data.items) {
      const p = byId.get(item.productId);
      if (!p) throw new StoreError('Uno de los productos ya no está disponible.', 409);
      if (p.stock < item.quantity) throw new StoreError(`Stock insuficiente para "${p.name}".`, 409);
    }

    const settings = await this.getSettings();
    const subtotal = data.items.reduce((sum, i) => sum + num(byId.get(i.productId)!.price) * i.quantity, 0);
    const shippingCost = subtotal >= settings.freeShippingThreshold ? 0 : settings.standardShippingCost;
    const totalAmount = Math.round((subtotal + shippingCost) * 100) / 100;
    const orderNumber = `BH-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const created = await prisma.$transaction(async (tx) => {
        for (const item of data.items) {
          const res = await tx.product.updateMany({
            where: { id: item.productId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
          if (res.count === 0) throw new StoreError('Stock insuficiente, inténtalo de nuevo.', 409);
        }
        return tx.order.create({
          data: {
            orderNumber,
            customerName: data.customerName,
            customerEmail: data.customerEmail,
            customerPhone: data.customerPhone ?? null,
            shippingAddress: data.shippingAddress,
            city: data.city,
            postalCode: data.postalCode,
            province: data.province,
            country: data.country,
            subtotal,
            shippingCost,
            totalAmount,
            status: data.status,
            paymentMethod: data.paymentMethod,
            paypalOrderId: data.paypalOrderId ?? null,
            trackingNumber: data.trackingNumber ?? null,
            notes: data.notes ?? null,
            items: {
              create: data.items.map((i) => {
                const p = byId.get(i.productId)!;
                return {
                  productId: p.id,
                  productName: p.name,
                  productImage: parseImages(p.images)[0] ?? null,
                  unitPrice: p.price,
                  quantity: i.quantity,
                };
              }),
            },
          },
          include: { items: true },
        });
      });
      return mapOrder(created);
    } catch (err) {
      if (err instanceof StoreError) throw err;
      rethrow(err, 'un pedido');
    }
  },

  async updateOrderStatus(id: string, status: OrderStatus, trackingNumber?: string): Promise<Order | null> {
    const existing = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
      include: { items: true },
    });
    if (!existing) return null;
    if (existing.status === 'CANCELLED' && status !== 'CANCELLED') {
      throw new StoreError('Un pedido cancelado no se puede reactivar (el stock ya se devolvió).', 409);
    }

    const restock = status === 'CANCELLED' && existing.status !== 'CANCELLED';
    const [o] = await prisma.$transaction([
      prisma.order.update({
        where: { id: existing.id },
        data: { status, ...(trackingNumber ? { trackingNumber } : {}) },
        include: { items: true },
      }),
      ...(restock
        ? existing.items.map((i) =>
            prisma.product.update({ where: { id: i.productId }, data: { stock: { increment: i.quantity } } })
          )
        : []),
    ]);
    return mapOrder(o);
  },

  // --- REVIEWS ---
  async getReviews(params?: { productId?: string; approvedOnly?: boolean }): Promise<Review[]> {
    const rows = await prisma.review.findMany({
      where: {
        ...(params?.productId ? { productId: params.productId === 'general' ? null : params.productId } : {}),
        ...(params?.approvedOnly !== false ? { isApproved: true } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: { product: { select: { name: true } } },
    });
    return rows.map(mapReview);
  },

  async createReview(data: Omit<Review, 'id' | 'createdAt' | 'isApproved'>): Promise<Review> {
    const productId = data.productId && data.productId !== 'general' ? data.productId : null;
    try {
      const r = await prisma.review.create({
        data: {
          productId,
          authorName: data.authorName,
          authorEmail: data.authorEmail ?? '',
          rating: Math.min(5, Math.max(1, data.rating)),
          title: data.title ?? null,
          comment: data.comment,
          isVerifiedBuyer: data.isVerifiedBuyer,
          isApproved: false, // requires admin approval
        },
        include: { product: { select: { name: true } } },
      });
      return mapReview(r);
    } catch (err) {
      rethrow(err, 'una reseña');
    }
  },

  async approveReview(id: string): Promise<Review | null> {
    try {
      const r = await prisma.review.update({
        where: { id },
        data: { isApproved: true },
        include: { product: { select: { name: true } } },
      });
      return mapReview(r);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') return null;
      throw err;
    }
  },

  async deleteReview(id: string): Promise<boolean> {
    try {
      await prisma.review.delete({ where: { id } });
      return true;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') return false;
      throw err;
    }
  },

  // --- SETTINGS ---
  async getSettings(): Promise<StoreSetting> {
    const s = await prisma.storeSetting.upsert({
      where: { id: SETTINGS_ID },
      update: {},
      create: { id: SETTINGS_ID },
    });
    return mapSettings(s);
  },

  async updateSettings(data: Partial<StoreSetting>): Promise<StoreSetting> {
    const clean = Object.fromEntries(
      Object.entries({
        storeName: data.storeName,
        announcementText: data.announcementText,
        freeShippingThreshold: data.freeShippingThreshold,
        standardShippingCost: data.standardShippingCost,
        paypalClientId: data.paypalClientId,
        contactEmail: data.contactEmail,
        instagramUrl: data.instagramUrl,
        bizumPhone: data.bizumPhone,
        paypalMeUrl: data.paypalMeUrl,
        maintenanceMode: data.maintenanceMode,
        maintenanceAllowedIps: data.maintenanceAllowedIps,
        maintenanceTitle: data.maintenanceTitle,
        maintenanceMessage: data.maintenanceMessage,
      }).filter(([, v]) => v !== undefined)
    ) as Prisma.StoreSettingUpdateInput;
    const s = await prisma.storeSetting.upsert({
      where: { id: SETTINGS_ID },
      update: clean,
      create: { id: SETTINGS_ID, ...(clean as Prisma.StoreSettingCreateInput) },
    });
    return mapSettings(s);
  },

  // --- COLLECTIONS ---
  async getCollections(opts?: { admin?: boolean }): Promise<Collection[]> {
    const rows = await prisma.collection.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { products: { select: { productId: true }, orderBy: { sortOrder: 'asc' } } },
    });
    const list = rows.map((r) => mapCollection(r));
    return opts?.admin ? list : list.filter((c) => c.status === 'live' || c.status === 'scheduled');
  },

  async getCollectionById(id: string): Promise<Collection | null> {
    const r = await prisma.collection.findUnique({
      where: { id },
      include: { products: { select: { productId: true }, orderBy: { sortOrder: 'asc' } } },
    });
    return r ? mapCollection(r) : null;
  },

  /** Public landing data: collection + its active products in the configured order. */
  async getCollectionBySlug(slug: string): Promise<Collection | null> {
    const r = await prisma.collection.findUnique({
      where: { slug },
      include: {
        products: {
          orderBy: { sortOrder: 'asc' },
          include: { product: { include: { category: true } } },
        },
      },
    });
    if (!r) return null;
    const active = r.products.filter((cp) => cp.product.isActive);
    const ratings = await ratingsByProduct(active.map((cp) => cp.productId));
    const col = mapCollection(r);
    col.products = active.map((cp) => mapProduct(cp.product, ratings.get(cp.productId)));
    col.productCount = col.products.length;
    return col;
  },

  /** The collection to spotlight on the home page: live, flagged showOnHome, lowest sortOrder. */
  async getHomeCollection(): Promise<Collection | null> {
    const all = await this.getCollections();
    const live = all.filter((c) => c.status === 'live' && c.showOnHome);
    return live[0] ?? null;
  },

  async createCollection(data: CollectionInput): Promise<Collection> {
    try {
      const r = await prisma.collection.create({
        data: {
          ...collectionScalars(data),
          name: data.name,
          slug: data.slug,
          products: { create: data.productIds.map((productId, i) => ({ productId, sortOrder: i })) },
        },
        include: { products: { select: { productId: true } } },
      });
      return mapCollection(r);
    } catch (err) {
      rethrow(err, 'una colección');
    }
  },

  async updateCollection(id: string, data: CollectionInput): Promise<Collection | null> {
    const exists = await prisma.collection.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return null;
    try {
      const [r] = await prisma.$transaction([
        prisma.collection.update({
          where: { id },
          data: { ...collectionScalars(data), name: data.name, slug: data.slug },
          include: { products: { select: { productId: true } } },
        }),
        prisma.collectionProduct.deleteMany({ where: { collectionId: id } }),
        prisma.collectionProduct.createMany({
          data: data.productIds.map((productId, i) => ({ collectionId: id, productId, sortOrder: i })),
        }),
      ]);
      return mapCollection({ ...r, products: data.productIds.map((productId) => ({ productId })) });
    } catch (err) {
      rethrow(err, 'una colección');
    }
  },

  async deleteCollection(id: string): Promise<boolean> {
    try {
      await prisma.collection.delete({ where: { id } });
      return true;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') return false;
      throw err;
    }
  },
};
