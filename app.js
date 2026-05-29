const DEFAULT_PHONE = "573224347855";

let phone = DEFAULT_PHONE;
let products = [];
let siteContent = {};
let siteImages = {};
let storeReady = false;

const translations = {
  en: {
    navCatalog: "Catalog",
    navAbout: "About",
    navServices: "Services",
    navReviews: "Reviews",
    navTrack: "Tracking",
    navContact: "Contact",
    cart: "Cart",
    heroEyebrow: "Colombian urban fashion, cash on delivery",
    heroCopy: "Caps, accessories and perfumes to express style, presence and confidence through a modern online shop.",
    shopNow: "Shop catalog",
    whatsapp: "Buy on WhatsApp",
    delivery: "Estimated delivery",
    coverage: "National coverage",
    payment: "Cash on delivery",
    aboutEyebrow: "About us",
    aboutTitle: "Identity, presence and trend in one store.",
    aboutText: "Belikan was born to help people express style and confidence. More than selling products, we curate pieces that elevate personal image and connect with urban, elegant and modern styles.",
    promiseTitle: "Brand promise",
    promiseText: "An accessible, visual and personalized online shopping experience for Colombia.",
    servicesEyebrow: "Priority services",
    servicesTitle: "Shop with advice and fast delivery.",
    serviceOneTitle: "Online sales",
    serviceOneText: "Caps, accessories and perfumes with instant payment or cash on delivery.",
    serviceTwoTitle: "Style advice",
    serviceTwoText: "Recommendations by outfit, occasion, taste and budget.",
    serviceThreeTitle: "Combos and promotions",
    serviceThreeText: "Build your presence with cap, perfume and accessory kits.",
    serviceFourTitle: "Direct support",
    serviceFourText: "Support through WhatsApp, Instagram, TikTok and Facebook as Belikn.",
    catalogEyebrow: "Belikan catalog",
    catalogTitle: "Products to look, smell and feel better.",
    filterAll: "All",
    filterCaps: "Caps",
    filterPerfumes: "Perfumes",
    filterAccessories: "Accessories",
    lookbookEyebrow: "Lookbook",
    lookbookTitle: "From order to outfit: pieces that speak before you do.",
    lookbookText: "Pair a statement cap, a clean scent and metal accessories to project effortless confidence.",
    reserve: "Book advice",
    reviewsEyebrow: "Reviews",
    reviewsTitle: "Customers who buy presence.",
    reviewOne: "\"The cap arrived fast and the perfume smells premium. They advised me on WhatsApp.\"",
    reviewTwo: "\"I bought a gift combo. The presentation felt premium and payment was easy.\"",
    reviewThree: "\"They helped me choose something that matched my style. I would buy again.\"",
    trackEyebrow: "Tracking",
    trackTitle: "Check your order.",
    trackLabel: "Order code",
    trackButton: "Check",
    faqOneTitle: "How long does delivery take?",
    faqOneText: "Between 24 and 72 business hours depending on city and logistics coverage.",
    faqTwoTitle: "Is there a guarantee?",
    faqTwoText: "Yes. We validate factory defects and issues reported when receiving the product.",
    faqThreeTitle: "How do I pay?",
    faqThreeText: "You can pay immediately or request cash on delivery where available.",
    contactEyebrow: "Contact",
    contactTitle: "Let's talk about your next outfit.",
    contactText: "No physical store. We serve all Colombia through WhatsApp, social media and email.",
    name: "Name",
    interest: "Interest",
    message: "Message",
    sendWhatsapp: "Send to WhatsApp",
    policiesTitle: "Shopping policies",
    policiesText: "We confirm availability before dispatch. Changes depend on product condition and timely reporting. Times may vary by city, carrier or season.",
    footer: "Fashion, presence and identity for Colombia.",
    footerPolicies: "Policies",
    yourSelection: "Your selection",
    checkout: "Order on WhatsApp",
    botWelcome: "Hi. I can help with bookings, orders, PQR or style advice."
  }
};

let cart = [];
let activeFilter = "all";

const formatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0
});

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function savedSupabaseConfig() {
  try {
    return JSON.parse(localStorage.getItem("belikan-admin-supabase") || "null");
  } catch {
    return null;
  }
}

function storefrontSupabase() {
  const config = window.BELIKAN_SUPABASE_CONFIG?.url ? window.BELIKAN_SUPABASE_CONFIG : savedSupabaseConfig();
  if (!config?.url || !config?.anonKey || !window.supabase?.createClient) {
    document.documentElement.dataset.belikanDb = "disconnected";
    console.warn("BELIKAN ecommerce sin conexion Supabase. Completa supabase-config.js con la misma URL y anon key de BELIKAN ADMIN.");
    return null;
  }
  document.documentElement.dataset.belikanDb = "connected";
  return window.supabase.createClient(config.url, config.anonKey);
}

function mapSupabaseProduct(product) {
  return {
    id: product.slug,
    category: product.category,
    name: product.name,
    description: product.description || "",
    benefits: product.benefits || "",
    price: Number(product.price_cop || 0),
    delivery: product.delivery || "24-72h",
    guarantee: product.guarantee || "Revision al recibir",
    badge: product.badge || "",
    image: product.image_url || ""
  };
}

async function loadCatalogFromSupabase() {
  const client = storefrontSupabase();
  if (!client) {
    storeReady = false;
    renderProducts();
    renderCategoryFilters();
    return;
  }

  try {
    const { data, error } = await client
      .from("catalog_products")
      .select("*")
      .eq("status", "active")
      .order("category", { ascending: true })
      .order("name", { ascending: true });

    if (error) throw error;
    storeReady = true;
    products = (data || []).map(mapSupabaseProduct);
    renderCategoryFilters();
    renderProducts();
    renderCart();
  } catch (error) {
    storeReady = false;
    products = [];
    renderCategoryFilters();
    renderProducts();
    renderCart();
    console.warn("No se pudo cargar catalogo desde Supabase.", error);
  }
}

async function loadSiteImagesFromSupabase() {
  const client = storefrontSupabase();
  if (!client) {
    document.documentElement.dataset.belikanImages = "disconnected";
    return;
  }

  try {
    const { data, error } = await client
      .from("site_images")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    siteImages = Object.fromEntries((data || []).map((image) => [image.image_key, image]));
    applySiteImages();
    document.documentElement.dataset.belikanImages = Object.keys(siteImages).length ? "loaded" : "empty";
  } catch (error) {
    document.documentElement.dataset.belikanImages = "error";
    console.warn("No se pudieron cargar imagenes generales desde Supabase.", error);
  }
}

async function loadSiteContentFromSupabase() {
  const client = storefrontSupabase();
  if (!client) {
    applySiteContent();
    return;
  }

  try {
    const { data, error } = await client
      .from("site_content")
      .select("*")
      .eq("is_active", true)
      .order("section", { ascending: true })
      .order("sort_order", { ascending: true });

    if (error) throw error;
    siteContent = Object.fromEntries((data || []).map((item) => [item.content_key, item]));
    applySiteContent();
  } catch (error) {
    console.warn("No se pudo cargar contenido desde Supabase.", error);
  }
}

function contentValue(key, fallback = "") {
  return siteContent[key]?.content_value || fallback;
}

function applySiteContent() {
  phone = contentValue("contact_whatsapp_phone", DEFAULT_PHONE).replace(/\D/g, "") || DEFAULT_PHONE;

  $$("[data-content-key]").forEach((node) => {
    const value = contentValue(node.dataset.contentKey);
    if (!value) return;

    if (node.tagName === "A" && node.dataset.contentHref === "whatsapp") {
      node.href = `https://wa.me/${phone}`;
    } else if (node.tagName === "A" && node.dataset.contentHref === "mailto") {
      node.href = `mailto:${value}`;
    }

    node.textContent = value;
  });

  const whatsappLinks = $$('[href^="https://wa.me/"]');
  whatsappLinks.forEach((link) => {
    if (!link.href.includes("?text=")) link.href = `https://wa.me/${phone}`;
  });

  renderTicker();
}

function applySiteImages() {
  const hero = siteImages.home_hero;
  const lookbook = siteImages.home_lookbook;

  if (hero?.image_url && $(".hero-media")) {
    $(".hero-media").style.backgroundImage = `url("${hero.image_url}")`;
  }

  if (lookbook?.image_url && $(".lookbook-media")) {
    $(".lookbook-media").style.backgroundImage = `url("${lookbook.image_url}")`;
  }

  $$("[data-image-key]").forEach((node) => {
    const image = siteImages[node.dataset.imageKey];
    if (!image?.image_url) return;
    node.style.backgroundImage = `url("${image.image_url}")`;
    if (image.alt) node.setAttribute("aria-label", image.alt);
  });
}

function renderTicker() {
  const track = $(".ticker-track");
  if (!track) return;

  const configured = contentValue("ticker_items");
  const categories = [...new Set(products.map((product) => product.category).filter(Boolean))];
  const items = configured
    ? configured.split(",").map((item) => item.trim()).filter(Boolean)
    : [...categories, "Streetwear", "Outfit", "Lifestyle"].filter(Boolean);
  const doubled = [...items, ...items];

  track.innerHTML = doubled.map((item) => `<span>${escapeHtml(item)}</span>`).join("");
}

function renderCategoryFilters() {
  const filters = $(".filters");
  const categories = [...new Set(products.map((product) => product.category).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "es")
  );

  if (activeFilter !== "all" && !categories.includes(activeFilter)) activeFilter = "all";

  if (filters) {
    filters.innerHTML = [
      `<button class="filter ${activeFilter === "all" ? "active" : ""}" type="button" data-filter="all" data-i18n="filterAll">Todo</button>`,
      ...categories.map(
        (category) =>
          `<button class="filter ${activeFilter === category ? "active" : ""}" type="button" data-filter="${escapeHtml(category)}">${escapeHtml(category)}</button>`
      )
    ].join("");
  }

  const interest = $('.lead-form select[name="interest"]');
  if (interest && categories.length) {
    interest.innerHTML = [...categories, "Combo completo"].map((category) => `<option>${escapeHtml(category)}</option>`).join("");
  }
}

function renderProducts() {
  const grid = $(".product-grid");
  if (!grid) return;

  if (!storeReady) {
    grid.innerHTML = `
      <article class="product-card catalog-empty" data-reveal>
        <div class="product-info">
          <h3>Catalogo no conectado</h3>
          <p>Configura Supabase para cargar productos activos desde BELIKAN ADMIN.</p>
        </div>
      </article>
    `;
    observeReveals();
    return;
  }

  if (!products.length) {
    grid.innerHTML = `
      <article class="product-card catalog-empty" data-reveal>
        <div class="product-info">
          <h3>Sin productos activos</h3>
          <p>Activa productos en BELIKAN ADMIN para mostrarlos aqui.</p>
        </div>
      </article>
    `;
    observeReveals();
    return;
  }

  grid.innerHTML = products
    .map(
      (product) => `
      <article class="product-card" data-category="${escapeHtml(product.category)}" ${activeFilter !== "all" && activeFilter !== product.category ? "hidden" : ""} data-reveal>
        <div class="product-image" style="background-image: url(&quot;${escapeHtml(product.image)}&quot;)">
          <span class="product-badge">${escapeHtml(product.badge)}</span>
        </div>
        <div class="product-info">
          <div>
            <h3>${escapeHtml(product.name)}</h3>
            <p>${escapeHtml(product.description)}</p>
          </div>
          <p><strong>Beneficio:</strong> ${escapeHtml(product.benefits)}</p>
          <div>
            <span class="delivery-note">Entrega ${escapeHtml(product.delivery)} / ${escapeHtml(product.guarantee)}</span>
          </div>
          <div class="product-meta">
            <strong class="price">${formatter.format(product.price)}</strong>
            <button class="primary-btn add-to-cart" type="button" data-id="${escapeHtml(product.id)}">Agregar</button>
          </div>
        </div>
      </article>
    `
    )
    .join("");

  observeReveals();
}

function renderCart() {
  const items = $(".cart-items");
  if (!items || !$(".cart-count") || !$(".cart-total-value")) return;
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

  $(".cart-count").textContent = totalQty;
  $(".cart-total-value").textContent = formatter.format(total);

  if (!cart.length) {
    items.innerHTML = "<p>Tu carrito esta vacio. Agrega productos del catalogo.</p>";
    return;
  }

  items.innerHTML = cart
    .map(
      (item) => `
      <article class="cart-item">
        <div class="cart-thumb" style="background-image: url(&quot;${escapeHtml(item.image)}&quot;)"></div>
        <div>
          <strong>${escapeHtml(item.name)}</strong>
          <p>${formatter.format(item.price)}</p>
          <div class="qty-controls" aria-label="Cantidad de ${escapeHtml(item.name)}">
            <button type="button" data-action="decrease" data-id="${escapeHtml(item.id)}">-</button>
            <span>${item.qty}</span>
            <button type="button" data-action="increase" data-id="${escapeHtml(item.id)}">+</button>
          </div>
        </div>
        <button class="close-cart remove-item" type="button" data-action="remove" data-id="${escapeHtml(item.id)}" aria-label="Quitar ${escapeHtml(item.name)}">x</button>
      </article>
    `
    )
    .join("");
}

function addToCart(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;
  const existing = cart.find((item) => item.id === id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  renderCart();
  openCart();
}

function updateCart(id, action) {
  const item = cart.find((entry) => entry.id === id);
  if (!item) return;

  if (action === "increase") item.qty += 1;
  if (action === "decrease") item.qty -= 1;
  if (action === "remove" || item.qty <= 0) {
    cart = cart.filter((entry) => entry.id !== id);
  }

  renderCart();
}

function openCart() {
  if (!$(".cart-drawer")) return;
  $(".cart-drawer").style.setProperty("right", "0", "important");
  document.body.classList.add("cart-open");
  $(".cart-drawer").setAttribute("aria-hidden", "false");
}

function closeCart() {
  if (!$(".cart-drawer")) return;
  $(".cart-drawer").style.setProperty("right", "-460px", "important");
  document.body.classList.remove("cart-open");
  $(".cart-drawer").setAttribute("aria-hidden", "true");
}

function checkout() {
  if (!cart.length) return;

  const lines = cart.map((item) => `- ${item.name} x${item.qty}: ${formatter.format(item.price * item.qty)}`);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const text = `Hola Belikan, quiero hacer este pedido:%0A${lines.join("%0A")}%0ATotal: ${formatter.format(total)}%0AForma de pago: contra entrega o inmediato.`;
  window.open(`https://wa.me/${phone}?text=${text}`, "_blank", "noopener");
}

function handleLeadForm(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const text = `Hola Belikan, soy ${data.get("name")}. Me interesa: ${data.get("interest")}. ${data.get("message") || ""}`;
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
}

function handleTracking(event) {
  event.preventDefault();
  const code = $("#orderCode").value.trim().toUpperCase() || "BLK-1048";
  $(".track-result").innerHTML = `<strong>${code}</strong><br>Pedido recibido. Estado estimado: preparando despacho. Te notificaremos por WhatsApp antes de enviar.`;
}

function addChatMessage(text, type = "user") {
  const message = document.createElement("p");
  message.className = type;
  message.textContent = text;
  $(".chat-messages").appendChild(message);
  $(".chat-messages").scrollTop = $(".chat-messages").scrollHeight;
}

function botReply(text) {
  const lower = text.toLowerCase();
  let reply = "Te conecto con un asesor. Tambien puedes escribir directo al WhatsApp +57 322 434 7855.";

  if (lower.includes("reserva") || lower.includes("combo")) {
    reply = "Para reservar, dime ciudad, producto de interes y presupuesto. Te sugerimos un combo segun tu estilo.";
  }

  if (lower.includes("pedido") || lower.includes("seguimiento")) {
    reply = "Enviame tu codigo BLK o nombre de compra. Validamos estado y transportadora.";
  }

  if (lower.includes("pqr") || lower.includes("garantia")) {
    reply = "Para PQR, comparte foto del producto, fecha de entrega y descripcion de la novedad.";
  }

  window.setTimeout(() => addChatMessage(reply, "bot"), 350);
}

function switchLanguage() {
  const button = $(".lang-toggle");
  const useEnglish = button.textContent === "EN";
  button.textContent = useEnglish ? "ES" : "EN";
  document.documentElement.lang = useEnglish ? "en" : "es";

  $$("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    if (useEnglish && translations.en[key]) {
      if (!node.dataset.es) node.dataset.es = node.textContent;
      node.textContent = translations.en[key];
    } else if (!useEnglish && node.dataset.es) {
      node.textContent = node.dataset.es;
    }
  });
}

function observeReveals() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  $$("[data-reveal]:not(.visible)").forEach((element) => observer.observe(element));
}

document.addEventListener("click", (event) => {
  const addButton = event.target.closest(".add-to-cart");
  if (addButton) addToCart(addButton.dataset.id);

  const cartAction = event.target.closest("[data-action]");
  if (cartAction) updateCart(cartAction.dataset.id, cartAction.dataset.action);

  const filter = event.target.closest(".filter");
  if (filter) {
    activeFilter = filter.dataset.filter;
    $$(".filter").forEach((button) => button.classList.toggle("active", button === filter));
    renderProducts();
  }

  if (event.target.closest(".cart-button")) openCart();
  if (event.target.closest(".close-cart") && !event.target.closest(".remove-item")) closeCart();
  if (event.target.classList.contains("scrim")) {
    closeCart();
    document.body.classList.remove("menu-open");
  }

  if (event.target.closest(".chat-toggle")) {
    document.body.classList.add("chat-open");
    $(".chat-window").setAttribute("aria-hidden", "false");
  }

  if (event.target.closest(".close-chat")) {
    document.body.classList.remove("chat-open");
    $(".chat-window").setAttribute("aria-hidden", "true");
  }

  const quickReply = event.target.closest("[data-reply]");
  if (quickReply) {
    addChatMessage(quickReply.dataset.reply);
    botReply(quickReply.dataset.reply);
  }
});

if ($(".checkout")) $(".checkout").addEventListener("click", checkout);
if ($(".lead-form")) $(".lead-form").addEventListener("submit", handleLeadForm);
if ($(".track-form")) $(".track-form").addEventListener("submit", handleTracking);
if ($(".lang-toggle")) $(".lang-toggle").addEventListener("click", switchLanguage);

if ($(".menu-toggle")) {
  $(".menu-toggle").addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("menu-open");
    $(".menu-toggle").setAttribute("aria-expanded", String(isOpen));
  });
}

$$(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    document.body.classList.remove("menu-open");
    $(".menu-toggle").setAttribute("aria-expanded", "false");
  });
});

if ($(".chat-form")) {
  $(".chat-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = event.currentTarget.chat;
    const text = input.value.trim();
    if (!text) return;
    addChatMessage(text);
    botReply(text);
    input.value = "";
  });
}

async function boot() {
  renderCategoryFilters();
  renderProducts();
  renderCart();
  observeReveals();
  await Promise.all([loadCatalogFromSupabase(), loadSiteImagesFromSupabase(), loadSiteContentFromSupabase()]);
}

boot();
