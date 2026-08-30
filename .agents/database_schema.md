# 🗄️ Esquema de Base de Datos - Microsoft SQL Server (Prisma ORM)

Este documento describe la estructura relacional de datos utilizada en Bohoart Jewelry.

## 1. Conexión y Proveedor
- **Motor**: Microsoft SQL Server 2019 / 2022 / Azure SQL
- **ORM**: Prisma (`provider = "sqlserver"`)
- **String de Conexión**: `sqlserver://<HOST>:<PORT>;database=<DB>;user=<USER>;password=<PASSWORD>;encrypt=true;trustServerCertificate=true`

---

## 2. Modelos Relacionales

### `User` (Usuarios y Administradores)
- `id`: String (UUID o CUID) - Primary Key
- `name`: String
- `email`: String (Unique)
- `passwordHash`: String
- `role`: Enum (`ADMIN`, `CUSTOMER`)
- `createdAt`: DateTime (default: now)
- `updatedAt`: DateTime (updatedAt)
- *Relaciones*: `orders: Order[]`, `reviews: Review[]`

### `Category` (Categorías del Catálogo)
- `id`: String - Primary Key
- `name`: String (ej: "Pendientes", "Pulseras", "Collares", "Anillos", "Colecciones Especiales")
- `slug`: String (Unique)
- `description`: String (Nullable)
- `image`: String (URL de la imagen de portada)
- `sortOrder`: Int (default: 0)
- `createdAt`: DateTime
- *Relaciones*: `products: Product[]`

### `Product` (Joyas y Accesorios)
- `id`: String - Primary Key
- `name`: String
- `slug`: String (Unique)
- `description`: String (Markdown/HTML)
- `shortDescription`: String (Nullable)
- `price`: Decimal(10,2) (Precio de venta en EUR)
- `comparePrice`: Decimal(10,2) (Nullable, precio antes de rebaja)
- `costPrice`: Decimal(10,2) (Nullable, coste de fabricación)
- `stock`: Int (default: 10)
- `sku`: String (Nullable)
- `materials`: String (ej: "Arcilla polimérica premium, fornituras hipoalergénicas en acero inoxidable dorado")
- `dimensions`: String (ej: "5.5 cm x 3.0 cm, peso 4g")
- `images`: String (JSON Array de URLs de fotos)
- `isFeatured`: Boolean (default: false, para home)
- `isActive`: Boolean (default: true)
- `categoryId`: String (Foreign Key -> Category)
- `createdAt`: DateTime
- `updatedAt`: DateTime
- *Relaciones*: `category: Category`, `orderItems: OrderItem[]`, `reviews: Review[]`

### `Order` (Pedidos y Ventas)
- `id`: String - Primary Key
- `orderNumber`: String (Unique, ej: "BH-2026-0001")
- `customerName`: String
- `customerEmail`: String
- `customerPhone`: String (Nullable)
- `shippingAddress`: String
- `city`: String
- `postalCode`: String
- `province`: String
- `country`: String (default: "ES")
- `subtotal`: Decimal(10,2)
- `shippingCost`: Decimal(10,2)
- `totalAmount`: Decimal(10,2)
- `status`: Enum (`PENDING`, `PAID`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`)
- `paymentMethod`: String (default: "PAYPAL")
- `paypalOrderId`: String (Nullable)
- `trackingNumber`: String (Nullable)
- `notes`: String (Nullable)
- `createdAt`: DateTime
- `updatedAt`: DateTime
- *Relaciones*: `items: OrderItem[]`, `user: User?`

### `OrderItem` (Detalle de Producto en Pedido)
- `id`: String - Primary Key
- `orderId`: String (Foreign Key -> Order)
- `productId`: String (Foreign Key -> Product)
- `productName`: String
- `productImage`: String
- `unitPrice`: Decimal(10,2)
- `quantity`: Int

### `Review` (Reseñas y Valoraciones de Clientes)
- `id`: String - Primary Key
- `productId`: String (Foreign Key -> Product)
- `authorName`: String
- `authorEmail`: String
- `rating`: Int (1 a 5 estrellas)
- `title`: String (Nullable)
- `comment`: String
- `isApproved`: Boolean (default: false, moderación desde admin)
- `isVerifiedBuyer`: Boolean (default: false)
- `createdAt`: DateTime

### `StoreSetting` (Configuración de la Tienda)
- `id`: String - Primary Key
- `storeName`: String (default: "Bohoart Jewelry")
- `announcementText`: String
- `freeShippingThreshold`: Decimal(10,2) (ej: 40.00 EUR)
- `standardShippingCost`: Decimal(10,2) (ej: 3.95 EUR)
- `paypalClientId`: String (Nullable)
- `contactEmail`: String
- `instagramUrl`: String
- `updatedAt`: DateTime
