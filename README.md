# Biblioteca-Virtual
# 📚 Aurora Livros — Biblioteca Virtual

Site de uma livraria/biblioteca virtual chamada **Aurora Livros**, com curadoria de clássicos e lançamentos contemporâneos. O projeto é um front-end estático, feito só com **HTML e CSS**, com foco em design editorial, responsividade e acessibilidade.

## Prints do site em diferentes tipos de tela:

<img width="515" height="325" alt="WhatsApp Image 2026-11-25 at 23 12 44 (2)" src="https://github.com/user-attachments/assets/8acbf10b-d0f5-46e3-8b27-e01e7528f908" />
<img width="372" height="436" alt="WhatsApp Image 2026-11-25 at 23 12 44 (1)" src="https://github.com/user-attachments/assets/fe3e52da-43f5-4626-be7c-a37685b16aea" />
<img width="382" height="425" alt="WhatsApp Image 2026-11-25 at 23 12 44" src="https://github.com/user-attachments/assets/e031e73c-aa63-4320-bb07-e1e2c05cbea4" />


## ✨ Funcionalidades

- **Página inicial** com destaque, seleção de livros, seção "Os livros que todos comentam" e citação em destaque
- **Catálogo** com 8 livros e filtro por categoria (Romance, Fantasia, Mistério e Clássicos) feito apenas com CSS, usando `radio` + `label`, sem JavaScript
- **Autores**: página dedicada aos escritores do acervo
- **Contato**: formulário com campos de rótulo flutuante (nome, e-mail, assunto e mensagem)
- **Rodapé** com navegação e campo de assinatura de newsletter
- **Layout responsivo** com breakpoints para tablet e celular
- **Acessibilidade**: `aria-label`, `aria-current` e `aria-live` na contagem de resultados do catálogo, além de tipografia de alta legibilidade

## 🛠️ Tecnologias

- HTML5
- CSS3 (Grid, Flexbox, `clamp()`, `@font-face` e media queries)
- Fontes locais: **Libre Caslon Text**, **Manrope**, **Special Elite** e **Atkinson Hyperlegible Mono**

## 📁 Estrutura do projeto

```
Biblioteca-Virtual/
├── inicio.html        # Página inicial
├── catalogo.html      # Catálogo com filtro por categoria
├── autores.html       # Página de autores
├── contato.html       # Formulário de contato
├── style.css          # Estilos gerais
└── style/
    ├── inicio.css
    ├── catalogo.css
    ├── autores.css
    ├── contato.css
    ├── footer.css
    ├── fonts/         # Fontes utilizadas
    └── icons/         # Ícones e logo em SVG
```

## 🚀 Como executar

Não há dependências nem etapa de build. Basta clonar o repositório e abrir o site no navegador.

```bash
# 1. Clone o repositório
git clone https://github.com/phelpstwo/Biblioteca-Virtual.git

# 2. Entre na pasta
cd Biblioteca-Virtual
```

Depois, escolha uma das opções:

- **Direto no navegador:** abra o arquivo `inicio.html` com um duplo clique.
- **Com a extensão Live Server (VS Code):** clique com o botão direito em `inicio.html` e escolha *Open with Live Server*.
- **Com Python:**
  ```bash
  python -m http.server 8000
  ```
  e acesse `http://localhost:8000/inicio.html`.

## ⚠️ Observações

Este projeto é um protótipo de interface. Não há JavaScript nem back-end, então:

- Os botões de **carrinho** e **favoritos** são apenas visuais.
- Os formulários de **contato** e **newsletter** não enviam dados para nenhum servidor.

## Nome dos integrantes:
   Héber Ebenézer,
   Kyvia Wenne,
   João Gabriel,
   Pedro Arthur e
   Philipe Gabriel
