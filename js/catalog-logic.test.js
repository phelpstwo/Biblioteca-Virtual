import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BOOKS,
  CATEGORIES,
  filterBooks,
  formatBookCount,
  formatBRL,
  formatRating,
  toggleFavorite,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  getCartTotals,
} from './catalog-logic.js';

test('catalog contains all 8 books and expected categories', () => {
  assert.equal(BOOKS.length, 8);
  assert.deepEqual(CATEGORIES, ['Todos', 'Romance', 'Fantasia', 'Mistério', 'Clássicos']);
});

test('filterBooks filters accurately by category and Todos', () => {
  assert.equal(filterBooks(BOOKS, 'Todos').length, 8);
  const romance = filterBooks(BOOKS, 'Romance');
  assert.equal(romance.length, 2);
  assert.deepEqual(
    romance.map((b) => b.id),
    ['orgulho-e-preconceito', 'torto-arado']
  );
  assert.equal(filterBooks(BOOKS, 'Fantasia').length, 2);
  assert.equal(filterBooks(BOOKS, 'Mistério').length, 2);
  assert.equal(filterBooks(BOOKS, 'Clássicos').length, 2);
});

test('format helpers output Portuguese count, BRL price, and comma rating', () => {
  assert.equal(formatBookCount(8), '8 livros encontrados');
  assert.equal(formatBookCount(1), '1 livro encontrado');
  assert.equal(formatBookCount(0), '0 livros encontrados');
  assert.equal(formatBRL(48.9), 'R$ 48,90');
  assert.equal(formatBRL(42.5), 'R$ 42,50');
  assert.equal(formatRating(4.9), '4,9');
});

test('toggleFavorite adds and removes book IDs immutably', () => {
  const step1 = toggleFavorite([], 'o-jardim-secreto');
  assert.deepEqual(step1, ['o-jardim-secreto']);
  const step2 = toggleFavorite(step1, 'torto-arado');
  assert.deepEqual(step2, ['o-jardim-secreto', 'torto-arado']);
  const step3 = toggleFavorite(step2, 'o-jardim-secreto');
  assert.deepEqual(step3, ['torto-arado']);
});

test('cart operations add, update quantity, remove, and compute totals', () => {
  let cart = addToCart([], 'o-jardim-secreto', 1);
  cart = addToCart(cart, 'o-jardim-secreto', 2);
  cart = addToCart(cart, 'torto-arado', 1);
  assert.deepEqual(cart, [
    { id: 'o-jardim-secreto', quantity: 3 },
    { id: 'torto-arado', quantity: 1 },
  ]);

  const totals = getCartTotals(cart, BOOKS);
  assert.equal(totals.itemCount, 4);
  assert.ok(Math.abs(totals.subtotal - (48.9 * 3 + 52.9)) < 0.001);

  cart = updateCartQuantity(cart, 'o-jardim-secreto', -1);
  assert.equal(cart[0].quantity, 2);

  cart = updateCartQuantity(cart, 'torto-arado', -1);
  assert.equal(cart.length, 1);

  cart = removeFromCart(cart, 'o-jardim-secreto');
  assert.deepEqual(cart, []);
});
