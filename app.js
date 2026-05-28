const phone = "573224347855";

const products = [
  {
    id: "cap-noir",
    category: "gorras",
    name: "Gorra Noir Street",
    description: "Gorra negra de perfil urbano, ajustable y facil de combinar.",
    benefits: "Eleva outfits casuales y proyecta presencia limpia.",
    price: 89000,
    delivery: "24-72h",
    guarantee: "Cambio por defecto de fabrica",
    badge: "Top",
    image: "https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "cap-cream",
    category: "gorras",
    name: "Gorra Urban Cream",
    description: "Tono claro premium para looks modernos y minimalistas.",
    benefits: "Aporta contraste, frescura e identidad visual.",
    price: 94000,
    delivery: "24-72h",
    guarantee: "Revision al recibir",
    badge: "Nuevo",
    image: "https://images.unsplash.com/photo-1529958030586-3aae4ca485ff?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "perfume-axis",
    category: "perfumes",
    name: "Perfume Axis 50ml",
    description: "Aroma versatil con salida fresca y fondo elegante.",
    benefits: "Ideal para citas, oficina, universidad y noche.",
    price: 129000,
    delivery: "24-72h",
    guarantee: "Producto sellado",
    badge: "Best seller",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "perfume-volt",
    category: "perfumes",
    name: "Perfume Volt 100ml",
    description: "Fragancia intensa para presencia memorable.",
    benefits: "Proyecta seguridad, personalidad y estilo nocturno.",
    price: 169000,
    delivery: "48-72h",
    guarantee: "Producto sellado",
    badge: "Intenso",
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "chain-steel",
    category: "accesorios",
    name: "Cadena Steel Line",
    description: "Accesorio metalico sobrio para outfits urbanos.",
    benefits: "Suma detalle sin sobrecargar tu imagen.",
    price: 59000,
    delivery: "24-72h",
    guarantee: "Revision al recibir",
    badge: "Combo",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "watch-edge",
    category: "accesorios",
    name: "Reloj Edge Black",
    description: "Reloj oscuro de linea limpia para presencia diaria.",
    benefits: "Comunica puntualidad, orden y elegancia urbana.",
    price: 149000,
    delivery: "48-72h",
    guarantee: "30 dias por defecto",
    badge: "Premium",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80"
  }
];

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

function renderProducts() {
  const grid = $(".product-grid");
  grid.innerHTML = products
    .map(
      (product) => `
      <article class="product-card" data-category="${product.category}" ${activeFilter !== "all" && activeFilter !== product.category ? "hidden" : ""} data-reveal>
        <div class="product-image" style="background-image: url('${product.image}')">
          <span class="product-badge">${product.badge}</span>
        </div>
        <div class="product-info">
          <div>
            <h3>${product.name}</h3>
            <p>${product.description}</p>
          </div>
          <p><strong>Beneficio:</strong> ${product.benefits}</p>
          <div>
            <span class="delivery-note">Entrega ${product.delivery} / ${product.guarantee}</span>
          </div>
          <div class="product-meta">
            <strong class="price">${formatter.format(product.price)}</strong>
            <button class="primary-btn add-to-cart" type="button" data-id="${product.id}">Agregar</button>
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
        <div class="cart-thumb" style="background-image: url('${item.image}')"></div>
        <div>
          <strong>${item.name}</strong>
          <p>${formatter.format(item.price)}</p>
          <div class="qty-controls" aria-label="Cantidad de ${item.name}">
            <button type="button" data-action="decrease" data-id="${item.id}">-</button>
            <span>${item.qty}</span>
            <button type="button" data-action="increase" data-id="${item.id}">+</button>
          </div>
        </div>
        <button class="close-cart remove-item" type="button" data-action="remove" data-id="${item.id}" aria-label="Quitar ${item.name}">x</button>
      </article>
    `
    )
    .join("");
}

function addToCart(id) {
  const product = products.find((item) => item.id === id);
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
  $(".cart-drawer").style.setProperty("right", "0", "important");
  document.body.classList.add("cart-open");
  $(".cart-drawer").setAttribute("aria-hidden", "false");
}

function closeCart() {
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

$(".checkout").addEventListener("click", checkout);
$(".lead-form").addEventListener("submit", handleLeadForm);
$(".track-form").addEventListener("submit", handleTracking);
$(".lang-toggle").addEventListener("click", switchLanguage);

$(".menu-toggle").addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("menu-open");
  $(".menu-toggle").setAttribute("aria-expanded", String(isOpen));
});

$$(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    document.body.classList.remove("menu-open");
    $(".menu-toggle").setAttribute("aria-expanded", "false");
  });
});

$(".chat-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = event.currentTarget.chat;
  const text = input.value.trim();
  if (!text) return;
  addChatMessage(text);
  botReply(text);
  input.value = "";
});

renderProducts();
renderCart();
observeReveals();
