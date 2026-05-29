-- Belikan shared Supabase schema
-- Run this file in Supabase SQL Editor before using belikan-admin.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.site_images (
  id uuid primary key default gen_random_uuid(),
  image_key text not null unique,
  section text not null,
  title text not null,
  alt text,
  image_url text,
  storage_path text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site_images_section_idx on public.site_images (section, sort_order);
create index if not exists site_images_active_idx on public.site_images (is_active);

drop trigger if exists set_site_images_updated_at on public.site_images;
create trigger set_site_images_updated_at
before update on public.site_images
for each row execute function public.set_updated_at();

create table if not exists public.catalog_products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  slug text not null unique,
  name text not null,
  category text not null,
  description text,
  benefits text,
  price_cop integer not null default 0 check (price_cop >= 0),
  stock integer not null default 0 check (stock >= 0),
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  badge text,
  image_url text,
  storage_path text,
  delivery text,
  guarantee text,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists catalog_products_status_idx on public.catalog_products (status);
create index if not exists catalog_products_category_idx on public.catalog_products (category);
create index if not exists catalog_products_featured_idx on public.catalog_products (featured);

drop trigger if exists set_catalog_products_updated_at on public.catalog_products;
create trigger set_catalog_products_updated_at
before update on public.catalog_products
for each row execute function public.set_updated_at();

create table if not exists public.site_content (
  id uuid primary key default gen_random_uuid(),
  content_key text not null unique,
  section text not null,
  label text not null,
  content_value text not null,
  content_type text not null default 'text' check (content_type in ('text', 'textarea', 'url', 'email', 'phone', 'csv')),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site_content_section_idx on public.site_content (section, sort_order);
create index if not exists site_content_active_idx on public.site_content (is_active);

drop trigger if exists set_site_content_updated_at on public.site_content;
create trigger set_site_content_updated_at
before update on public.site_content
for each row execute function public.set_updated_at();

alter table public.site_images enable row level security;
alter table public.catalog_products enable row level security;
alter table public.site_content enable row level security;

drop policy if exists "Public read active images" on public.site_images;
create policy "Public read active images"
on public.site_images
for select
using (is_active = true);

drop policy if exists "Authenticated manage site images" on public.site_images;
create policy "Authenticated manage site images"
on public.site_images
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public read active products" on public.catalog_products;
create policy "Public read active products"
on public.catalog_products
for select
using (status = 'active');

drop policy if exists "Authenticated manage catalog products" on public.catalog_products;
create policy "Authenticated manage catalog products"
on public.catalog_products
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public read active content" on public.site_content;
create policy "Public read active content"
on public.site_content
for select
using (is_active = true);

drop policy if exists "Authenticated manage site content" on public.site_content;
create policy "Authenticated manage site content"
on public.site_content
for all
to authenticated
using (true)
with check (true);

insert into storage.buckets (id, name, public)
values ('belikan-media', 'belikan-media', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public read Belikan media" on storage.objects;
create policy "Public read Belikan media"
on storage.objects
for select
using (bucket_id = 'belikan-media');

drop policy if exists "Authenticated upload Belikan media" on storage.objects;
create policy "Authenticated upload Belikan media"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'belikan-media');

drop policy if exists "Authenticated update Belikan media" on storage.objects;
create policy "Authenticated update Belikan media"
on storage.objects
for update
to authenticated
using (bucket_id = 'belikan-media')
with check (bucket_id = 'belikan-media');

drop policy if exists "Authenticated delete Belikan media" on storage.objects;
create policy "Authenticated delete Belikan media"
on storage.objects
for delete
to authenticated
using (bucket_id = 'belikan-media');

insert into public.site_images (image_key, section, title, alt, image_url, sort_order, is_active)
values
  ('home_hero', 'inicio', 'Hero principal', 'Imagen principal de Belikan', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80', 1, true),
  ('home_lookbook', 'inicio', 'Lookbook', 'Persona con outfit urbano Belikan', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80', 2, true)
on conflict (image_key) do nothing;

insert into public.site_content (content_key, section, label, content_value, content_type, sort_order, is_active)
values
  ('contact_whatsapp_phone', 'contacto', 'Numero WhatsApp sin +', '573224347855', 'phone', 1, true),
  ('contact_whatsapp_label', 'contacto', 'Texto WhatsApp visible', 'WhatsApp: +57 322 434 7855', 'text', 2, true),
  ('contact_email', 'contacto', 'Correo visible', 'belikn@gmail.com', 'email', 3, true),
  ('contact_social', 'contacto', 'Redes sociales', 'Instagram / TikTok / Facebook: Belikn', 'text', 4, true),
  ('hero_eyebrow', 'inicio', 'Hero etiqueta', 'Productos 100% Colombianos', 'text', 10, true),
  ('hero_title', 'inicio', 'Hero titulo', 'Belikan', 'text', 11, true),
  ('hero_copy', 'inicio', 'Hero descripcion', 'Gorras, accesorios y perfumes para expresar estilo, presencia y confianza con una compra online moderna.', 'textarea', 12, true),
  ('hero_stat_1_value', 'inicio', 'Hero indicador 1 valor', 'CO', 'text', 13, true),
  ('hero_stat_1_label', 'inicio', 'Hero indicador 1 etiqueta', 'Cobertura nacional', 'text', 14, true),
  ('hero_stat_2_value', 'inicio', 'Hero indicador 2 valor', 'COD', 'text', 15, true),
  ('hero_stat_2_label', 'inicio', 'Hero indicador 2 etiqueta', 'Contra entrega', 'text', 16, true),
  ('hero_stat_3_value', 'inicio', 'Hero indicador 3 valor', 'Entregas rapidas', 'text', 17, true),
  ('hero_stat_3_label', 'inicio', 'Hero indicador 3 etiqueta', 'Dias habiles', 'text', 18, true),
  ('ticker_items', 'inicio', 'Ticker categorias separadas por coma', 'Gorras,Perfumes,Accesorios,Streetwear,Outfit,Lifestyle', 'csv', 19, true),
  ('about_eyebrow', 'inicio', 'Sobre nosotros etiqueta', 'Sobre nosotros', 'text', 30, true),
  ('about_title', 'inicio', 'Sobre nosotros titulo', 'Identidad, presencia y tendencia en una sola tienda.', 'textarea', 31, true),
  ('about_text', 'inicio', 'Sobre nosotros texto', 'Belikan nacio para ayudar a las personas a expresar su estilo y confianza. Mas que vender productos, curamos piezas que elevan la imagen personal y conectan con estilos urbanos, elegantes y modernos.', 'textarea', 32, true),
  ('promise_title', 'inicio', 'Promesa titulo', 'Promesa de marca', 'text', 33, true),
  ('promise_text', 'inicio', 'Promesa texto', 'Una compra online accesible, visual y personalizada para todo Colombia.', 'textarea', 34, true),
  ('services_eyebrow', 'inicio', 'Servicios etiqueta', 'Servicios prioritarios', 'text', 40, true),
  ('services_title', 'inicio', 'Servicios titulo', 'Compra con asesoria y entrega rapida.', 'textarea', 41, true),
  ('service_1_title', 'inicio', 'Servicio 1 titulo', 'Venta online', 'text', 42, true),
  ('service_1_text', 'inicio', 'Servicio 1 texto', 'Gorras, accesorios y perfumes con pago inmediato o contra entrega.', 'textarea', 43, true),
  ('service_2_title', 'inicio', 'Servicio 2 titulo', 'Asesoria de estilo', 'text', 44, true),
  ('service_2_text', 'inicio', 'Servicio 2 texto', 'Recomendaciones segun outfit, ocasion, gusto y presupuesto.', 'textarea', 45, true),
  ('service_3_title', 'inicio', 'Servicio 3 titulo', 'Combos y promociones', 'text', 46, true),
  ('service_3_text', 'inicio', 'Servicio 3 texto', 'Arma tu presencia con kits de gorra, perfume y accesorio.', 'textarea', 47, true),
  ('service_4_title', 'inicio', 'Servicio 4 titulo', 'Atencion directa', 'text', 48, true),
  ('service_4_text', 'inicio', 'Servicio 4 texto', 'Soporte por WhatsApp, Instagram, TikTok y Facebook como Belikn.', 'textarea', 49, true),
  ('lookbook_eyebrow', 'inicio', 'Lookbook etiqueta', 'Lookbook', 'text', 50, true),
  ('lookbook_title', 'inicio', 'Lookbook titulo', 'Del pedido al outfit: piezas que hablan antes que tu.', 'textarea', 51, true),
  ('lookbook_text', 'inicio', 'Lookbook texto', 'Combina una gorra statement, un aroma limpio y accesorios metalicos para proyectar seguridad sin esfuerzo.', 'textarea', 52, true),
  ('policies_title', 'politicas', 'Politicas titulo', 'Politicas de compra', 'text', 60, true),
  ('policies_text', 'politicas', 'Politicas texto', 'Confirmamos disponibilidad antes del despacho. Cambios sujetos al estado del producto y reporte oportuno. Los tiempos pueden variar por ciudad, transportadora o temporada.', 'textarea', 61, true),
  ('catalog_eyebrow', 'catalogo', 'Catalogo etiqueta', 'Catalogo Belikan', 'text', 70, true),
  ('catalog_title', 'catalogo', 'Catalogo titulo', 'Productos para verse, oler y sentirse mejor.', 'textarea', 71, true),
  ('contact_eyebrow', 'contacto', 'Contacto etiqueta', 'Contacto', 'text', 80, true),
  ('contact_title', 'contacto', 'Contacto titulo', 'Hablemos de tu proximo outfit.', 'textarea', 81, true),
  ('contact_text', 'contacto', 'Contacto texto', 'Sin tienda fisica. Atendemos toda Colombia por WhatsApp, redes sociales y correo.', 'textarea', 82, true),
  ('footer_text', 'global', 'Footer texto', 'Moda, presencia e identidad para Colombia.', 'text', 90, true),
  ('bot_welcome', 'global', 'Chatbot bienvenida', 'Hola. Puedo ayudarte con reservas, pedidos, PQR o asesoria de estilo.', 'textarea', 91, true)
on conflict (content_key) do nothing;

insert into public.catalog_products (sku, slug, name, category, description, benefits, price_cop, stock, status, badge, image_url, delivery, guarantee, featured)
values
  ('BLK-CAP-NOIR', 'cap-noir', 'Gorra Noir Street', 'gorras', 'Gorra negra de perfil urbano, ajustable y facil de combinar.', 'Eleva outfits casuales y proyecta presencia limpia.', 89000, 12, 'active', 'Top', 'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=900&q=80', '24-72h', 'Cambio por defecto de fabrica', true),
  ('BLK-CAP-CREAM', 'cap-cream', 'Gorra Urban Cream', 'gorras', 'Tono claro premium para looks modernos y minimalistas.', 'Aporta contraste, frescura e identidad visual.', 94000, 8, 'active', 'Nuevo', 'https://images.unsplash.com/photo-1529958030586-3aae4ca485ff?auto=format&fit=crop&w=900&q=80', '24-72h', 'Revision al recibir', false),
  ('BLK-PERF-AXIS', 'perfume-axis', 'Perfume Axis 50ml', 'perfumes', 'Aroma versatil con salida fresca y fondo elegante.', 'Ideal para citas, oficina, universidad y noche.', 129000, 6, 'active', 'Best seller', 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80', '24-72h', 'Producto sellado', true),
  ('BLK-PERF-VOLT', 'perfume-volt', 'Perfume Volt 100ml', 'perfumes', 'Fragancia intensa para presencia memorable.', 'Proyecta seguridad, personalidad y estilo nocturno.', 169000, 4, 'active', 'Intenso', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=80', '48-72h', 'Producto sellado', false),
  ('BLK-ACC-STEEL', 'chain-steel', 'Cadena Steel Line', 'accesorios', 'Accesorio metalico sobrio para outfits urbanos.', 'Suma detalle sin sobrecargar tu imagen.', 59000, 15, 'active', 'Combo', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80', '24-72h', 'Revision al recibir', false),
  ('BLK-ACC-EDGE', 'watch-edge', 'Reloj Edge Black', 'accesorios', 'Reloj oscuro de linea limpia para presencia diaria.', 'Comunica puntualidad, orden y elegancia urbana.', 149000, 3, 'active', 'Premium', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80', '48-72h', '30 dias por defecto', false)
on conflict (sku) do nothing;
