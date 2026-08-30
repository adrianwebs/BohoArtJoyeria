# ✨ Bohoart Jewelry - Ecommerce de Joyería Artesanal en Arcilla Polimérica

Tienda online completa y moderna para **Bohoart Jewelry**, desarrollada con **Next.js 15 (App Router)**, base de datos **Microsoft SQL Server (Prisma ORM)**, pasarela preparada para **PayPal**, panel de administración integral y despliegue automatizado con **Docker + GitHub Actions CI/CD**.

---

## 🌟 Características Principales

### 🛍️ Storefront (Tienda Pública)
- **Landing Page Editorial**: Banner principal (Hero), colecciones destacadas, top ventas, sección sobre la ligereza e hipoalergenicidad de la arcilla polimérica, muro de testimonios y feed de Instagram.
- **Catálogo Interactivo (`/catalogo`)**: Buscador en tiempo real, filtro por categoría, filtro por rango de precio, selector de stock y ordenación (precio, relevancia, valoraciones, novedades).
- **Páginas de Categoría (`/categorias/[slug]`)**: Pendientes, Pulseras, Collares, Anillos y Colecciones Especiales.
- **Ficha de Producto (`/productos/[slug]`)**:
  - Galería de imágenes con miniaturas y zoom.
  - Indicador de disponibilidad inmediata y tiempo de envío.
  - Selector de cantidad y cálculo dinámico de precio.
  - Acordeones de *Materiales & Especificaciones*, *Cuidados de la arcilla* y *Envíos/Devoluciones*.
  - **SEO Avanzado**: Datos estructurados **Schema.org (JSON-LD)** de tipo `Product`, `Offer` y `AggregateRating` para Google Shopping y Rich Snippets.
  - Sección de reseñas de clientas verificadas y modal para enviar nuevas valoraciones.
  - Productos recomendados relacionados.
- **Cesta & Carrito (`/carrito` y Drawer lateral)**:
  - Cajón lateral desplegable accesible desde cualquier página.
  - Barra de progreso para **Envío Gratis** (a partir de 40€).
  - Persistencia de carrito en `localStorage`.
- **Checkout en 1 Paso (`/checkout`)**:
  - Formulario de dirección y contacto con validación.
  - Integración de pago con **PayPal** y Tarjeta.
  - Notas de pedido y opción de dedicatoria de regalo.
- **Página de Confirmación (`/checkout/exito`)**:
  - Resumen del pedido, número de orden (`BH-2026-XXXX`) y plazos de entrega.
- **Páginas de Confianza & Legales**:
  - `/sobre-nosotros` (Historia y valor del taller artesanal).
  - `/faq` (Preguntas frecuentes sobre peso, cuidados y materiales).
  - `/contacto` (Formulario de contacto y enlaces a Instagram).
  - `/envios-y-devoluciones`, `/aviso-legal`, `/privacidad`, `/cookies`.
  - `/sitemap.xml` y `/robots.txt` generados dinámicamente.

---

### 🛡️ Panel de Administración (`/admin` y `/login`)
- **Acceso Seguro**: Autenticación con credenciales y cookie de sesión JWT (`/login`).
  - *Email por defecto*: `admin@bohoartjoyeria.com`
  - *Contraseña*: `adminpassword123`
- **Dashboard con Métricas**:
  - Ingresos totales acumulados.
  - Pedidos activos y pendientes de envío.
  - Joyas registradas en catálogo.
  - Reseñas pendientes de moderación.
  - Alerta de piezas con stock bajo.
- **Gestión de Productos (`/admin/productos`)**:
  - CRUD completo: Crear, editar, cambiar precio, añadir fotos placeholder o reales, stock, activar/desactivar y marcar destacados en portada.
- **Gestión de Categorías (`/admin/categorias`)**:
  - Creación y edición de colecciones con fotos de portada y orden.
- **Gestión de Pedidos (`/admin/pedidos`)**:
  - Listado con filtros por estado (`PAID`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
  - Asignación de número de seguimiento (tracking).
  - Visualización completa de cliente, dirección y artículos.
- **Directorio de Clientes (`/admin/clientes`)**:
  - Clientes agregados con total de pedidos y volumen de compra.
- **Moderación de Reseñas (`/admin/reviews`)**:
  - Aprobación o eliminación de opiniones de clientes en 1 clic.
- **Configuración de Tienda (`/admin/configuracion`)**:
  - Modificación del texto del banner superior, coste de envío estándar, umbral de envío gratis, Client ID de PayPal y datos de contacto.

---

## 🎨 Paleta de Colores de Marca
- **Terracota Principal**: `#C87D55`
- **Arena / Nude**: `#F7EDE2` / `#FAF6F0`
- **Oro Artesanal**: `#D4A373`
- **Carbón**: `#2C2523`
- **Lino**: `#FCFBF9`
- **Salvia (Stock / Éxito)**: `#7D9D8B`

---

## 🚀 Puesta en Marcha en Desarrollo

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Generar cliente de Prisma**:
   ```bash
   npm run db:generate
   ```

3. **Iniciar el servidor local**:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🐳 Despliegue en VPS con Docker & CI/CD

El proyecto incluye:
- `Dockerfile` multi-stage optimizado para Next.js Standalone.
- `docker-compose.yml` con servicio web y contenedor de Microsoft SQL Server 2022 Express.
- `.github/workflows/deploy.yml` para despliegue continuo automatizado en tu VPS al hacer push a la rama `main`.
- Carpeta `.agents/` con documentación de marca, esquemas SQL Server y arquitectura técnica.
