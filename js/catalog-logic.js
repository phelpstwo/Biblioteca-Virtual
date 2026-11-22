export const CATEGORIES = ['Todos', 'Romance', 'Fantasia', 'Mistério', 'Clássicos'];

export const BOOKS = [
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

export function filterBooks(books, category) {
  if (!category || category === 'Todos') {
    return books.slice();
  }
  const normalized = category.trim().toLowerCase();
  return books.filter((book) => book.category.toLowerCase() === normalized);
}

export function formatBookCount(count) {
  return count === 1 ? '1 livro encontrado' : `${count} livros encontrados`;
}

export function formatBRL(value) {
  return `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
}

export function formatRating(rating) {
  return Number(rating).toFixed(1).replace('.', ',');
}

export function toggleFavorite(favorites, bookId) {
  if (favorites.includes(bookId)) {
    return favorites.filter((id) => id !== bookId);
  }
  return [...favorites, bookId];
}

export function addToCart(cart, bookId, quantity = 1) {
  const safeQty = Math.max(1, Math.floor(Number(quantity) || 1));
  const existing = cart.find((item) => item.id === bookId);
  if (existing) {
    return cart.map((item) =>
      item.id === bookId ? { ...item, quantity: item.quantity + safeQty } : item
    );
  }
  return [...cart, { id: bookId, quantity: safeQty }];
}

export function updateCartQuantity(cart, bookId, delta) {
  return cart
    .map((item) =>
      item.id === bookId ? { ...item, quantity: item.quantity + delta } : item
    )
    .filter((item) => item.quantity > 0);
}

export function removeFromCart(cart, bookId) {
  return cart.filter((item) => item.id !== bookId);
}

export function getCartTotals(cart, books) {
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
