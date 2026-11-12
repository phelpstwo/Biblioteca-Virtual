# Aurora Livros — Biblioteca Virtual

Projeto da disciplina de **Programação Web**: uma biblioteca virtual com design
responsivo em HTML5 semântico, CSS3 puro e metodologia **BEM**.

## Como abrir

O projeto é 100% estático — não precisa de build nem de servidor:

```bash
# basta abrir o index.html no navegador
xdg-open index.html
```

Ou sirva com qualquer servidor estático:

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## Estrutura

```
.
├── index.html        # página inicial (única página do projeto)
├── style/
│   └── style.css     # folha de estilo (BEM, responsivo, acessível)
└── README.md
```

## Convenções

- **HTML5 semântico**: `header`, `nav`, `main`, `section`, `article`, `footer`.
- **BEM**: blocos como `.card`, `.category`, `.ranking__item`, `.nav__link`.
- **CSS3 puro**: variáveis customizadas, Flexbox, Grid e media queries.
- **Responsivo**: breakpoints em `1023px` e `639px`.
- **Acessível**: `aria-label` em botões de ícone, `:focus-visible`,
  `prefers-reduced-motion` e contraste adequado.

## Pendências conhecidas

- Imagens (logo, capas, ícones) ainda sem arquivos definidos.
- Navegação entre páginas ainda é âncora interna.
- Newsletter sem backend.
