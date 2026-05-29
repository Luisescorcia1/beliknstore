# Belikan Admin

Aplicativo estatico para controlar dos areas que consumen la misma base de datos Supabase:

- Imagenes generales del ecommerce: hero, banners, lookbook, categorias y piezas visuales globales.
- Inventario del catalogo: productos, categorias, precio, stock, estado, badge e imagen principal.
- Contenido del ecommerce: textos, datos de contacto, WhatsApp, ticker, politicas y mensajes globales.

## Archivos

- `index.html`: panel administrativo.
- `styles.css`: interfaz responsive.
- `app.js`: conexion Supabase, autenticacion, CRUD y carga a Storage.
- `vendor/supabase.js`: cliente Supabase JS servido localmente para no depender del CDN en ejecucion.
- `storefront-client.example.js`: ejemplo para que el ecommerce publico lea las mismas tablas.
- `supabase/schema.sql`: tablas, RLS policies, bucket `belikan-media` y datos iniciales.

## Configuracion

1. Crea un proyecto en Supabase.
2. En Supabase SQL Editor ejecuta `supabase/schema.sql` completo.
3. En Supabase Auth crea un usuario administrador con email y password.
4. Abre `belikan-admin/index.html` en el navegador.
5. Entra a `Conexion Supabase` y guarda:
   - Project URL.
   - anon public key.
6. Inicia sesion con el usuario de Supabase Auth.

No pegues la `service_role key` en esta app. Esta pensada para usar `anon public key` + Auth + RLS.

## Tablas compartidas

El ecommerce publico lee los mismos datos con estas tablas:

- `catalog_products`
- `site_images`
- `site_content`

Consultas base:

```js
const { data: products } = await supabase
  .from("catalog_products")
  .select("*")
  .eq("status", "active")
  .order("category", { ascending: true });

const { data: images } = await supabase
  .from("site_images")
  .select("*")
  .eq("is_active", true)
  .order("sort_order", { ascending: true });

const { data: content } = await supabase
  .from("site_content")
  .select("*")
  .eq("is_active", true)
  .order("sort_order", { ascending: true });
```

Las policies permiten lectura publica solo de productos activos, imagenes activas y contenido activo. La escritura queda limitada a usuarios autenticados.

## Conexion del ecommerce publico

Las paginas principales cargan `supabase-config.js` antes de `app.js`. Completa ese archivo con la Project URL y la anon public key para que la tienda lea Supabase directamente.

Si abres primero `belikan-admin/` y guardas la conexion desde el panel, la tienda tambien puede reutilizar esa configuracion desde `localStorage` cuando se sirve bajo el mismo dominio.

Si abres la tienda en otro dominio, por ejemplo `*.devtunnels.ms`, el `localStorage` del admin no se comparte. En ese caso entra a `BELIKAN ADMIN > Conexion Supabase` y usa `Copiar supabase-config.js` o `Descargar supabase-config.js`; luego reemplaza el archivo `supabase-config.js` de la raiz del ecommerce.

Si ya habias ejecutado una version anterior de `supabase/schema.sql`, ejecutalo de nuevo. Es idempotente y agregara `site_content` sin borrar datos existentes.

## Imagenes controladas desde BELIKAN ADMIN

- Inicio hero: `site_images.image_key = home_hero`.
- Inicio lookbook: `site_images.image_key = home_lookbook`.
- Imagen de cada producto: `catalog_products.image_url`, editable desde `Inventario catalogo`.

La ecommerce no usa imagenes reales hardcodeadas en CSS. Si Supabase no carga, solo muestra fondos degradados de respaldo para evitar vender contenido visual desactualizado.

## Ejecucion local recomendada

Desde la carpeta `Lui` puedes servir archivos estaticos con Python:

```powershell
python -m http.server 5500
```

Luego abre:

```text
http://localhost:5500/belikan-admin/
```

Tambien puedes abrir el HTML directamente, pero un servidor local evita restricciones del navegador con algunos recursos.
