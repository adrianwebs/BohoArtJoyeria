# 🏛️ Arquitectura del Sistema - Bohoart Jewelry

## 1. Stack Tecnológico
- **Framework**: Next.js 15+ (App Router con React Server Components y Server Actions)
- **Lenguaje**: TypeScript (Strict Mode)
- **Estilos**: Tailwind CSS con diseño de tokens bohemios y responsive mobile-first
- **Iconos**: Lucide React
- **Base de Datos**: Microsoft SQL Server / Azure SQL con Prisma ORM
- **Pasarela de Pagos**: PayPal REST API SDK & Smart Buttons
- **Autenticación**: JWT / NextAuth / Iron Session para panel de administración `/admin`

---

## 2. Estructura de Rutas

### Rutas Públicas (Storefront)
- `/`: Landing page de impacto visual, hero artesanal, colecciones, top ventas y testimonios.
- `/catalogo`: Catálogo completo con buscador en tiempo real, filtro por categoría y orden por precio/novedad.
- `/categorias/[slug]`: Página específica de categoría (ej: `/categorias/pendientes`).
- `/productos/[slug]`: Ficha de producto con microdatos Schema.org (Product, Offer, AggregateRating), galería interactiva, acordeones de materiales y cuidados, y caja de reseñas.
- `/carrito`: Carrito con cálculo de envío dinámico (ej: gratis a partir de 40€).
- `/checkout`: Proceso de pago en 1 paso con captura de dirección y botón oficial de PayPal.
- `/checkout/exito`: Pantalla de confirmación de pedido con resumen y número de seguimiento.
- `/sobre-nosotros`: Historia de la artesana, proceso de horneado y moldeado de arcilla.
- `/faq`: Preguntas frecuentes (tiempos de envío, cuidados de la arcilla, devoluciones).
- `/contacto`: Formulario de atención al cliente y enlace a Instagram.
- `/sitemap.xml` y `/robots.txt`: Generados dinámicamente con todas las URLs de productos y categorías para Google.

### Rutas Administrativas (`/admin`)
- `/login`: Formulario de acceso con credenciales seguras.
- `/admin`: Dashboard con gráficos de ventas, pedidos recientes, métricas de inventario y alertas.
- `/admin/productos`: Tabla de productos con estado de stock, buscador, creación rápida y modal de edición.
- `/admin/categorias`: Organización del catálogo y fotos de portada.
- `/admin/pedidos`: Lista de órdenes de compra con selector de estado instantáneo (`Pendiente`, `Pagado`, `Enviado`, `Entregado`).
- `/admin/clientes`: Directorio de clientes con volumen de compra.
- `/admin/reviews`: Bandeja de moderación de reseñas para aprobar con 1 click.
- `/admin/configuracion`: Parámetros de envío, anuncio superior y claves API de PayPal.

---

## 3. Estrategia SEO & Rendimiento
- **Renderizado Híbrido (ISR/SSR)**: Páginas de productos pre-renderizadas para máxima velocidad y rastreo instantáneo por Google Bot.
- **Datos Estructurados (JSON-LD)**: Marcado semántico para Rich Snippets (estrellas, disponibilidad de stock, precio en EUR).
- **Optimización de Imágenes**: Carga perezosa (*lazy loading*), formatos modernos (`WebP`/`AVIF`) y dimensiones fijas para evitar *Cumulative Layout Shift (CLS)*.
