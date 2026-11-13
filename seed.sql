-- Aurora Livros — dados iniciais
-- Aplicar com: psql -h 127.0.0.1 -p 5433 -U postgres -d biblioteca -f seed.sql

INSERT INTO categories (name, slug, color) VALUES
  ('Romance',  'romance',  '#b45309'),
  ('Fantasia', 'fantasia', '#6d28d9'),
  ('Mistério', 'misterio', '#0f766e'),
  ('Clássicos','classicos','#1f4d3a'),
  ('Ficção',   'ficcao',   '#be123c')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO books
  (slug, title, author, category_id, price, description, is_ranking, ranking_position)
VALUES
  (
    'o-jardim-secreto',
    'O Jardim Secreto',
    'Frances Hodgson Burnett',
    (SELECT id FROM categories WHERE slug = 'classicos'),
    45.90,
    'Mary Lennox descobre um jardim trancado na mansão do tio e, ao cuidar dele, transforma a si mesma e todos ao redor. Um clássico sobre amizade, natureza e recomeço.',
    FALSE, NULL
  ),
  (
    'a-biblioteca-da-meia-noite',
    'A Biblioteca da Meia-Noite',
    'Matt Haig',
    (SELECT id FROM categories WHERE slug = 'fantasia'),
    49.90,
    'Nora Seed está suspensa entre a vida e a morte em uma biblioteca infinita onde cada livro é uma vida que ela poderia ter vivido. Uma jornada sobre arrependimento e o que faz a vida valer a pena.',
    FALSE, NULL
  ),
  (
    'orgulho-e-preconceito',
    'Orgulho e Preconceito',
    'Jane Austen',
    (SELECT id FROM categories WHERE slug = 'romance'),
    39.90,
    'Elizabeth Bennet e Mr. Darcy precisam superar o orgulho e os preconceitos da sociedade inglesa do século XIX. Romance irônico e atemporal.',
    FALSE, NULL
  ),
  (
    'o-nome-da-rosa',
    'O Nome da Rosa',
    'Umberto Eco',
    (SELECT id FROM categories WHERE slug = 'misterio'),
    69.90,
    'Um monge franciscano investiga mortes misteriosas em uma abadia medieval onde um livro proibido guarda um segredo letal. Mistério histórico e filosófico.',
    FALSE, NULL
  ),
  (
    'torto-arado',
    'Torto Arado',
    'Itamar Vieira Junior',
    (SELECT id FROM categories WHERE slug = 'ficcao'),
    52.90,
    'Duas irmãs, uma terra e uma luta contra o latifúndio e a opressão no sertão baiano. Romance potente da literatura brasileira contemporânea.',
    TRUE, 1
  ),
  (
    'a-vida-invisivel-de-addie-larue',
    'A Vida Invisível de Addie LaRue',
    'V. E. Schwab',
    (SELECT id FROM categories WHERE slug = 'fantasia'),
    59.90,
    'Addie fez um pacto para viver para sempre, mas foi esquecida por todos — até que alguém se lembra dela trezentos anos depois.',
    TRUE, 2
  ),
  (
    'assassinato-no-expresso-do-oriente',
    'Assassinato no Expresso do Oriente',
    'Agatha Christie',
    (SELECT id FROM categories WHERE slug = 'misterio'),
    39.90,
    'Hercule Poirot investiga um assassinato em um trem preso pela neve, com todos os passageiros como suspeitos. O clássico policial de Agatha Christie.',
    TRUE, 3
  ),
  (
    'cem-anos-de-solidao',
    'Cem Anos de Solidão',
    'Gabriel García Márquez',
    (SELECT id FROM categories WHERE slug = 'classicos'),
    58.50,
    'A saga da família Buendía na mítica Macondo, entre o real e o mágico. Uma das obras-primas da literatura latino-americana.',
    TRUE, 4
  )
ON CONFLICT (slug) DO NOTHING;

-- Dados operacionais do acervo (ISBN, exemplares e localização)
UPDATE books SET isbn = '978-85-250-0456-8', copies = 3, location = 'Corredor A · Prateleira 1' WHERE slug = 'o-jardim-secreto';
UPDATE books SET isbn = '978-85-359-3434-2', copies = 2, location = 'Corredor B · Prateleira 2' WHERE slug = 'a-biblioteca-da-meia-noite';
UPDATE books SET isbn = '978-85-250-0249-7', copies = 3, location = 'Corredor A · Prateleira 2' WHERE slug = 'orgulho-e-preconceito';
UPDATE books SET isbn = '978-85-250-0250-3', copies = 2, location = 'Corredor C · Prateleira 1' WHERE slug = 'o-nome-da-rosa';
UPDATE books SET isbn = '978-85-359-4243-9', copies = 4, location = 'Corredor D · Prateleira 1' WHERE slug = 'torto-arado';
UPDATE books SET isbn = '978-85-359-4244-6', copies = 2, location = 'Corredor B · Prateleira 3' WHERE slug = 'a-vida-invisivel-de-addie-larue';
UPDATE books SET isbn = '978-85-250-0251-0', copies = 3, location = 'Corredor C · Prateleira 2' WHERE slug = 'assassinato-no-expresso-do-oriente';
UPDATE books SET isbn = '978-85-250-0252-7', copies = 2, location = 'Corredor A · Prateleira 3' WHERE slug = 'cem-anos-de-solidao';
