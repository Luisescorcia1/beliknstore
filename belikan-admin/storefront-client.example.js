// Example adapter for the public ecommerce.
// Copy the relevant functions into the storefront when Supabase credentials are ready.

const BELIKAN_SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const BELIKAN_SUPABASE_ANON_KEY = "YOUR_ANON_PUBLIC_KEY";

const belikanDb = window.supabase.createClient(BELIKAN_SUPABASE_URL, BELIKAN_SUPABASE_ANON_KEY);

async function fetchCatalogProducts() {
  const { data, error } = await belikanDb
    .from("catalog_products")
    .select("*")
    .eq("status", "active")
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;

  return (data || []).map((product) => ({
    id: product.slug,
    category: product.category,
    name: product.name,
    description: product.description || "",
    benefits: product.benefits || "",
    price: product.price_cop,
    delivery: product.delivery || "24-72h",
    guarantee: product.guarantee || "Revision al recibir",
    badge: product.badge || "",
    image: product.image_url || ""
  }));
}

async function fetchSiteImages(section) {
  let query = belikanDb
    .from("site_images")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (section) query = query.eq("section", section);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function fetchSiteContent(section) {
  let query = belikanDb
    .from("site_content")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (section) query = query.eq("section", section);

  const { data, error } = await query;
  if (error) throw error;
  return Object.fromEntries((data || []).map((item) => [item.content_key, item.content_value]));
}
