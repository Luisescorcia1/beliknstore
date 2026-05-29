const STORAGE_BUCKET = "belikan-media";
const LOW_STOCK_LIMIT = 5;
const SETTINGS_KEY = "belikan-admin-supabase";

let supabaseClient = null;
let currentUser = null;
let images = [];
let products = [];
let contentItems = [];
let imageToDelete = null;
let productToDelete = null;
let contentToDelete = null;

const formatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0
});

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function toast(message, type = "default") {
  const node = $("#toast");
  node.textContent = message;
  node.style.background = type === "error" ? "#9f1239" : type === "success" ? "#14532d" : "#16120f";
  node.classList.add("show");
  window.setTimeout(() => node.classList.remove("show"), 3400);
}

function getSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
  } catch {
    return null;
  }
}

function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function publicConfigSource() {
  const settings = getSettings();
  if (!settings?.url || !settings?.anonKey) {
    throw new Error("Primero guarda la conexion de Supabase.");
  }

  return `window.BELIKAN_SUPABASE_CONFIG = {
  url: "${settings.url}",
  anonKey: "${settings.anonKey}"
};
`;
}

async function copyPublicConfig() {
  try {
    await navigator.clipboard.writeText(publicConfigSource());
    toast("Configuracion publica copiada.", "success");
  } catch (error) {
    toast(error.message, "error");
  }
}

function downloadPublicConfig() {
  try {
    const blob = new Blob([publicConfigSource()], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "supabase-config.js";
    link.click();
    URL.revokeObjectURL(url);
    toast("Archivo supabase-config.js generado.", "success");
  } catch (error) {
    toast(error.message, "error");
  }
}

function initSupabase() {
  const settings = getSettings();
  const form = $("#settingsForm");

  if (settings?.url && settings?.anonKey) {
    if (!window.supabase?.createClient) {
      toast("No se pudo cargar el cliente local de Supabase.", "error");
      $("#connectionNotice").hidden = false;
      return false;
    }

    form.elements.url.value = settings.url;
    form.elements.anonKey.value = settings.anonKey;
    supabaseClient = window.supabase.createClient(settings.url, settings.anonKey);
    $("#connectionNotice").hidden = true;
    return true;
  }

  $("#connectionNotice").hidden = false;
  return false;
}

async function refreshSession() {
  if (!supabaseClient) {
    updateSessionUi(null);
    return;
  }

  const { data, error } = await supabaseClient.auth.getSession();
  if (error) {
    toast(error.message, "error");
    return;
  }

  currentUser = data.session?.user || null;
  updateSessionUi(currentUser);
}

function updateSessionUi(user) {
  const status = $("#sessionStatus");
  const logout = $("#logoutBtn");
  const authPanel = $("#authPanel");

  if (user) {
    status.textContent = user.email || "Sesion activa";
    logout.hidden = false;
    authPanel.hidden = true;
  } else {
    status.textContent = supabaseClient ? "Sin sesion" : "Sin conexion";
    logout.hidden = true;
    authPanel.hidden = !supabaseClient;
  }
}

function requireConnection() {
  if (!supabaseClient) {
    toast("Configura la conexion de Supabase primero.", "error");
    showView("settings");
    return false;
  }
  return true;
}

function requireAuth() {
  if (!requireConnection()) return false;
  if (!currentUser) {
    toast("Inicia sesion para guardar cambios.", "error");
    return false;
  }
  return true;
}

function showView(view) {
  $$(".nav-item").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
  $$("[data-view-panel]").forEach((panel) => panel.classList.toggle("active", panel.dataset.viewPanel === view));
}

function safeText(value, fallback = "Sin dato") {
  return value === null || value === undefined || value === "" ? fallback : String(value);
}

function escapeHtml(value) {
  return safeText(value, "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function publicImage(url) {
  return url || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 560'%3E%3Crect width='900' height='560' fill='%23ead3b7'/%3E%3Cpath d='M120 420 330 180l140 150 92-88 218 178Z' fill='%23f25c2a' opacity='.55'/%3E%3Ccircle cx='645' cy='175' r='70' fill='%230f766e' opacity='.45'/%3E%3C/svg%3E";
}

async function loadAllData() {
  if (!supabaseClient) {
    renderImages();
    renderProducts();
    renderContent();
    updateMetrics();
    return;
  }

  await Promise.all([loadImages(), loadProducts(), loadContent()]);
  updateMetrics();
}

async function loadImages() {
  const { data, error } = await supabaseClient
    .from("site_images")
    .select("*")
    .order("section", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    toast(`No se pudieron cargar imagenes: ${error.message}`, "error");
    return;
  }

  images = data || [];
  renderImages();
}

async function loadProducts() {
  const { data, error } = await supabaseClient
    .from("catalog_products")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    toast(`No se pudo cargar inventario: ${error.message}`, "error");
    return;
  }

  products = data || [];
  renderProducts();
}

async function loadContent() {
  const { data, error } = await supabaseClient
    .from("site_content")
    .select("*")
    .order("section", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    toast(`No se pudo cargar contenido: ${error.message}`, "error");
    return;
  }

  contentItems = data || [];
  renderContent();
}

function renderImages() {
  const grid = $("#imagesGrid");
  const query = $("#imageSearch").value.trim().toLowerCase();
  const filtered = images.filter((item) => {
    const haystack = [item.image_key, item.title, item.section, item.alt].join(" ").toLowerCase();
    return haystack.includes(query);
  });

  if (!filtered.length) {
    grid.innerHTML = `<div class="panel auth-panel"><p>No hay imagenes para mostrar.</p></div>`;
    return;
  }

  grid.innerHTML = filtered
    .map((item) => `
      <article class="image-card">
        <div class="image-preview" style="background-image:url(&quot;${escapeHtml(publicImage(item.image_url))}&quot;)"></div>
        <div class="image-card-content">
          <p class="eyebrow">${escapeHtml(item.section)}</p>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.alt || item.image_key)}</p>
          <div class="tag-row">
            <span class="tag">${escapeHtml(item.image_key)}</span>
            <span class="tag ${item.is_active ? "active" : "inactive"}">${item.is_active ? "Activa" : "Inactiva"}</span>
            <span class="tag">Orden ${Number(item.sort_order || 0)}</span>
          </div>
          <div class="card-actions">
            <button class="secondary" type="button" data-edit-image="${item.id}">Editar</button>
          </div>
        </div>
      </article>
    `)
    .join("");
}

function renderProducts() {
  const table = $("#productsTable");
  const query = $("#productSearch").value.trim().toLowerCase();
  const status = $("#statusFilter").value;
  const filtered = products.filter((item) => {
    const haystack = [item.name, item.sku, item.category, item.slug].join(" ").toLowerCase();
    const statusMatches = status === "all" || item.status === status;
    return statusMatches && haystack.includes(query);
  });

  if (!filtered.length) {
    table.innerHTML = `<tr><td colspan="6">No hay productos para mostrar.</td></tr>`;
    return;
  }

  table.innerHTML = filtered
    .map((item) => `
      <tr>
        <td>
          <div class="product-cell">
            <div class="product-thumb" style="background-image:url(&quot;${escapeHtml(publicImage(item.image_url))}&quot;)"></div>
            <div>
              <strong>${escapeHtml(item.name)}</strong>
              <span>${escapeHtml(item.sku)} / ${escapeHtml(item.slug)}</span>
            </div>
          </div>
        </td>
        <td>${escapeHtml(item.category)}</td>
        <td>${formatter.format(Number(item.price_cop || 0))}</td>
        <td class="${Number(item.stock || 0) <= LOW_STOCK_LIMIT ? "stock-low" : ""}">${Number(item.stock || 0)}</td>
        <td><span class="status-pill ${escapeHtml(item.status)}">${escapeHtml(item.status)}</span></td>
        <td>
          <div class="row-actions">
            <button class="secondary" type="button" data-edit-product="${item.id}">Editar</button>
          </div>
        </td>
      </tr>
    `)
    .join("");
}

function renderContent() {
  const table = $("#contentTable");
  if (!table) return;

  const query = $("#contentSearch").value.trim().toLowerCase();
  const filtered = contentItems.filter((item) => {
    const haystack = [item.content_key, item.label, item.section, item.content_value].join(" ").toLowerCase();
    return haystack.includes(query);
  });

  if (!filtered.length) {
    table.innerHTML = `<tr><td colspan="5">No hay contenido para mostrar.</td></tr>`;
    return;
  }

  table.innerHTML = filtered
    .map((item) => `
      <tr>
        <td>
          <strong>${escapeHtml(item.label)}</strong>
          <p>${escapeHtml(item.content_key)}</p>
          <span>${escapeHtml(item.content_value).slice(0, 140)}${item.content_value?.length > 140 ? "..." : ""}</span>
        </td>
        <td>${escapeHtml(item.section)}</td>
        <td>${escapeHtml(item.content_type)}</td>
        <td><span class="status-pill ${item.is_active ? "active" : "draft"}">${item.is_active ? "Activo" : "Inactivo"}</span></td>
        <td>
          <div class="row-actions">
            <button class="secondary" type="button" data-edit-content="${item.id}">Editar</button>
          </div>
        </td>
      </tr>
    `)
    .join("");
}

function updateMetrics() {
  $("#imageCount").textContent = images.filter((item) => item.is_active).length;
  $("#productCount").textContent = products.filter((item) => item.status === "active").length;
  $("#lowStockCount").textContent = products.filter((item) => item.status === "active" && Number(item.stock || 0) <= LOW_STOCK_LIMIT).length;
  $("#contentCount").textContent = contentItems.filter((item) => item.is_active).length;
}

function resetForm(form) {
  form.reset();
  form.elements.id.value = "";
}

function openDialog(id) {
  const dialog = $(`#${id}`);
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
}

function closeDialog(id) {
  const dialog = $(`#${id}`);
  if (typeof dialog.close === "function") dialog.close();
  else dialog.removeAttribute("open");
}

function openNewImage() {
  imageToDelete = null;
  resetForm($("#imageForm"));
  $("#imageForm").elements.is_active.checked = true;
  $("#imageModalTitle").textContent = "Nueva imagen";
  $("#deleteImageBtn").hidden = true;
  openDialog("imageModal");
}

function openEditImage(id) {
  const item = images.find((entry) => entry.id === id);
  if (!item) return;

  const form = $("#imageForm");
  const fields = form.elements;
  resetForm(form);
  fields.id.value = item.id;
  fields.image_key.value = item.image_key || "";
  fields.section.value = item.section || "";
  fields.title.value = item.title || "";
  fields.sort_order.value = item.sort_order || 0;
  fields.alt.value = item.alt || "";
  fields.image_url.value = item.image_url || "";
  fields.is_active.checked = Boolean(item.is_active);
  imageToDelete = item.id;
  $("#imageModalTitle").textContent = "Editar imagen";
  $("#deleteImageBtn").hidden = false;
  openDialog("imageModal");
}

function openNewProduct() {
  productToDelete = null;
  resetForm($("#productForm"));
  $("#productForm").elements.status.value = "active";
  $("#productForm").elements.stock.value = 0;
  $("#productModalTitle").textContent = "Nuevo producto";
  $("#deleteProductBtn").hidden = true;
  openDialog("productModal");
}

function openNewContent() {
  contentToDelete = null;
  resetForm($("#contentForm"));
  $("#contentForm").elements.is_active.checked = true;
  $("#contentForm").elements.content_type.value = "text";
  $("#contentModalTitle").textContent = "Nuevo contenido";
  $("#deleteContentBtn").hidden = true;
  openDialog("contentModal");
}

function openEditProduct(id) {
  const item = products.find((entry) => entry.id === id);
  if (!item) return;

  const form = $("#productForm");
  const fields = form.elements;
  resetForm(form);
  fields.id.value = item.id;
  fields.sku.value = item.sku || "";
  fields.slug.value = item.slug || "";
  fields.name.value = item.name || "";
  fields.category.value = item.category || "";
  fields.badge.value = item.badge || "";
  fields.price_cop.value = item.price_cop || 0;
  fields.stock.value = item.stock || 0;
  fields.status.value = item.status || "draft";
  fields.delivery.value = item.delivery || "";
  fields.description.value = item.description || "";
  fields.benefits.value = item.benefits || "";
  fields.guarantee.value = item.guarantee || "";
  fields.image_url.value = item.image_url || "";
  fields.featured.checked = Boolean(item.featured);
  productToDelete = item.id;
  $("#productModalTitle").textContent = "Editar producto";
  $("#deleteProductBtn").hidden = false;
  openDialog("productModal");
}

function openEditContent(id) {
  const item = contentItems.find((entry) => entry.id === id);
  if (!item) return;

  const form = $("#contentForm");
  const fields = form.elements;
  resetForm(form);
  fields.id.value = item.id;
  fields.content_key.value = item.content_key || "";
  fields.section.value = item.section || "";
  fields.label.value = item.label || "";
  fields.content_type.value = item.content_type || "text";
  fields.sort_order.value = item.sort_order || 0;
  fields.content_value.value = item.content_value || "";
  fields.is_active.checked = Boolean(item.is_active);
  contentToDelete = item.id;
  $("#contentModalTitle").textContent = "Editar contenido";
  $("#deleteContentBtn").hidden = false;
  openDialog("contentModal");
}

function cleanSlug(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function storagePath(folder, file, fallbackName) {
  const extension = file.name.includes(".") ? file.name.split(".").pop().toLowerCase() : "jpg";
  const stamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
  const name = cleanSlug(fallbackName || file.name.replace(/\.[^.]+$/, "")) || "asset";
  return `${folder}/${name}-${stamp}.${extension}`;
}

async function uploadIfNeeded(file, folder, fallbackName) {
  if (!file || !file.size) return null;

  const path = storagePath(folder, file, fallbackName);
  const { error } = await supabaseClient.storage.from(STORAGE_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: true
  });

  if (error) throw error;

  const { data } = supabaseClient.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return { publicUrl: data.publicUrl, storagePath: path };
}

async function saveImage(event) {
  event.preventDefault();
  if (!requireAuth()) return;

  const form = event.currentTarget;
  const fields = form.elements;
  const file = fields.image_file.files[0];

  try {
    const existing = images.find((item) => item.id === fields.id.value);
    const uploaded = await uploadIfNeeded(file, "site-images", fields.image_key.value);
    const payload = {
      image_key: fields.image_key.value.trim(),
      section: fields.section.value.trim(),
      title: fields.title.value.trim(),
      sort_order: Number(fields.sort_order.value || 0),
      alt: fields.alt.value.trim() || null,
      image_url: uploaded?.publicUrl || fields.image_url.value.trim() || null,
      storage_path: uploaded?.storagePath || existing?.storage_path || null,
      is_active: fields.is_active.checked
    };

    const id = fields.id.value;
    const request = id
      ? supabaseClient.from("site_images").update(payload).eq("id", id)
      : supabaseClient.from("site_images").insert(payload);
    const { error } = await request;
    if (error) throw error;

    closeDialog("imageModal");
    await loadImages();
    updateMetrics();
    toast("Imagen guardada.", "success");
  } catch (error) {
    toast(error.message, "error");
  }
}

async function saveProduct(event) {
  event.preventDefault();
  if (!requireAuth()) return;

  const form = event.currentTarget;
  const fields = form.elements;
  const file = fields.image_file.files[0];

  try {
    const existing = products.find((item) => item.id === fields.id.value);
    const uploaded = await uploadIfNeeded(file, "products", fields.sku.value || fields.name.value);
    const payload = {
      sku: fields.sku.value.trim(),
      slug: cleanSlug(fields.slug.value || fields.name.value),
      name: fields.name.value.trim(),
      category: fields.category.value.trim(),
      badge: fields.badge.value.trim() || null,
      price_cop: Number(fields.price_cop.value || 0),
      stock: Number(fields.stock.value || 0),
      status: fields.status.value,
      delivery: fields.delivery.value.trim() || null,
      description: fields.description.value.trim() || null,
      benefits: fields.benefits.value.trim() || null,
      guarantee: fields.guarantee.value.trim() || null,
      image_url: uploaded?.publicUrl || fields.image_url.value.trim() || null,
      storage_path: uploaded?.storagePath || existing?.storage_path || null,
      featured: fields.featured.checked
    };

    const id = fields.id.value;
    const request = id
      ? supabaseClient.from("catalog_products").update(payload).eq("id", id)
      : supabaseClient.from("catalog_products").insert(payload);
    const { error } = await request;
    if (error) throw error;

    closeDialog("productModal");
    await loadProducts();
    updateMetrics();
    toast("Producto guardado.", "success");
  } catch (error) {
    toast(error.message, "error");
  }
}

async function saveContent(event) {
  event.preventDefault();
  if (!requireAuth()) return;

  const form = event.currentTarget;
  const fields = form.elements;

  try {
    const payload = {
      content_key: fields.content_key.value.trim(),
      section: fields.section.value.trim(),
      label: fields.label.value.trim(),
      content_type: fields.content_type.value,
      sort_order: Number(fields.sort_order.value || 0),
      content_value: fields.content_value.value.trim(),
      is_active: fields.is_active.checked
    };

    const id = fields.id.value;
    const request = id
      ? supabaseClient.from("site_content").update(payload).eq("id", id)
      : supabaseClient.from("site_content").insert(payload);
    const { error } = await request;
    if (error) throw error;

    closeDialog("contentModal");
    await loadContent();
    updateMetrics();
    toast("Contenido guardado.", "success");
  } catch (error) {
    toast(error.message, "error");
  }
}

async function deleteImage() {
  if (!imageToDelete || !requireAuth()) return;
  if (!confirm("Eliminar esta imagen del panel?")) return;

  const { error } = await supabaseClient.from("site_images").delete().eq("id", imageToDelete);
  if (error) {
    toast(error.message, "error");
    return;
  }

  closeDialog("imageModal");
  await loadImages();
  updateMetrics();
  toast("Imagen eliminada.", "success");
}

async function deleteProduct() {
  if (!productToDelete || !requireAuth()) return;
  if (!confirm("Eliminar este producto del inventario?")) return;

  const { error } = await supabaseClient.from("catalog_products").delete().eq("id", productToDelete);
  if (error) {
    toast(error.message, "error");
    return;
  }

  closeDialog("productModal");
  await loadProducts();
  updateMetrics();
  toast("Producto eliminado.", "success");
}

async function deleteContent() {
  if (!contentToDelete || !requireAuth()) return;
  if (!confirm("Eliminar este contenido del ecommerce?")) return;

  const { error } = await supabaseClient.from("site_content").delete().eq("id", contentToDelete);
  if (error) {
    toast(error.message, "error");
    return;
  }

  closeDialog("contentModal");
  await loadContent();
  updateMetrics();
  toast("Contenido eliminado.", "success");
}

function bindEvents() {
  $$(".nav-item").forEach((button) => button.addEventListener("click", () => showView(button.dataset.view)));

  $$('[data-open-modal="imageModal"]').forEach((button) => button.addEventListener("click", openNewImage));
  $$('[data-open-modal="productModal"]').forEach((button) => button.addEventListener("click", openNewProduct));
  $$('[data-open-modal="contentModal"]').forEach((button) => button.addEventListener("click", openNewContent));
  $$('[data-close-modal]').forEach((button) => button.addEventListener("click", () => closeDialog(button.dataset.closeModal)));

  $("#imageForm").addEventListener("submit", saveImage);
  $("#productForm").addEventListener("submit", saveProduct);
  $("#contentForm").addEventListener("submit", saveContent);
  $("#deleteImageBtn").addEventListener("click", deleteImage);
  $("#deleteProductBtn").addEventListener("click", deleteProduct);
  $("#deleteContentBtn").addEventListener("click", deleteContent);

  $("#imageSearch").addEventListener("input", renderImages);
  $("#productSearch").addEventListener("input", renderProducts);
  $("#contentSearch").addEventListener("input", renderContent);
  $("#statusFilter").addEventListener("change", renderProducts);
  $("#refreshImages").addEventListener("click", async () => {
    if (requireConnection()) await loadImages();
  });
  $("#refreshProducts").addEventListener("click", async () => {
    if (requireConnection()) await loadProducts();
  });
  $("#refreshContent").addEventListener("click", async () => {
    if (requireConnection()) await loadContent();
  });

  document.addEventListener("click", (event) => {
    const imageButton = event.target.closest("[data-edit-image]");
    if (imageButton) openEditImage(imageButton.dataset.editImage);

    const productButton = event.target.closest("[data-edit-product]");
    if (productButton) openEditProduct(productButton.dataset.editProduct);

    const contentButton = event.target.closest("[data-edit-content]");
    if (contentButton) openEditContent(contentButton.dataset.editContent);
  });

  $("#productForm").elements.name.addEventListener("blur", (event) => {
    const form = $("#productForm");
    if (!form.elements.slug.value.trim()) form.elements.slug.value = cleanSlug(event.target.value);
  });

  $("#settingsForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    saveSettings({ url: form.elements.url.value.trim(), anonKey: form.elements.anonKey.value.trim() });
    initSupabase();
    await refreshSession();
    await loadAllData();
    toast("Conexion guardada.", "success");
  });

  $("#clearSettings").addEventListener("click", () => {
    localStorage.removeItem(SETTINGS_KEY);
    supabaseClient = null;
    currentUser = null;
    images = [];
    products = [];
    contentItems = [];
    updateSessionUi(null);
    $("#connectionNotice").hidden = false;
    renderImages();
    renderProducts();
    renderContent();
    updateMetrics();
    toast("Conexion local borrada.");
  });

  $("#copyPublicConfig").addEventListener("click", copyPublicConfig);
  $("#downloadPublicConfig").addEventListener("click", downloadPublicConfig);

  $("#loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!requireConnection()) return;

    const form = event.currentTarget;
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: form.elements.email.value.trim(),
      password: form.elements.password.value
    });

    if (error) {
      toast(error.message, "error");
      return;
    }

    currentUser = data.user;
    updateSessionUi(currentUser);
    await loadAllData();
    form.reset();
    toast("Sesion iniciada.", "success");
  });

  $("#logoutBtn").addEventListener("click", async () => {
    if (!supabaseClient) return;
    await supabaseClient.auth.signOut();
    currentUser = null;
    updateSessionUi(null);
    toast("Sesion cerrada.");
  });
}

async function boot() {
  bindEvents();
  const ready = initSupabase();
  updateSessionUi(null);

  if (ready) {
    await refreshSession();
    await loadAllData();
  } else {
    showView("settings");
    renderImages();
    renderProducts();
    renderContent();
  }
}

boot();
