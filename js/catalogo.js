(() => {
  const CATEGORIES = ['Todos', 'Romance', 'Fantasia', 'Mistério', 'Clássicos'];

  const BOOKS = [
    {
      id: 'o-jardim-secreto',
      title: 'O Jardim Secreto',
      coverTitle: 'O JARDIM\nSECRETO',
      author: 'Frances Hodgson Burnett',
      coverAuthor: 'FRANCES HODGSON BURNETT',
      category: 'Clássicos',
      rating: 4.9,
      reviewCount: 328,
      price: 48.9,
      coverColor: '#526651',
      synopsis: 'Uma história sobre amizade, renovação e o poder transformador da natureza.',
      quote: 'Uma leitura envolvente, sensível e impossível de esquecer.',
      publisher: 'Aurora',
      pages: 304,
      language: 'Português',
      format: 'Capa comum',
    },
    {
      id: 'a-biblioteca-da-meia-noite',
      title: 'A Biblioteca da Meia-Noite',
      coverTitle: 'A BIBLIOTECA\nDA MEIA-NOITE',
      author: 'Matt Haig',
      coverAuthor: 'MATT HAIG',
      category: 'Fantasia',
      rating: 4.8,
      reviewCount: 912,
      price: 54.9,
      coverColor: '#273a4b',
      synopsis: 'Entre a vida e a morte existe uma biblioteca infinita, onde cada livro guarda uma versão diferente do que poderia ter sido.',
      quote: 'Um convite delicado para fazer as pazes com o tempo e com as próprias escolhas.',
      publisher: 'Aurora',
      pages: 308,
      language: 'Português',
      format: 'Capa comum',
    },
    {
      id: 'orgulho-e-preconceito',
      title: 'Orgulho e Preconceito',
      coverTitle: 'ORGULHO &\nPRECONCEITO',
      author: 'Jane Austen',
      coverAuthor: 'JANE AUSTEN',
      category: 'Romance',
      rating: 4.9,
      reviewCount: 1204,
      price: 42.5,
      coverColor: '#945f57',
      synopsis: 'Um retrato brilhante e espirituoso sobre convenções sociais, primeiras impressões e o amadurecimento do afeto.',
      quote: 'Inteligente, irônico e sempre atual em cada diálogo.',
      publisher: 'Aurora',
      pages: 416,
      language: 'Português',
      format: 'Capa comum',
    },
    {
      id: 'o-nome-da-rosa',
      title: 'O Nome da Rosa',
      coverTitle: 'O NOME DA\nROSA',
      author: 'Umberto Eco',
      coverAuthor: 'UMBERTO ECO',
      category: 'Mistério',
      rating: 4.7,
      reviewCount: 486,
      price: 63.9,
      coverColor: '#8b5e27',
      synopsis: 'Em uma abadia medieval isolada, uma sequência de crimes inexplicáveis leva um frade erudito a desvendar segredos proibidos.',
      quote: 'Um labirinto literário fascinante onde cada pista revela um novo universo.',
      publisher: 'Aurora',
      pages: 560,
      language: 'Português',
      format: 'Capa comum',
    },
    {
      id: 'torto-arado',
      title: 'Torto Arado',
      coverTitle: 'TORTO ARADO',
      author: 'Itamar Vieira Junior',
      coverAuthor: 'ITAMAR VIEIRA JUNIOR',
      category: 'Romance',
      rating: 4.8,
      reviewCount: 765,
      price: 52.9,
      coverColor: '#73513b',
      synopsis: 'Nas profundezas do sertão baiano, duas irmãs têm seus destinos selados por um segredo antigo e pela força da terra.',
      quote: 'Uma prosa poética e contundente que ecoa muito depois da última página.',
      publisher: 'Aurora',
      pages: 264,
      language: 'Português',
      format: 'Capa comum',
    },
    {
      id: 'a-vida-invisivel-de-addie-larue',
      title: 'A Vida Invisível de Addie LaRue',
      coverTitle: 'ADDIE LARUE',
      author: 'V. E. Schwab',
      coverAuthor: 'V. E. SCHWAB',
      category: 'Fantasia',
      rating: 4.7,
      reviewCount: 643,
      price: 59.9,
      coverColor: '#50425d',
      synopsis: 'Amaldiçoada a viver para sempre e ser esquecida por todos que encontra, Addie atravessa séculos até que alguém se lembra de seu nome.',
      quote: 'Melancólico, mágico e repleto de reflexões sobre memória e arte.',
      publisher: 'Aurora',
      pages: 504,
      language: 'Português',
      format: 'Capa comum',
    },
    {
      id: 'assassinato-no-expresso-do-oriente',
      title: 'Assassinato no Expresso do Oriente',
      coverTitle: 'EXPRESSO DO\nORIENTE',
      author: 'Agatha Christie',
      coverAuthor: 'AGATHA CHRISTIE',
      category: 'Mistério',
      rating: 4.9,
      reviewCount: 881,
      price: 39.9,
      coverColor: '#853e32',
      synopsis: 'Preso em uma nevasca nos Bálcãs, o luxuoso trem torna-se palco de um crime perfeito que só Hercule Poirot pode solucionar.',
      quote: 'Suspense clássico e construção impecável do início ao desfecho.',
      publisher: 'Aurora',
      pages: 240,
      language: 'Português',
      format: 'Capa comum',
    },
    {
      id: 'cem-anos-de-solidao',
      title: 'Cem Anos de Solidão',
      coverTitle: 'CEM ANOS DE\nSOLIDÃO',
      author: 'Gabriel García Márquez',
      coverAuthor: 'GABRIEL GARCÍA MÁRQUEZ',
      category: 'Clássicos',
      rating: 4.9,
      reviewCount: 997,
      price: 58.5,
      coverColor: '#365e68',
      synopsis: 'A saga mágica e inesquecível de sete gerações da família Buendía na mítica cidade de Macondo.',
      quote: 'Um monumento da literatura universal onde o extraordinário parece cotidiano.',
      publisher: 'Aurora',
      pages: 448,
      language: 'Português',
      format: 'Capa comum',
    },
  ];

  function filterBooks(books, category) {
    if (!category || category === 'Todos') {
      return books.slice();
    }
    const normalized = category.trim().toLowerCase();
    return books.filter((book) => book.category.toLowerCase() === normalized);
  }

  function formatBookCount(count) {
    return count === 1 ? '1 livro encontrado' : `${count} livros encontrados`;
  }

  function formatBRL(value) {
    return `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
  }

  function formatRating(rating) {
    return Number(rating).toFixed(1).replace('.', ',');
  }

  function toggleFavorite(favorites, bookId) {
    if (favorites.includes(bookId)) {
      return favorites.filter((id) => id !== bookId);
    }
    return [...favorites, bookId];
  }

  function addToCart(cart, bookId, quantity = 1) {
    const safeQty = Math.max(1, Math.floor(Number(quantity) || 1));
    const existing = cart.find((item) => item.id === bookId);
    if (existing) {
      return cart.map((item) =>
        item.id === bookId ? { ...item, quantity: item.quantity + safeQty } : item
      );
    }
    return [...cart, { id: bookId, quantity: safeQty }];
  }

  function updateCartQuantity(cart, bookId, delta) {
    return cart
      .map((item) =>
        item.id === bookId ? { ...item, quantity: item.quantity + delta } : item
      )
      .filter((item) => item.quantity > 0);
  }

  function removeFromCart(cart, bookId) {
    return cart.filter((item) => item.id !== bookId);
  }

  function getCartTotals(cart, books) {
    const bookMap = new Map(books.map((b) => [b.id, b]));
    return cart.reduce(
      (acc, item) => {
        const book = bookMap.get(item.id);
        if (!book) return acc;
        acc.itemCount += item.quantity;
        acc.subtotal += book.price * item.quantity;
        return acc;
      },
      { itemCount: 0, subtotal: 0 }
    );
  }

const STORAGE_KEYS = {
  cart: 'aurora_catalog_cart',
  favorites: 'aurora_catalog_favorites',
  a11y: 'aurora_catalog_a11y',
};

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota / private mode failures
  }
}

const state = {
  activeCategory: 'Todos',
  selectedBookId: null,
  detailQty: 1,
  cart: loadJSON(STORAGE_KEYS.cart, []),
  favorites: loadJSON(STORAGE_KEYS.favorites, []),
  a11y: loadJSON(STORAGE_KEYS.a11y, {
    largeText: false,
    highContrast: false,
    reduceMotion: false,
  }),
  justAddedId: null,
  checkoutMessage: '',
};

const els = {
  catalogView: document.getElementById('catalog-view'),
  detailView: document.getElementById('book-detail-view'),
  filterBar: document.getElementById('filter-bar'),
  countText: document.getElementById('catalog-count'),
  booksGrid: document.getElementById('books-grid'),
  favBadge: document.getElementById('fav-badge'),
  bagBadge: document.getElementById('bag-badge'),
  favOpenBtn: document.getElementById('open-fav-btn'),
  bagOpenBtn: document.getElementById('open-bag-btn'),
  a11yBtn: document.getElementById('a11y-btn'),
  a11yPopover: document.getElementById('a11y-popover'),
  a11yLargeText: document.getElementById('a11y-large-text'),
  a11yHighContrast: document.getElementById('a11y-high-contrast'),
  a11yReduceMotion: document.getElementById('a11y-reduce-motion'),
  backdrop: document.getElementById('drawer-backdrop'),
  bagDrawer: document.getElementById('bag-drawer'),
  bagBody: document.getElementById('bag-drawer-body'),
  bagFooter: document.getElementById('bag-drawer-footer'),
  bagSubtotal: document.getElementById('bag-subtotal'),
  bagCheckoutBtn: document.getElementById('bag-checkout-btn'),
  favDrawer: document.getElementById('fav-drawer'),
  favBody: document.getElementById('fav-drawer-body'),
  newsletterForm: document.getElementById('newsletter-form'),
  newsletterEmail: document.getElementById('newsletter-email'),
  newsletterFeedback: document.getElementById('newsletter-feedback'),
};

function createHeartSVG() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" stroke="#1e1b12" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </svg>`;
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderBookMockup(book) {
  return `
    <div class="book-mockup" style="--cover-color: ${escapeHTML(book.coverColor)}">
      <span class="book-mockup__star" aria-hidden="true">✦</span>
      <span class="book-mockup__title">${escapeHTML(book.coverTitle)}</span>
      <span class="book-mockup__rule" aria-hidden="true"></span>
      <span class="book-mockup__author">${escapeHTML(book.coverAuthor)}</span>
    </div>
  `;
}

function applyA11y() {
  document.body.classList.toggle('a11y-large-text', Boolean(state.a11y.largeText));
  document.body.classList.toggle('a11y-high-contrast', Boolean(state.a11y.highContrast));
  document.body.classList.toggle('a11y-reduce-motion', Boolean(state.a11y.reduceMotion));
  els.a11yLargeText.checked = Boolean(state.a11y.largeText);
  els.a11yHighContrast.checked = Boolean(state.a11y.highContrast);
  els.a11yReduceMotion.checked = Boolean(state.a11y.reduceMotion);
}

function updateBadges() {
  const { itemCount } = getCartTotals(state.cart, BOOKS);
  els.bagBadge.textContent = String(itemCount);
  els.favBadge.textContent = String(state.favorites.length);
}

function renderFilters() {
  els.filterBar.innerHTML = CATEGORIES.map((category) => {
    const active = state.activeCategory === category;
    return `<button
      type="button"
      class="filter-btn${active ? ' is-active' : ''}"
      data-category="${escapeHTML(category)}"
      aria-pressed="${active ? 'true' : 'false'}"
    >${escapeHTML(category)}</button>`;
  }).join('');
}

function renderCatalogGrid() {
  const visibleBooks = filterBooks(BOOKS, state.activeCategory);
  els.countText.textContent = formatBookCount(visibleBooks.length);

  els.booksGrid.innerHTML = visibleBooks
    .map((book) => {
      const isFav = state.favorites.includes(book.id);
      const isAdded = state.justAddedId === book.id;
      return `
        <article class="book-card" data-book-id="${escapeHTML(book.id)}">
          <div class="book-card__stage">
            <button
              type="button"
              class="book-card__fav${isFav ? ' is-favorited' : ''}"
              data-action="toggle-fav"
              data-book-id="${escapeHTML(book.id)}"
              aria-label="${isFav ? `Remover ${escapeHTML(book.title)} dos favoritos` : `Favoritar ${escapeHTML(book.title)}`}"
              aria-pressed="${isFav ? 'true' : 'false'}"
            >
              ${createHeartSVG()}
            </button>
            <button
              type="button"
              class="book-card__cover-trigger"
              data-action="open-detail"
              data-book-id="${escapeHTML(book.id)}"
              aria-label="Ver detalhes de ${escapeHTML(book.title)}"
            >
              ${renderBookMockup(book)}
            </button>
          </div>
          <div class="book-card__body">
            <p class="book-card__category">${escapeHTML(book.category)}</p>
            <button
              type="button"
              class="book-card__title"
              data-action="open-detail"
              data-book-id="${escapeHTML(book.id)}"
            >${escapeHTML(book.title)}</button>
            <p class="book-card__author">por ${escapeHTML(book.author)}</p>
            <div class="book-card__rating" aria-label="Avaliação ${formatRating(book.rating)} de 5 com ${book.reviewCount} avaliações">
              <span class="rating-stars" aria-hidden="true">★★★★★</span>
              <span class="rating-score">${formatRating(book.rating)}</span>
              <span class="rating-count">(${book.reviewCount})</span>
            </div>
            <div class="book-card__footer">
              <span class="book-card__price">${formatBRL(book.price)}</span>
              <button
                type="button"
                class="book-card__add-btn${isAdded ? ' is-added' : ''}"
                data-action="add-card-cart"
                data-book-id="${escapeHTML(book.id)}"
              >${isAdded ? 'Adicionado ✓' : 'Adicionar ao carrinho'}</button>
            </div>
          </div>
        </article>
      `;
    })
    .join('');
}

function renderBookDetail() {
  const book = BOOKS.find((b) => b.id === state.selectedBookId);
  if (!book) {
    els.catalogView.hidden = false;
    els.detailView.hidden = true;
    return;
  }

  const isFav = state.favorites.includes(book.id);
  els.catalogView.hidden = true;
  els.detailView.hidden = false;
  els.detailView.innerHTML = `
    <button type="button" class="book-detail__back" id="detail-back-btn">
      ← Voltar ao catálogo
    </button>
    <div class="book-detail__grid">
      <div class="book-detail__stage">
        ${renderBookMockup(book)}
      </div>
      <div>
        <p class="book-detail__category">${escapeHTML(book.category)}</p>
        <h1 class="book-detail__title">${escapeHTML(book.title)}</h1>
        <p class="book-detail__author">por <span>${escapeHTML(book.author)}</span></p>
        <div class="book-detail__rating">
          <span class="rating-stars" aria-hidden="true">★★★★★</span>
          <span class="rating-score">${formatRating(book.rating)}</span>
          <span class="rating-count">${book.reviewCount} avaliações</span>
        </div>
        <hr class="book-detail__divider">
        <p class="book-detail__synopsis">${escapeHTML(book.synopsis)}</p>
        <blockquote class="book-detail__quote">“${escapeHTML(book.quote)}”</blockquote>
        <p class="book-detail__price">${formatBRL(book.price)}</p>
        <div class="book-detail__actions">
          <div class="qty-stepper" aria-label="Quantidade">
            <button type="button" class="qty-stepper__btn" id="detail-qty-dec" aria-label="Diminuir quantidade">−</button>
            <span class="qty-stepper__val" id="detail-qty-val">${state.detailQty}</span>
            <button type="button" class="qty-stepper__btn" id="detail-qty-inc" aria-label="Aumentar quantidade">+</button>
          </div>
          <button type="button" class="detail-add-btn" id="detail-add-bag">
            Adicionar à sacola
          </button>
          <button
            type="button"
            class="detail-fav-btn${isFav ? ' is-favorited' : ''}"
            id="detail-fav-toggle"
            aria-label="${isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}"
            aria-pressed="${isFav ? 'true' : 'false'}"
          >
            ${createHeartSVG()}
          </button>
        </div>
        <hr class="book-detail__divider">
        <div class="book-detail__meta">
          <div>
            <p class="meta-item__label">Editora</p>
            <p class="meta-item__value">${escapeHTML(book.publisher)}</p>
          </div>
          <div>
            <p class="meta-item__label">Páginas</p>
            <p class="meta-item__value">${book.pages}</p>
          </div>
          <div>
            <p class="meta-item__label">Idioma</p>
            <p class="meta-item__value">${escapeHTML(book.language)}</p>
          </div>
          <div>
            <p class="meta-item__label">Formato</p>
            <p class="meta-item__value">${escapeHTML(book.format)}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderBagDrawer() {
  const bookMap = new Map(BOOKS.map((b) => [b.id, b]));
  const items = state.cart
    .map((entry) => ({ book: bookMap.get(entry.id), quantity: entry.quantity }))
    .filter((entry) => Boolean(entry.book));

  if (items.length === 0) {
    els.bagBody.innerHTML = state.checkoutMessage
      ? `<p class="drawer-status-msg" role="status">${escapeHTML(state.checkoutMessage)}</p>
         <p class="drawer-empty">Sua sacola está vazia. Explore o catálogo para adicionar novas leituras.</p>`
      : `<p class="drawer-empty">Sua sacola está vazia. Escolha um livro no catálogo para começar.</p>`;
    els.bagFooter.hidden = true;
    return;
  }

  els.bagBody.innerHTML = items
    .map(({ book, quantity }) => `
      <div class="drawer-item" data-book-id="${escapeHTML(book.id)}">
        <div class="drawer-item__cover" style="--cover-color: ${escapeHTML(book.coverColor)}">
          ${escapeHTML(book.coverTitle)}
        </div>
        <div class="drawer-item__info">
          <p class="drawer-item__title">${escapeHTML(book.title)}</p>
          <p class="drawer-item__author">${escapeHTML(book.author)} · ${formatBRL(book.price)}</p>
          <div class="drawer-item__controls">
            <div class="drawer-qty">
              <button type="button" data-bag-dec="${escapeHTML(book.id)}" aria-label="Diminuir quantidade de ${escapeHTML(book.title)}">−</button>
              <span>${quantity}</span>
              <button type="button" data-bag-inc="${escapeHTML(book.id)}" aria-label="Aumentar quantidade de ${escapeHTML(book.title)}">+</button>
            </div>
            <button type="button" class="drawer-item__remove" data-bag-remove="${escapeHTML(book.id)}">Remover</button>
          </div>
        </div>
      </div>
    `)
    .join('');

  const { subtotal } = getCartTotals(state.cart, BOOKS);
  els.bagSubtotal.textContent = formatBRL(subtotal);
  els.bagFooter.hidden = false;
}

function renderFavDrawer() {
  const bookMap = new Map(BOOKS.map((b) => [b.id, b]));
  const favBooks = state.favorites.map((id) => bookMap.get(id)).filter(Boolean);

  if (favBooks.length === 0) {
    els.favBody.innerHTML = `<p class="drawer-empty">Nenhum livro favoritado ainda. Clique no coração de qualquer livro para salvá-lo aqui.</p>`;
    return;
  }

  els.favBody.innerHTML = favBooks
    .map((book) => `
      <div class="drawer-item" data-book-id="${escapeHTML(book.id)}">
        <div class="drawer-item__cover" style="--cover-color: ${escapeHTML(book.coverColor)}">
          ${escapeHTML(book.coverTitle)}
        </div>
        <div class="drawer-item__info">
          <p class="drawer-item__title">${escapeHTML(book.title)}</p>
          <p class="drawer-item__author">${escapeHTML(book.author)} · ${formatBRL(book.price)}</p>
          <div class="drawer-item__controls">
            <button type="button" class="book-card__add-btn" data-fav-add-bag="${escapeHTML(book.id)}">Adicionar à sacola</button>
            <button type="button" class="drawer-item__remove" data-fav-remove="${escapeHTML(book.id)}">Remover</button>
          </div>
        </div>
      </div>
    `)
    .join('');
}

function openDrawer(drawerEl) {
  closeDrawers();
  els.backdrop.hidden = false;
  drawerEl.hidden = false;
}

function closeDrawers() {
  els.backdrop.hidden = true;
  els.bagDrawer.hidden = true;
  els.favDrawer.hidden = true;
}

function toggleA11yPopover(forceState) {
  const open = typeof forceState === 'boolean' ? forceState : els.a11yPopover.hidden;
  els.a11yPopover.hidden = !open;
  els.a11yBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
}

function renderAll() {
  applyA11y();
  updateBadges();
  renderFilters();
  renderCatalogGrid();
  renderBookDetail();
  renderBagDrawer();
  renderFavDrawer();
}

function syncFromURL() {
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('categoria');
  const livro = params.get('livro');
  if (cat && CATEGORIES.some((c) => c.toLowerCase() === cat.toLowerCase())) {
    state.activeCategory = CATEGORIES.find((c) => c.toLowerCase() === cat.toLowerCase());
  }
  if (livro && BOOKS.some((b) => b.id === livro)) {
    state.selectedBookId = livro;
    state.detailQty = 1;
  }
}

function updateURL() {
  const params = new URLSearchParams();
  if (state.activeCategory !== 'Todos') {
    params.set('categoria', state.activeCategory);
  }
  if (state.selectedBookId) {
    params.set('livro', state.selectedBookId);
  }
  const query = params.toString();
  const nextURL = query ? `${window.location.pathname}?${query}` : window.location.pathname;
  try {
    window.history.replaceState({}, '', nextURL);
  } catch {
    // Ignore history API restrictions on file:// URLs
  }
}

function handleAddToBag(bookId, qty = 1, showAddedFeedback = false) {
  state.checkoutMessage = '';
  state.cart = addToCart(state.cart, bookId, qty);
  saveJSON(STORAGE_KEYS.cart, state.cart);
  if (showAddedFeedback) {
    state.justAddedId = bookId;
    setTimeout(() => {
      if (state.justAddedId === bookId) {
        state.justAddedId = null;
        renderCatalogGrid();
      }
    }, 1200);
  }
  renderAll();
}

function handleToggleFav(bookId) {
  state.favorites = toggleFavorite(state.favorites, bookId);
  saveJSON(STORAGE_KEYS.favorites, state.favorites);
  renderAll();
}

// Event Listeners
els.filterBar.addEventListener('click', (event) => {
  const btn = event.target.closest('[data-category]');
  if (!btn) return;
  state.activeCategory = btn.dataset.category;
  state.selectedBookId = null;
  updateURL();
  renderAll();
});

els.booksGrid.addEventListener('click', (event) => {
  const favBtn = event.target.closest('[data-action="toggle-fav"]');
  if (favBtn) {
    handleToggleFav(favBtn.dataset.bookId);
    return;
  }

  const addBtn = event.target.closest('[data-action="add-card-cart"]');
  if (addBtn) {
    handleAddToBag(addBtn.dataset.bookId, 1, true);
    return;
  }

  const detailTrigger = event.target.closest('[data-action="open-detail"]');
  if (detailTrigger) {
    state.selectedBookId = detailTrigger.dataset.bookId;
    state.detailQty = 1;
    updateURL();
    renderAll();
    window.scrollTo({ top: 0, behavior: state.a11y.reduceMotion ? 'auto' : 'smooth' });
  }
});

els.detailView.addEventListener('click', (event) => {
  if (event.target.closest('#detail-back-btn')) {
    state.selectedBookId = null;
    updateURL();
    renderAll();
    return;
  }
  if (event.target.closest('#detail-qty-dec')) {
    state.detailQty = Math.max(1, state.detailQty - 1);
    renderBookDetail();
    return;
  }
  if (event.target.closest('#detail-qty-inc')) {
    state.detailQty += 1;
    renderBookDetail();
    return;
  }
  if (event.target.closest('#detail-add-bag') && state.selectedBookId) {
    handleAddToBag(state.selectedBookId, state.detailQty, false);
    const addBtn = document.getElementById('detail-add-bag');
    if (addBtn) addBtn.textContent = 'Adicionado à sacola ✓';
    return;
  }
  if (event.target.closest('#detail-fav-toggle') && state.selectedBookId) {
    handleToggleFav(state.selectedBookId);
  }
});

els.bagOpenBtn.addEventListener('click', () => {
  toggleA11yPopover(false);
  openDrawer(els.bagDrawer);
});

els.favOpenBtn.addEventListener('click', () => {
  toggleA11yPopover(false);
  openDrawer(els.favDrawer);
});

els.backdrop.addEventListener('click', closeDrawers);
document.querySelectorAll('[data-close-drawer]').forEach((btn) => {
  btn.addEventListener('click', closeDrawers);
});

els.bagBody.addEventListener('click', (event) => {
  const dec = event.target.closest('[data-bag-dec]');
  if (dec) {
    state.cart = updateCartQuantity(state.cart, dec.dataset.bagDec, -1);
    saveJSON(STORAGE_KEYS.cart, state.cart);
    renderAll();
    return;
  }
  const inc = event.target.closest('[data-bag-inc]');
  if (inc) {
    state.cart = updateCartQuantity(state.cart, inc.dataset.bagInc, 1);
    saveJSON(STORAGE_KEYS.cart, state.cart);
    renderAll();
    return;
  }
  const rem = event.target.closest('[data-bag-remove]');
  if (rem) {
    state.cart = removeFromCart(state.cart, rem.dataset.bagRemove);
    saveJSON(STORAGE_KEYS.cart, state.cart);
    renderAll();
  }
});

els.bagCheckoutBtn.addEventListener('click', () => {
  const { itemCount, subtotal } = getCartTotals(state.cart, BOOKS);
  if (itemCount === 0) return;
  state.cart = [];
  saveJSON(STORAGE_KEYS.cart, state.cart);
  state.checkoutMessage = `Pedido confirmado! (${itemCount} ${itemCount === 1 ? 'livro' : 'livros'}, ${formatBRL(subtotal)}) — obrigado por escolher a Aurora Livros.`;
  renderAll();
});

els.favBody.addEventListener('click', (event) => {
  const add = event.target.closest('[data-fav-add-bag]');
  if (add) {
    handleAddToBag(add.dataset.favAddBag, 1, false);
    openDrawer(els.bagDrawer);
    return;
  }
  const rem = event.target.closest('[data-fav-remove]');
  if (rem) {
    handleToggleFav(rem.dataset.favRemove);
  }
});

els.a11yBtn.addEventListener('click', (event) => {
  event.stopPropagation();
  toggleA11yPopover();
});

document.addEventListener('click', (event) => {
  if (!els.a11yPopover.hidden && !event.target.closest('#a11y-popover') && !event.target.closest('#a11y-btn')) {
    toggleA11yPopover(false);
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    toggleA11yPopover(false);
    closeDrawers();
  }
});

[
  [els.a11yLargeText, 'largeText'],
  [els.a11yHighContrast, 'highContrast'],
  [els.a11yReduceMotion, 'reduceMotion'],
].forEach(([checkbox, prop]) => {
  checkbox.addEventListener('change', () => {
    state.a11y[prop] = checkbox.checked;
    saveJSON(STORAGE_KEYS.a11y, state.a11y);
    applyA11y();
  });
});

els.newsletterForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = els.newsletterEmail.value.trim();
  if (!email || !els.newsletterEmail.checkValidity()) {
    els.newsletterFeedback.textContent = 'Por favor, informe um e-mail válido.';
    return;
  }
  els.newsletterFeedback.textContent = `Inscrição confirmada para ${email}.`;
  els.newsletterEmail.value = '';
});

syncFromURL();
renderAll();
})();
