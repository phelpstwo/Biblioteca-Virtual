# Aurora Livros — Biblioteca Virtual

Projeto da disciplina de **Programação Web**: uma biblioteca virtual com design
responsivo em HTML5 semântico, CSS3 puro e metodologia **BEM**, agora com
back-end em **Python (Flask)** e banco **PostgreSQL**.

> Fork de [phelpstwo/Biblioteca-Virtual](https://github.com/phelpstwo/Biblioteca-Virtual).
> As melhorias deste fork estão no PR [#1](https://github.com/phelpstwo/Biblioteca-Virtual/pull/1).

## Stack

| Camada | Tecnologia |
|---|---|
| Front-end | HTML5 semântico, CSS3 (BEM, Grid, Flexbox, variáveis), JavaScript vanilla |
| Back-end | Python 3 + Flask |
| Banco | PostgreSQL 18 (sem ORM, `psycopg` 3) |
| Capas | SVG gerado pelo back-end (`/covers/<slug>.svg`) |

## Como rodar

### 1. Pré-requisitos

- Python 3.11+
- PostgreSQL 18 (ou qualquer versão com `initdb`/`pg_ctl`)

### 2. Ambiente Python

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

### 3. Banco de dados

O script sobe um cluster PostgreSQL local na porta **5433** (sem precisar de
`sudo`), cria o banco `biblioteca` e aplica schema + dados de exemplo:

```bash
bash scripts/init_db.sh
```

Ou, manualmente:

```bash
PGBIN=/usr/lib/postgresql/18/bin
$PGBIN/initdb -D .pgdata -U postgres --auth=trust --encoding=UTF8 --locale=C.UTF-8
$PGBIN/pg_ctl -D .pgdata -o "-p 5433 -k /tmp -h 127.0.0.1" -l /tmp/biblioteca-pg.log start
$PGBIN/createdb -h 127.0.0.1 -p 5433 -U postgres biblioteca
$PGBIN/psql -h 127.0.0.1 -p 5433 -U postgres -d biblioteca -f schema.sql -f seed.sql
```

Configure o arquivo `.env` (copie de `.env.example`).

### 4. Subir o servidor

```bash
.venv/bin/python app.py
# http://127.0.0.1:5000
```

## API

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/health` | Status do serviço e do banco |
| GET | `/api/books` | Lista livros (`?q=`, `?category=`, `?author=`, `?ranking=1`) |
| GET | `/api/books/<slug>` | Detalhe de um livro |
| GET | `/api/categories` | Categorias |
| GET | `/api/authors` | Autores e quantidade de livros |
| POST | `/api/newsletter` | Cadastra e-mail (`{ "email": "..." }`) |
| POST | `/api/orders` | Cria pedido (`{ name, email, payment_method, items[] }`) |
| GET | `/api/orders/<id>` | Detalhe de um pedido |
| GET | `/covers/<slug>.svg` | Capa do livro em SVG |

## Painéis (administração e leitor)

As duas áreas são **separadas**: têm login, sessão e permissões próprios.
Quem está no painel do administrador não acessa a área do leitor (e vice-versa).

| Área | URL | Quem acessa |
|---|---|---|
| Administração | `/admin` | Bibliotecário/equipe |
| Área do leitor | `/conta` | Leitores cadastrados e aprovados |

**Primeiro acesso do administrador:** ao abrir `/admin` pela primeira vez, o
sistema pede nome, e-mail e senha — é nesse momento que a senha do admin é
definida (por exemplo, `biblioteca123`). Depois disso, o login é normal e a
senha pode ser trocada em **Segurança**.

**Cadastro de leitor:** o leitor se cadastra em `/conta/cadastro` e fica com
status *pendente*. O administrador aprova em **Usuários**. Só depois da
aprovação o login do leitor funciona.

### Painel do administrador

- **Dashboard:** livros, exemplares, disponíveis, empréstimos ativos, atrasos,
  leitores, cadastros pendentes e reservas na fila, além dos mais emprestados.
- **Acervo:** cadastrar, editar, inativar/reativar e excluir livros (capa SVG,
  ISBN, autor, categoria, cópias e localização).
- **Empréstimos:** registrar saída, devolver e renovar; a devolução calcula a
  multa por atraso e libera a próxima reserva da fila.
- **Usuários:** aprovar, suspender, reativar e redefinir senha de leitores.
- **Atrasos e multas:** lista de atrasados, aplicação e quitação de multas.
- **Segurança:** troca da senha do administrador.

### Área do leitor

- **Catálogo:** disponibilidade por exemplar (`2 cópias disponíveis`,
  `Indisponível`) e botão **Reservar** para livros indisponíveis.
- **Meus empréstimos:** livros emprestados, data limite e status (no prazo ou
  atrasado), com **Renovar**.
- **Reservas:** fila de espera e cancelamento.
- **Histórico:** tudo o que já foi devolvido.
- **Perfil:** dados pessoais, troca de senha e preferência de notificação
  (aviso 1 dia antes do vencimento).

## Funcionalidades

- Catálogo e ranking vindos do PostgreSQL via API.
- Busca por título/autor e filtro por categoria e autor.
- Modal de detalhe do livro com deep link (`#livro/<slug>`).
- Favoritos no navegador (localStorage), com contador no menu.
- Carrinho de compras com quantidades e total, e checkout que grava o pedido
  no PostgreSQL (ambiente de demonstração, sem pagamento real).
- Painel do administrador (`/admin`) e área do leitor (`/conta`) separados,
  com login, sessão e permissões próprios.
- Alternador de tamanho de fonte (persistente).
- Newsletter com validação no back-end e cadastro no banco.
- Menu hambúrguer no mobile, skip link, `:focus-visible`,
  `prefers-reduced-motion`, `prefers-contrast` e contraste AA.
- Capas SVG geradas dinamicamente (sem imagens quebradas).

## Estrutura

```
.
├── index.html            # página única (renderizada via JS)
├── app.py                # back-end Flask + API + capas SVG
├── schema.sql            # tabelas e índices
├── seed.sql              # categorias, livros e dados iniciais
├── requirements.txt      # dependências Python
├── scripts/
│   └── init_db.sh        # sobe o PostgreSQL local e popula o banco
├── static/
│   ├── css/style.css     # BEM, responsivo, acessível
│   ├── css/painel.css    # painel admin e área do leitor
│   ├── js/app.js         # consumo da API e interações
│   └── favicon.svg
├── templates/
│   ├── admin/            # dashboard, acervo, empréstimos, usuários, atrasos…
│   └── member/           # catálogo, empréstimos, reservas, histórico, perfil
├── .env.example          # variáveis de ambiente
└── .github/workflows/ci.yml
```

## Acessibilidade e qualidade

- Contraste de texto calibrado para AA (ex.: `#667085` sobre `#faf6ef` = 4,62:1).
- HTML semântico com `header`, `nav`, `main`, `section`, `article`, `footer`.
- BEM correto: elementos sempre ligados a um bloco (ex.: `catalog__title`).
- Imagens com `alt` e `width`/`height` (sem layout shift).
- CI valida o back-end e a API a cada push.

## Licença

[MIT](LICENSE).
