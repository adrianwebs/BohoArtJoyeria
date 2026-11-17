import { Prisma } from '@prisma/client';
import { prisma } from './prisma';
import { Category, Product, Order, Review, StoreSetting, OrderStatus, Collection, Coupon, CouponValidationResult, DiscountType, AttributeGroup, AttributeGroupType, ProductVariant, VariantValue } from './types';
import { resolveSchedule } from './collectionSchedule';
import { markCartOrdered, notifyStockAvailable } from './marketing';

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
type CouponRow = Prisma.CouponGetPayload<object>;

function mapCoupon(c: CouponRow): Coupon {
  return {
    id: c.id,
    code: c.code,
    description: c.description,
    discountType: c.discountType as DiscountType,
    discountValue: num(c.discountValue),
    minOrderAmount: numOrNull(c.minOrderAmount),
    maxUses: c.maxUses,
    usedCount: c.usedCount,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
    isActive: c.isActive,
    createdAt: c.createdAt.toISOString(),
  };
}

type ProductRow = Prisma.ProductGetPayload<{ include: { category: true } }> & { _count?: { variants: number } };

/** Loads the category plus how many active variants the product has (to flag products that need a combination). */
const productInclude = {
  category: true,
  _count: { select: { variants: { where: { isActive: true } } } },
} satisfies Prisma.ProductInclude;

const variantInclude = {
  values: { include: { value: { include: { group: true } } } },
} satisfies Prisma.ProductVariantInclude;
type VariantRow = Prisma.ProductVariantGetPayload<{ include: typeof variantInclude }>;

function mapVariant(v: VariantRow, productPrice: number): ProductVariant {
  const values: VariantValue[] = v.values
    .map((vv) => ({
      id: vv.value.id,
      groupId: vv.value.groupId,
      name: vv.value.name,
      hex: vv.value.hex,
      isMulticolor: vv.value.isMulticolor,
      sortOrder: vv.value.sortOrder,
      groupName: vv.value.group.name,
      groupType: vv.value.group.type as AttributeGroupType,
      _g: vv.value.group.sortOrder,
    }))
    .sort((a, b) => a._g - b._g || a.sortOrder - b.sortOrder)
    .map(({ _g, ...rest }) => rest);
  const override = numOrNull(v.price);
  return {
    id: v.id,
    productId: v.productId,
    sku: v.sku,
    price: override ?? Math.round((productPrice + num(v.priceAdjustment)) * 100) / 100,
    priceOverride: override,
    priceAdjustment: num(v.priceAdjustment),
    stock: v.stock,
    image: v.image,
    isActive: v.isActive,
    sortOrder: v.sortOrder,
    values,
    label: values.map((x) => `${x.groupName}: ${x.name}`).join(' · '),
  };
}

function mapAttributeValue(v: Prisma.AttributeValueGetPayload<object>): AttributeGroup['values'][number] {
  return { id: v.id, groupId: v.groupId, name: v.name, hex: v.hex, isMulticolor: v.isMulticolor, sortOrder: v.sortOrder };
}

function mapAttributeGroup(g: Prisma.AttributeGroupGetPayload<{ include: { values: true } }>): AttributeGroup {
  return {
    id: g.id,
    name: g.name,
    type: g.type as AttributeGroupType,
    sortOrder: g.sortOrder,
    values: g.values.map(mapAttributeValue),
  };
}

const variantKey = (valueIds: string[]) => [...valueIds].sort().join('|');

/** Keeps Product.stock equal to the sum of its active variants' stock (no-op for products without variants). */
async function syncProductStock(tx: Prisma.TransactionClient, productId: string) {
  const variants = await tx.productVariant.findMany({ where: { productId }, select: { stock: true, isActive: true } });
  if (variants.length === 0) return;
  const total = variants.filter((v) => v.isActive).reduce((sum, v) => sum + Math.max(0, v.stock), 0);
  await tx.product.update({ where: { id: productId }, data: { stock: total } });
}

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
    hasVariants: (p._count?.variants ?? 0) > 0,
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
      variantId: i.variantId,
      variantLabel: i.variantLabel,
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
  async getCategories(params?: { activeOnly?: boolean }): Promise<Category[]> {
    const rows = await prisma.category.findMany({
      where: params?.activeOnly === false ? undefined : { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { products: { where: { isActive: true } } } } },
    });
    return rows.map((c) => mapCategory(c, c._count.products));
  },

  async getCategoryBySlug(slug: string, opts?: { includeInactive?: boolean }): Promise<Category | null> {
    const c = await prisma.category.findUnique({
      where: { slug },
      include: { _count: { select: { products: { where: { isActive: true } } } } },
    });
    if (!c) return null;
    if (!opts?.includeInactive && !c.isActive) return null;
    return mapCategory(c, c._count.products);
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
          isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
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
          ...(data.isActive !== undefined && { isActive: Boolean(data.isActive) }),
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
    if (params?.activeOnly !== false) {
      where.isActive = true;
      where.category = { isActive: true };
    }
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

    const rows = await prisma.product.findMany({ where, orderBy, include: productInclude });
    const ratings = await ratingsByProduct(rows.map((r) => r.id));
    const list = rows.map((r) => mapProduct(r, ratings.get(r.id)));
    if (params?.sort === 'rating') list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return list;
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    const p = await prisma.product.findUnique({ where: { slug }, include: productInclude });
    if (!p) return null;
    const product = mapProduct(p, (await ratingsByProduct([p.id])).get(p.id));
    if (product.hasVariants) product.variants = await this.getVariants(p.id, { activeOnly: true });
    return product;
  },

  async getProductById(id: string): Promise<Product | null> {
    const p = await prisma.product.findUnique({ where: { id }, include: productInclude });
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
        include: productInclude,
      });
      return mapProduct(p);
    } catch (err) {
      rethrow(err, 'un producto');
    }
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
    try {
      const before = data.stock !== undefined ? await prisma.product.findUnique({ where: { id }, select: { stock: true } }) : null;
      const p = await prisma.product.update({
        where: { id },
        data: productData(data),
        include: productInclude,
      });
      // Back in stock (0 -> >0): email everyone who asked to be notified.
      if (before && before.stock <= 0 && p.stock > 0) {
        await notifyStockAvailable(p.id).catch((e) => console.error('notifyStockAvailable', e));
      }
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

  // --- ATTRIBUTES (variant groups and values) ---
  async getAttributeGroups(): Promise<AttributeGroup[]> {
    const rows = await prisma.attributeGroup.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { values: { orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] } },
    });
    return rows.map(mapAttributeGroup);
  },

  async createAttributeGroup(data: { name: string; type: AttributeGroupType; sortOrder?: number }): Promise<AttributeGroup> {
    const g = await prisma.attributeGroup.create({
      data: { name: data.name, type: data.type, sortOrder: data.sortOrder ?? 0 },
      include: { values: true },
    });
    return mapAttributeGroup(g);
  },

  async updateAttributeGroup(id: string, data: Partial<{ name: string; type: AttributeGroupType; sortOrder: number }>): Promise<AttributeGroup | null> {
    try {
      const g = await prisma.attributeGroup.update({
        where: { id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.type !== undefined && { type: data.type }),
          ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        },
        include: { values: { orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] } },
      });
      return mapAttributeGroup(g);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') return null;
      rethrow(err, 'un grupo de atributos');
    }
  },

  async deleteAttributeGroup(id: string): Promise<boolean> {
    const inUse = await prisma.productVariantValue.count({ where: { value: { groupId: id } } });
    if (inUse > 0) {
      throw new StoreError('No se puede eliminar: hay combinaciones de productos que usan este grupo.', 409);
    }
    try {
      await prisma.attributeGroup.delete({ where: { id } });
      return true;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') return false;
      throw err;
    }
  },

  async createAttributeValue(
    groupId: string,
    data: { name: string; hex?: string | null; isMulticolor?: boolean; sortOrder?: number }
  ): Promise<AttributeGroup['values'][number]> {
    try {
      const v = await prisma.attributeValue.create({
        data: {
          groupId,
          name: data.name,
          hex: str(data.hex),
          isMulticolor: Boolean(data.isMulticolor),
          sortOrder: data.sortOrder ?? 0,
        },
      });
      return mapAttributeValue(v);
    } catch (err) {
      rethrow(err, 'un valor');
    }
  },

  async updateAttributeValue(
    id: string,
    data: Partial<{ name: string; hex: string | null; isMulticolor: boolean; sortOrder: number }>
  ): Promise<AttributeGroup['values'][number] | null> {
    try {
      const v = await prisma.attributeValue.update({
        where: { id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.hex !== undefined && { hex: str(data.hex) }),
          ...(data.isMulticolor !== undefined && { isMulticolor: Boolean(data.isMulticolor) }),
          ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        },
      });
      return mapAttributeValue(v);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') return null;
      rethrow(err, 'un valor');
    }
  },

  async deleteAttributeValue(id: string): Promise<boolean> {
    const inUse = await prisma.productVariantValue.count({ where: { valueId: id } });
    if (inUse > 0) throw new StoreError('No se puede eliminar: hay combinaciones de productos que usan este valor.', 409);
    try {
      await prisma.attributeValue.delete({ where: { id } });
      return true;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') return false;
      throw err;
    }
  },

  // --- PRODUCT VARIANTS ---
  async getVariants(productId: string, opts?: { activeOnly?: boolean }): Promise<ProductVariant[]> {
    const product = await prisma.product.findUnique({ where: { id: productId }, select: { price: true } });
    if (!product) return [];
    const rows = await prisma.productVariant.findMany({
      where: { productId, ...(opts?.activeOnly ? { isActive: true } : {}) },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      include: variantInclude,
    });
    return rows.map((r) => mapVariant(r, num(product.price)));
  },

  /**
   * Creates every combination of the chosen values (one list of value ids per attribute group).
   * Combinations that already exist are skipped. New ones start with 0 stock and no price override.
   */
  async generateVariants(productId: string, valueIdsByGroup: string[][]): Promise<ProductVariant[]> {
    const groups = valueIdsByGroup.filter((g) => g.length > 0);
    if (groups.length === 0) throw new StoreError('Elige al menos un valor para generar combinaciones.', 400);
    const all = groups.flat();
    const found = await prisma.attributeValue.findMany({ where: { id: { in: all } }, select: { id: true, groupId: true } });
    if (found.length !== new Set(all).size) throw new StoreError('Algún valor ya no existe.', 400);
    const groupOf = new Map(found.map((v) => [v.id, v.groupId]));
    const groupIds = groups.map((g) => new Set(g.map((id) => groupOf.get(id))));
    if (groupIds.some((s) => s.size !== 1) || new Set(groupIds.map((s) => [...s][0])).size !== groups.length) {
      throw new StoreError('Cada lista debe contener valores de un único grupo, sin repetir grupos.', 400);
    }
    if (groups.reduce((n, g) => n * g.length, 1) > 200) {
      throw new StoreError('Demasiadas combinaciones (máximo 200 de una vez).', 400);
    }

    const combos = groups.reduce<string[][]>((acc, g) => acc.flatMap((c) => g.map((id) => [...c, id])), [[]]);
    const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
    if (!product) throw new StoreError('Producto no encontrado.', 404);

    await prisma.$transaction(async (tx) => {
      const existing = await tx.productVariant.findMany({ where: { productId }, include: { values: true } });
      const taken = new Set(existing.map((v) => variantKey(v.values.map((x) => x.valueId))));
      let order = existing.length;
      for (const combo of combos) {
        if (taken.has(variantKey(combo))) continue;
        await tx.productVariant.create({
          data: { productId, sortOrder: order++, values: { create: combo.map((valueId) => ({ valueId })) } },
        });
      }
      await syncProductStock(tx, productId);
    });
    return this.getVariants(productId);
  },

  async updateVariants(
    productId: string,
    updates: { id: string; price?: number | null; priceAdjustment?: number; stock?: number; sku?: string | null; image?: string | null; isActive?: boolean }[]
  ): Promise<ProductVariant[]> {
    const before = await prisma.product.findUnique({ where: { id: productId }, select: { stock: true } });
    await prisma.$transaction(async (tx) => {
      for (const u of updates) {
        const res = await tx.productVariant.updateMany({
          where: { id: u.id, productId },
          data: {
            ...(u.price !== undefined && { price: u.price }),
            ...(u.priceAdjustment !== undefined && { priceAdjustment: u.priceAdjustment }),
            ...(u.stock !== undefined && { stock: Math.max(0, Math.floor(u.stock)) }),
            ...(u.sku !== undefined && { sku: str(u.sku) }),
            ...(u.image !== undefined && { image: str(u.image) }),
            ...(u.isActive !== undefined && { isActive: u.isActive }),
          },
        });
        if (res.count === 0) throw new StoreError('Combinación no encontrada.', 404);
      }
      await syncProductStock(tx, productId);
    });
    // Back in stock through variant edits (product stock = sum of active variants): notify waiters.
    if (before && before.stock <= 0) {
      await notifyStockAvailable(productId).catch((e) => console.error('notifyStockAvailable', e));
    }
    return this.getVariants(productId);
  },

  /** Deletes a combination; if it appears in past orders it is only deactivated so the order history stays intact. */
  async deleteVariant(productId: string, variantId: string): Promise<boolean> {
    const v = await prisma.productVariant.findFirst({ where: { id: variantId, productId }, select: { id: true } });
    if (!v) return false;
    const inOrders = await prisma.orderItem.count({ where: { variantId } });
    await prisma.$transaction(async (tx) => {
      if (inOrders > 0) await tx.productVariant.update({ where: { id: variantId }, data: { isActive: false } });
      else await tx.productVariant.delete({ where: { id: variantId } });
      await syncProductStock(tx, productId);
    });
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

  /**
   * Resolves cart lines against the database: product (or chosen variant), unit price and stock check.
   * Products with active variants require a variantId; products without variants ignore it.
   */
  async resolveCartLines(items: { productId: string; variantId?: string | null; quantity: number }[]) {
    const productIds = [...new Set(items.map((i) => i.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      include: { _count: { select: { variants: { where: { isActive: true } } } } },
    });
    const byId = new Map(products.map((p) => [p.id, p]));
    const variantIds = [...new Set(items.map((i) => i.variantId).filter((v): v is string => !!v))];
    const variantRows = variantIds.length
      ? await prisma.productVariant.findMany({
          where: { id: { in: variantIds }, isActive: true },
          include: variantInclude,
        })
      : [];
    const variantById = new Map(variantRows.map((v) => [v.id, v]));

    return items.map((item) => {
      const p = byId.get(item.productId);
      if (!p) throw new StoreError('Uno de los productos ya no está disponible.', 409);
      if (p._count.variants > 0) {
        const v = item.variantId ? variantById.get(item.variantId) : undefined;
        if (!v || v.productId !== p.id) {
          throw new StoreError(`Elige una opción válida para "${p.name}".`, 409);
        }
        const mapped = mapVariant(v, num(p.price));
        if (v.stock < item.quantity) throw new StoreError(`Stock insuficiente para "${p.name}" (${mapped.label}).`, 409);
        return { item, product: p, variant: v, unitPrice: mapped.price, label: mapped.label as string | null, image: v.image };
      }
      if (p.stock < item.quantity) throw new StoreError(`Stock insuficiente para "${p.name}".`, 409);
      return { item, product: p, variant: null, unitPrice: num(p.price), label: null as string | null, image: null as string | null };
    });
  },

  /** Server-side price quote for a cart (prices/shipping from DB) and stock validation. */
  async quoteCart(
    items: { productId: string; variantId?: string | null; quantity: number }[]
  ): Promise<{ subtotal: number; shippingCost: number; totalAmount: number }> {
    const lines = await this.resolveCartLines(items);
    const settings = await this.getSettings();
    const subtotal = Math.round(lines.reduce((sum, l) => sum + l.unitPrice * l.item.quantity, 0) * 100) / 100;
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
    const lines = await this.resolveCartLines(data.items);

    const settings = await this.getSettings();
    const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.item.quantity, 0);

    let discountAmount = 0;
    let couponCode: string | null = null;
    if (data.couponCode) {
      const couponValidation = await this.validateCoupon(data.couponCode, subtotal);
      if (couponValidation.valid && couponValidation.discountAmount) {
        discountAmount = couponValidation.discountAmount;
        couponCode = couponValidation.coupon?.code || data.couponCode.toUpperCase().trim();
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    const shippingCost = discountedSubtotal >= settings.freeShippingThreshold ? 0 : settings.standardShippingCost;
    const totalAmount = Math.max(0, Math.round((discountedSubtotal + shippingCost) * 100) / 100);
    const orderNumber = `BH-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const created = await prisma.$transaction(async (tx) => {
        for (const l of lines) {
          if (l.variant) {
            const res = await tx.productVariant.updateMany({
              where: { id: l.variant.id, stock: { gte: l.item.quantity } },
              data: { stock: { decrement: l.item.quantity } },
            });
            if (res.count === 0) throw new StoreError('Stock insuficiente, inténtalo de nuevo.', 409);
            await syncProductStock(tx, l.product.id);
          } else {
            const res = await tx.product.updateMany({
              where: { id: l.product.id, stock: { gte: l.item.quantity } },
              data: { stock: { decrement: l.item.quantity } },
            });
            if (res.count === 0) throw new StoreError('Stock insuficiente, inténtalo de nuevo.', 409);
          }
        }

        if (couponCode) {
          await tx.coupon.updateMany({
            where: { code: couponCode },
            data: { usedCount: { increment: 1 } },
          });
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
            discountAmount,
            couponCode,
            shippingCost,
            totalAmount,
            status: data.status,
            paymentMethod: data.paymentMethod,
            paypalOrderId: data.paypalOrderId ?? null,
            trackingNumber: data.trackingNumber ?? null,
            notes: data.notes ?? null,
            items: {
              create: lines.map((l) => ({
                productId: l.product.id,
                productName: l.product.name,
                productImage: l.image || parseImages(l.product.images)[0] || null,
                unitPrice: l.unitPrice,
                quantity: l.item.quantity,
                variantId: l.variant?.id ?? null,
                variantLabel: l.label,
              })),
            },
          },
          include: { items: true },
        });
      });
      await markCartOrdered(data.customerEmail);
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
    const o = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: existing.id },
        data: { status, ...(trackingNumber ? { trackingNumber } : {}) },
        include: { items: true },
      });
      if (restock) {
        for (const i of existing.items) {
          if (i.variantId) {
            await tx.productVariant.update({ where: { id: i.variantId }, data: { stock: { increment: i.quantity } } });
            await syncProductStock(tx, i.productId);
          } else {
            await tx.product.update({ where: { id: i.productId }, data: { stock: { increment: i.quantity } } });
          }
        }
      }
      return updated;
    });
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
      include: {
        products: {
          select: { productId: true, product: { select: { images: true, isActive: true } } },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    const list = rows.map((r) => {
      const firstImage = r.products
        .filter((cp) => cp.product.isActive)
        .map((cp) => parseImages(cp.product.images)[0])
        .find(Boolean);
      return { ...mapCollection(r), coverImage: r.heroImage || firstImage || null };
    });
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
          include: { product: { include: productInclude } },
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
  // --- COUPONS / DESCUENTOS ---
  async getCoupons(): Promise<Coupon[]> {
    const list = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return list.map(mapCoupon);
  },

  async getCouponById(id: string): Promise<Coupon | null> {
    const c = await prisma.coupon.findUnique({ where: { id } });
    return c ? mapCoupon(c) : null;
  },

  async getCouponByCode(code: string): Promise<Coupon | null> {
    const clean = code.trim().toUpperCase();
    const c = await prisma.coupon.findUnique({ where: { code: clean } });
    return c ? mapCoupon(c) : null;
  },

  async createCoupon(data: Omit<Coupon, 'id' | 'usedCount' | 'createdAt'>): Promise<Coupon> {
    const cleanCode = data.code.trim().toUpperCase();
    const created = await prisma.coupon.create({
      data: {
        code: cleanCode,
        description: data.description ?? null,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrderAmount: data.minOrderAmount ?? null,
        maxUses: data.maxUses ?? null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      },
    });
    return mapCoupon(created);
  },

  async updateCoupon(id: string, data: Partial<Coupon>): Promise<Coupon | null> {
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) return null;

    const updated = await prisma.coupon.update({
      where: { id },
      data: {
        ...(data.code ? { code: data.code.trim().toUpperCase() } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.discountType ? { discountType: data.discountType } : {}),
        ...(data.discountValue !== undefined ? { discountValue: data.discountValue } : {}),
        ...(data.minOrderAmount !== undefined ? { minOrderAmount: data.minOrderAmount } : {}),
        ...(data.maxUses !== undefined ? { maxUses: data.maxUses } : {}),
        ...(data.usedCount !== undefined ? { usedCount: data.usedCount } : {}),
        ...(data.expiresAt !== undefined ? { expiresAt: data.expiresAt ? new Date(data.expiresAt) : null } : {}),
        ...(data.isActive !== undefined ? { isActive: Boolean(data.isActive) } : {}),
      },
    });
    return mapCoupon(updated);
  },

  async deleteCoupon(id: string): Promise<boolean> {
    try {
      await prisma.coupon.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  },

  async validateCoupon(code: string, subtotal: number): Promise<CouponValidationResult> {
    const cleanCode = code ? code.trim().toUpperCase() : '';
    if (!cleanCode) {
      return { valid: false, message: 'Por favor, introduce un código promocional.' };
    }

    const c = await prisma.coupon.findUnique({ where: { code: cleanCode } });
    if (!c) {
      return { valid: false, message: `El código promocional "${cleanCode}" no existe o es incorrecto.` };
    }

    const coupon = mapCoupon(c);
    if (!coupon.isActive) {
      return { valid: false, message: `El código promocional "${cleanCode}" está desactivado temporalmente.` };
    }

    if (coupon.expiresAt) {
      const expDate = new Date(coupon.expiresAt).getTime();
      if (!isNaN(expDate) && expDate < Date.now()) {
        const dateStr = new Date(coupon.expiresAt).toLocaleDateString('es-ES');
        return { valid: false, message: `El código "${cleanCode}" ha caducado (finalizó el ${dateStr}).` };
      }
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return { valid: false, message: `El código "${cleanCode}" ha alcanzado el límite máximo de usos disponibles.` };
    }

    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return {
        valid: false,
        message: `El código "${cleanCode}" requiere un pedido mínimo de ${coupon.minOrderAmount.toFixed(2)}€ (tu subtotal actual es de ${subtotal.toFixed(2)}€).`,
      };
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = Math.round((subtotal * coupon.discountValue / 100) * 100) / 100;
    } else {
      discountAmount = Math.min(coupon.discountValue, subtotal);
    }
    discountAmount = Math.min(discountAmount, subtotal);

    return {
      valid: true,
      message: `¡Cupón ${cleanCode} aplicado con éxito! (-${discountAmount.toFixed(2)}€)`,
      coupon,
      discountAmount,
    };
  },

  async incrementCouponUsage(code: string): Promise<void> {
    const clean = code.trim().toUpperCase();
    await prisma.coupon.updateMany({
      where: { code: clean },
      data: { usedCount: { increment: 1 } },
    });
  },
};

