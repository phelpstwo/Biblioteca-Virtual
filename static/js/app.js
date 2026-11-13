/* Aurora Livros — frontend
   Consome a API Flask/PostgreSQL e cuida das interações. */
(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const FAV_KEY = "aurora:favorites";
  const FONT_KEY = "aurora:font-large";

  let allBooks = [];

  // ---------- Utilidades ----------

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[char]));
  }

  function formatPrice(value) {
    return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  async function fetchJSON(url, options) {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Erro ${response.status}`);
    return data;
  }

  // ---------- Favoritos (localStorage) ----------

  function getFavorites() {
    try {
      const list = JSON.parse(localStorage.getItem(FAV_KEY));
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }

  function setFavorites(list) {
    localStorage.setItem(FAV_KEY, JSON.stringify(list));
    updateFavBadge();
  }

  function isFavorite(slug) {
    return getFavorites().includes(slug);
  }

  function toggleFavorite(slug) {
    const list = getFavorites();
    const index = list.indexOf(slug);
    if (index >= 0) list.splice(index, 1);
    else list.push(slug);
    setFavorites(list);
    updateFavButton(slug);
    renderFavorites();
  }

  function updateFavBadge() {
    const badge = $("[data-favorites-count]");
    if (!badge) return;
    const total = getFavorites().length;
    badge.textContent = String(total);
    badge.hidden = total === 0;
  }

  function updateFavButton(slug) {
    const button = $("[data-modal-fav]");
    if (!button) return;
    const active = isFavorite(slug);
    button.setAttribute("aria-pressed", String(active));
    button.textContent = active ? "Favorito ✓" : "Favoritar";
  }

  // ---------- Renderização ----------

  function bookCard(book) {
    const slug = encodeURIComponent(book.slug);
    return `
      <article class="card">
        <a class="card__link" href="#livro/${escapeHtml(book.slug)}" data-slug="${escapeHtml(book.slug)}">
          <img class="card__img" src="/covers/${slug}.svg" alt="Capa do livro ${escapeHtml(book.title)}" width="400" height="600" loading="lazy">
          <p class="card__category">${escapeHtml(book.category)}</p>
          <h3 class="card__title">${escapeHtml(book.title)}</h3>
          <p class="card__author">por ${escapeHtml(book.author)}</p>
        </a>
        <button class="card__buy" type="button" data-buy="${escapeHtml(book.slug)}">Comprar</button>
      </article>`;
  }

  function renderCatalog(books) {
    const grid = $("[data-catalog-grid]");
    const items = books.filter((book) => !book.is_ranking);
    grid.innerHTML = items.length
      ? items.map(bookCard).join("")
      : '<p class="placeholder-text">Nenhum livro encontrado.</p>';
  }

  function renderRanking(books) {
    const list = $("[data-ranking-list]");
    const items = books
      .filter((book) => book.is_ranking)
      .sort((a, b) => (a.ranking_position || 99) - (b.ranking_position || 99));
    list.innerHTML = items.length
      ? items.map((book) => {
          const slug = encodeURIComponent(book.slug);
          const position = String(book.ranking_position || 0).padStart(2, "0");
          return `
            <article class="ranking__item">
              <a class="ranking__link" href="#livro/${escapeHtml(book.slug)}" data-slug="${escapeHtml(book.slug)}">
                <span class="ranking__number">${position}</span>
                <img class="ranking__img" src="/covers/${slug}.svg" alt="Capa do livro ${escapeHtml(book.title)}" width="54" height="78" loading="lazy">
                <span class="ranking__info">
                  <span class="ranking__title">${escapeHtml(book.title)}</span>
                  <span class="ranking__author">${escapeHtml(book.author)}</span>
                </span>
                <span class="ranking__price">${formatPrice(book.price)} <span class="ranking__arrow">→</span></span>
              </a>
            </article>`;
        }).join("")
      : '<p class="placeholder-text">Nenhum livro no ranking.</p>';
  }

  function renderCategories(categories) {
    const list = $("[data-categories-list]");
    list.innerHTML = categories.map((category) => `
      <button class="category" type="button" data-category="${escapeHtml(category.slug)}" aria-label="Ver livros de ${escapeHtml(category.name)}">
        <span class="category__left">
          <span class="category__icon" style="background:${escapeHtml(category.color)}1a;color:${escapeHtml(category.color)}">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
              <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
              <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H19v3H6.5A2.5 2.5 0 0 1 4 20.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            </svg>
          </span>
          <span class="category__name">${escapeHtml(category.name)}</span>
        </span>
        <span class="category__arrow" aria-hidden="true">→</span>
      </button>`).join("");
  }

  function renderAuthors(authors) {
    const list = $("[data-authors-list]");
    list.innerHTML = authors.map((author) => `
      <button class="author" type="button" data-author="${escapeHtml(author.author)}">
        <span class="author__name">${escapeHtml(author.author)}</span>
        <span class="author__count">${author.total} ${author.total === 1 ? "livro" : "livros"}</span>
      </button>`).join("");
  }

  // ---------- Modal do livro ----------

  const modal = $("[data-modal]");
  const modalClose = $(".modal__close");

  async function openBook(slug) {
    try {
      const { book } = await fetchJSON(`/api/books/${encodeURIComponent(slug)}`);
      $("[data-modal-cover]").src = `/covers/${encodeURIComponent(book.slug)}.svg`;
      $("[data-modal-cover]").alt = `Capa do livro ${book.title}`;
      $("[data-modal-category]").textContent = book.category;
      $("[data-modal-title]").textContent = book.title;
      $("[data-modal-author]").textContent = `por ${book.author}`;
      $("[data-modal-price]").textContent = formatPrice(book.price);
      $("[data-modal-description]").textContent = book.description;
      $("[data-modal-fav]").dataset.slug = book.slug;
      $("[data-modal-buy]").dataset.slug = book.slug;
      updateFavButton(book.slug);
      search.hidden = true;
      favorites.hidden = true;
      modal.hidden = false;
      document.body.style.overflow = "hidden";
      history.replaceState(null, "", `#livro/${book.slug}`);
      modalClose.focus();
    } catch (error) {
      alert(error.message || "Não foi possível carregar o livro.");
    }
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    history.replaceState(null, "", location.pathname + location.search);
  }

  // ---------- Busca / catálogo completo ----------

  const search = $("[data-search]");
  const searchInput = $("[data-search-input]");
  const searchResults = $("[data-search-results]");
  const searchFilters = { q: "", category: "", author: "" };
  let searchTimer = null;

  function renderSearchFilters() {
    const box = $("[data-search-filters]");
    const chips = [];
    if (searchFilters.category) {
      chips.push(`<button class="search__chip" type="button" data-clear="category">Categoria: ${escapeHtml(searchFilters.category)} ×</button>`);
    }
    if (searchFilters.author) {
      chips.push(`<button class="search__chip" type="button" data-clear="author">Autor: ${escapeHtml(searchFilters.author)} ×</button>`);
    }
    box.innerHTML = chips.join("");
  }

  function renderSearchResults(books) {
    if (!books.length) {
      searchResults.innerHTML = '<p class="search__empty">Nenhum livro encontrado.</p>';
      return;
    }
    searchResults.innerHTML = books.map((book) => {
      const slug = encodeURIComponent(book.slug);
      return `
        <button class="search__item" type="button" data-slug="${escapeHtml(book.slug)}">
          <img class="search__thumb" src="/covers/${slug}.svg" alt="" width="40" height="58" loading="lazy">
          <span class="search__meta">
            <span class="search__item-title">${escapeHtml(book.title)}</span>
            <span class="search__item-author">${escapeHtml(book.author)} · ${escapeHtml(book.category)}</span>
          </span>
        </button>`;
    }).join("");
  }

  async function runSearch() {
    const params = new URLSearchParams();
    if (searchFilters.q) params.set("q", searchFilters.q);
    if (searchFilters.category) params.set("category", searchFilters.category);
    if (searchFilters.author) params.set("author", searchFilters.author);
    try {
      const { books } = await fetchJSON(`/api/books?${params.toString()}`);
      renderSearchResults(books);
    } catch {
      searchResults.innerHTML = '<p class="search__empty">Erro ao buscar. Tente novamente.</p>';
    }
  }

  function openSearch(filters = {}) {
    searchFilters = { q: "", category: "", author: "", ...filters };
    searchInput.value = searchFilters.q;
    renderSearchFilters();
    search.hidden = false;
    document.body.style.overflow = "hidden";
    runSearch();
    searchInput.focus();
  }

  function closeSearch() {
    search.hidden = true;
    document.body.style.overflow = "";
  }

  // ---------- Favoritos (painel) ----------

  const favorites = $("[data-favorites]");
  const favoritesResults = $("[data-favorites-results]");

  function renderFavorites() {
    const slugs = getFavorites();
    const items = slugs
      .map((slug) => allBooks.find((book) => book.slug === slug))
      .filter(Boolean);

    if (!items.length) {
      favoritesResults.innerHTML = '<p class="favorites__empty">Você ainda não favoritou nenhum livro.</p>';
      return;
    }

    favoritesResults.innerHTML = items.map((book) => {
      const slug = encodeURIComponent(book.slug);
      return `
        <div class="favorites__item">
          <button class="favorites__open" type="button" data-slug="${escapeHtml(book.slug)}">
            <img class="favorites__thumb" src="/covers/${slug}.svg" alt="" width="40" height="58" loading="lazy">
            <span class="search__meta">
              <span class="favorites__item-title">${escapeHtml(book.title)}</span>
              <span class="favorites__item-author">${escapeHtml(book.author)}</span>
            </span>
          </button>
          <button class="favorites__remove" type="button" data-remove="${escapeHtml(book.slug)}">Remover</button>
        </div>`;
    }).join("");
  }

  function openFavorites() {
    renderFavorites();
    favorites.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeFavorites() {
    favorites.hidden = true;
    document.body.style.overflow = "";
  }

  // ---------- Carrinho de compras ----------

  const CART_KEY = "aurora:cart";
  const cartPanel = $("[data-cart]");
  const cartBody = $("[data-cart-body]");
  const cartItems = $("[data-cart-items]");
  const cartSummary = $("[data-cart-summary]");
  const cartSuccess = $("[data-cart-success]");
  const checkoutForm = $("[data-checkout-form]");

  function getCart() {
    try {
      const list = JSON.parse(localStorage.getItem(CART_KEY));
      if (!Array.isArray(list)) return [];
      return list
        .filter((item) => item && item.slug)
        .map((item) => ({
          slug: String(item.slug),
          quantity: Math.max(1, Math.min(10, Number(item.quantity) || 1))
        }));
    } catch {
      return [];
    }
  }

  function setCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadge();
    if (!cartPanel.hidden) renderCart();
  }

  function cartCount() {
    return getCart().reduce((sum, item) => sum + item.quantity, 0);
  }

  function updateCartBadge() {
    const badge = $("[data-cart-count]");
    if (!badge) return;
    const total = cartCount();
    badge.textContent = String(total);
    badge.hidden = total === 0;
  }

  function addToCart(slug) {
    const cart = getCart();
    const item = cart.find((entry) => entry.slug === slug);
    if (item) item.quantity = Math.min(10, item.quantity + 1);
    else cart.push({ slug, quantity: 1 });
    setCart(cart);
    toast("Adicionado ao carrinho");
  }

  function changeQty(slug, delta) {
    const cart = getCart();
    const item = cart.find((entry) => entry.slug === slug);
    if (!item) return;
    item.quantity = Math.max(1, Math.min(10, item.quantity + delta));
    setCart(cart);
  }

  function removeFromCart(slug) {
    setCart(getCart().filter((entry) => entry.slug !== slug));
  }

  function renderCart() {
    const cart = getCart();
    const items = cart
      .map((entry) => ({ ...entry, book: allBooks.find((book) => book.slug === entry.slug) }))
      .filter((entry) => entry.book);

    if (!items.length) {
      cartItems.innerHTML = '<p class="cart__empty">Seu carrinho está vazio.</p>';
      cartSummary.innerHTML = "";
      checkoutForm.style.display = "none";
      return;
    }

    checkoutForm.style.display = "";
    cartItems.innerHTML = items.map(({ book, quantity }) => {
      const slug = encodeURIComponent(book.slug);
      return `
        <div class="cart__item">
          <img class="cart__thumb" src="/covers/${slug}.svg" alt="" width="40" height="58" loading="lazy">
          <span class="search__meta">
            <span class="cart__item-title">${escapeHtml(book.title)}</span>
            <span class="cart__item-author">${escapeHtml(book.author)}</span>
            <span class="cart__item-price">${formatPrice(book.price)}</span>
          </span>
          <span class="cart__qty">
            <button type="button" data-action="dec" data-slug="${escapeHtml(book.slug)}" aria-label="Diminuir quantidade">−</button>
            <span data-qty="${escapeHtml(book.slug)}">${quantity}</span>
            <button type="button" data-action="inc" data-slug="${escapeHtml(book.slug)}" aria-label="Aumentar quantidade">+</button>
          </span>
          <button class="favorites__remove" type="button" data-cart-remove="${escapeHtml(book.slug)}">Remover</button>
        </div>`;
    }).join("");

    const total = items.reduce((sum, { book, quantity }) => sum + Number(book.price) * quantity, 0);
    cartSummary.innerHTML = `<span>Total</span><strong data-cart-total>${formatPrice(total)}</strong>`;
  }

  function openCart() {
    cartBody.hidden = false;
    cartSuccess.hidden = true;
    renderCart();
    cartPanel.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeCart() {
    cartPanel.hidden = true;
    document.body.style.overflow = "";
  }

  async function submitCheckout(event) {
    event.preventDefault();
    const feedback = $("[data-checkout-feedback]");
    const name = checkoutForm.elements.name.value.trim();
    const email = checkoutForm.elements.email.value.trim();
    const payment = checkoutForm.elements.payment_method.value;
    const items = getCart().map(({ slug, quantity }) => ({ slug, quantity }));

    feedback.dataset.state = "";
    feedback.textContent = "Registrando pedido…";

    try {
      const { order } = await fetchJSON("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, payment_method: payment, items })
      });
      localStorage.removeItem(CART_KEY);
      updateCartBadge();
      cartBody.hidden = true;
      cartSuccess.hidden = false;
      $("[data-cart-success-text]").textContent =
        `Pedido #${order.id} confirmado no valor de ${formatPrice(order.total)} via ${order.payment_method}. Registrado no banco de dados (demonstração).`;
      checkoutForm.reset();
    } catch (error) {
      feedback.dataset.state = "error";
      feedback.textContent = error.message || "Não foi possível confirmar o pedido.";
    }
  }

  // ---------- Toast ----------

  let toastTimer = null;
  function toast(message) {
    let el = $(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add("toast--show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("toast--show"), 2200);
  }

  // ---------- Tamanho da fonte ----------

  function setFontLarge(active) {
    document.documentElement.classList.toggle("font-large", active);
    localStorage.setItem(FONT_KEY, active ? "1" : "0");
    $("[data-toggle-font]").setAttribute("aria-pressed", String(active));
  }

  // ---------- Newsletter ----------

  async function submitNewsletter(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const feedback = $("[data-newsletter-feedback]");
    const email = new FormData(form).get("email") || "";

    feedback.dataset.state = "";
    feedback.textContent = "Enviando…";

    try {
      const result = await fetchJSON("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      feedback.dataset.state = "ok";
      feedback.textContent = result.message || "Inscrição confirmada!";
      form.reset();
    } catch (error) {
      feedback.dataset.state = "error";
      feedback.textContent = error.message || "Não foi possível assinar.";
    }
  }

  // ---------- Menu mobile ----------

  function setupMenu() {
    const toggle = $(".nav__toggle");
    const menu = $("#menu-principal");
    if (!toggle || !menu) return;

    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("nav__menu--open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    });

    menu.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        menu.classList.remove("nav__menu--open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // ---------- Eventos globais ----------

  function setupEvents() {
    // Links para o modal
    document.addEventListener("click", (event) => {
      const link = event.target.closest('a[href^="#livro/"]');
      if (link) {
        event.preventDefault();
        openBook(link.dataset.slug);
        return;
      }

      const openSearchButton = event.target.closest("[data-open-search]");
      if (openSearchButton) {
        openSearch();
        return;
      }

      const openFavoritesButton = event.target.closest("[data-open-favorites]");
      if (openFavoritesButton) {
        openFavorites();
        return;
      }

      const openCartButton = event.target.closest("[data-open-cart]");
      if (openCartButton) {
        openCart();
        return;
      }

      const closeCartButton = event.target.closest("[data-cart-close]");
      if (closeCartButton) {
        closeCart();
        return;
      }

      const buyButton = event.target.closest("[data-buy], [data-modal-buy]");
      if (buyButton) {
        addToCart(buyButton.dataset.buy || buyButton.dataset.slug);
        return;
      }

      const qtyButton = event.target.closest("[data-action]");
      if (qtyButton) {
        changeQty(qtyButton.dataset.slug, qtyButton.dataset.action === "inc" ? 1 : -1);
        return;
      }

      const cartRemoveButton = event.target.closest("[data-cart-remove]");
      if (cartRemoveButton) {
        removeFromCart(cartRemoveButton.dataset.cartRemove);
        return;
      }

      const categoryButton = event.target.closest("[data-category]");
      if (categoryButton) {
        openSearch({ category: categoryButton.dataset.category });
        return;
      }

      const authorButton = event.target.closest("[data-author]");
      if (authorButton) {
        openSearch({ author: authorButton.dataset.author });
        return;
      }

      const modalFavButton = event.target.closest("[data-modal-fav]");
      if (modalFavButton) {
        toggleFavorite(modalFavButton.dataset.slug);
        return;
      }

      const slugButton = event.target.closest("[data-slug]");
      if (slugButton) {
        openBook(slugButton.dataset.slug);
        return;
      }

      const removeButton = event.target.closest("[data-remove]");
      if (removeButton) {
        toggleFavorite(removeButton.dataset.remove);
        return;
      }

      const clearButton = event.target.closest("[data-clear]");
      if (clearButton) {
        searchFilters[clearButton.dataset.clear] = "";
        renderSearchFilters();
        runSearch();
        return;
      }
    });

    // Fechar modais
    $$("[data-modal-close]").forEach((el) => el.addEventListener("click", closeModal));
    $$("[data-search-close]").forEach((el) => el.addEventListener("click", closeSearch));
    $$("[data-favorites-close]").forEach((el) => el.addEventListener("click", closeFavorites));

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (!modal.hidden) closeModal();
      else if (!search.hidden) closeSearch();
      else if (!favorites.hidden) closeFavorites();
      else if (!cartPanel.hidden) closeCart();
    });

    // Busca com debounce
    searchInput.addEventListener("input", () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        searchFilters.q = searchInput.value.trim();
        runSearch();
      }, 200);
    });

    // Tamanho da fonte
    $("[data-toggle-font]").addEventListener("click", () => {
      setFontLarge(!document.documentElement.classList.contains("font-large"));
    });

    // Newsletter
    $("[data-newsletter-form]").addEventListener("submit", submitNewsletter);

    // Checkout
    checkoutForm.addEventListener("submit", submitCheckout);
  }

  // ---------- Inicialização ----------

  async function init() {
    setFontLarge(localStorage.getItem(FONT_KEY) === "1");
    updateFavBadge();
    updateCartBadge();
    setupMenu();
    setupEvents();

    try {
      const [{ books }, { categories }, { authors }] = await Promise.all([
        fetchJSON("/api/books"),
        fetchJSON("/api/categories"),
        fetchJSON("/api/authors")
      ]);
      allBooks = books;
      renderCatalog(books);
      renderRanking(books);
      renderCategories(categories);
      renderAuthors(authors);
    } catch (error) {
      console.error("Falha ao carregar dados:", error);
      $$(".placeholder-text").forEach((el) => {
        el.textContent = "Não foi possível carregar os dados. Verifique se o backend está no ar.";
      });
    }

    // Deep link: #livro/<slug>
    const match = location.hash.match(/^#livro\/(.+)$/);
    if (match) openBook(match[1]);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
