/* ===== Aurora Livros — Google Books, EmailJS, sacola, favoritos e filtros ===== */
(function () {
    /* ----- Configuração do EmailJS (crie os valores em https://www.emailjs.com) ----- */
    const EMAILJS = {
        servico: "service_yqv5d3k",
        chave: "r6l7y26GMW5-6BpSD",
        modeloContato: "template_j0wh07i",           /* variáveis: nome, email, assunto, mensagem */
    };

    /* ----- Vales de exemplo (troque por consulta a um back-end quando houver) ----- */
    const VALES = {
        "AURORA-DEMO-0001": { saldo: 100, validade: "31/12/2027" }
    };

    const LIVROS = {
        "jardim": { titulo: "O Jardim Secreto", autor: "Frances Hodgson Burnett", categoria: "classicos", preco: 48.9 },
        "biblioteca": { titulo: "A Biblioteca da Meia-Noite", autor: "Matt Haig", categoria: "fantasia", preco: 54.9 },
        "orgulho": { titulo: "Orgulho e Preconceito", autor: "Jane Austen", categoria: "romance", preco: 42.5 },
        "rosa": { titulo: "O Nome da Rosa", autor: "Umberto Eco", categoria: "misterio", preco: 63.9 },
        "torto": { titulo: "Torto Arado", autor: "Itamar Vieira Junior", categoria: "romance", preco: 52.9 },
        "addie": { titulo: "A Vida Invisível de Addie LaRue", autor: "V. E. Schwab", categoria: "fantasia", preco: 59.9 },
        "expresso": { titulo: "Assassinato no Expresso do Oriente", autor: "Agatha Christie", categoria: "misterio", preco: 39.9 },
        "cem-anos": { titulo: "Cem Anos de Solidão", autor: "Gabriel García Márquez", categoria: "classicos", preco: 58.5 }
    };

    const CATEGORIAS = { romance: "Romance", fantasia: "Fantasia", misterio: "Mistério", classicos: "Clássicos" };

    const INFOS = {
        envios: { titulo: "Envios e devoluções", texto: "As informações sobre prazos, frete e trocas serão publicadas em breve. Enquanto isso, fale com a gente pela página de contato." },
        privacidade: { titulo: "Privacidade", texto: "Usamos seu e-mail apenas para responder mensagens. A sacola e os favoritos ficam salvos somente neste navegador." }
    };

    /* ----- Utilidades ----- */
    const ler = (chave, padrao) => {
        try { return JSON.parse(localStorage.getItem("aurora:" + chave)) || padrao; } catch (e) { return padrao; }
    };
    const guardar = (chave, valor) => {
        try { localStorage.setItem("aurora:" + chave, JSON.stringify(valor)); } catch (e) { }
    };
    const brl = n => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const idDoLink = a => { const m = (a.getAttribute("href") || "").match(/#livro-(.+)$/); return m ? m[1] : null; };

    /* ----- Aviso rápido ----- */
    const aviso = texto => {
        let el = document.querySelector(".aviso");
        if (!el) {
            el = document.createElement("div");
            el.className = "aviso";
            el.setAttribute("role", "status");
            document.body.append(el);
        }
        el.textContent = texto;
        el.classList.add("aviso--visivel");
        clearTimeout(aviso.tempo);
        aviso.tempo = setTimeout(() => el.classList.remove("aviso--visivel"), 5000);
    };

    /* ----- Painel (dialog) ----- */
    const painel = document.createElement("dialog");
    painel.className = "painel";
    document.body.append(painel);
    const abrir = (html, livro) => {
        painel.dataset.livro = livro || "";
        painel.innerHTML = '<button class="painel__fechar" type="button" data-fechar aria-label="Fechar">×</button><div class="painel__conteudo">' + html + "</div>";
        if (!painel.open) painel.showModal();
    };
    painel.addEventListener("click", e => { if (e.target === painel) painel.close(); });

    /* ----- Sacola e favoritos ----- */
    const atualizarContadores = () => {
        const botoes = document.querySelectorAll(".actions__btn:not(.actions__btn--accessbility)");
        const favoritos = ler("favoritos", []).length;
        const sacola = Object.values(ler("sacola", {})).reduce((a, n) => a + n, 0);
        const marcar = (botao, n) => { const s = botao && botao.querySelector(".nav-action-badge"); if (s) s.textContent = n; };
        marcar(botoes[0], favoritos);
        marcar(botoes[1], sacola);
        const icone = botoes[0] && botoes[0].querySelector("img");
        if (icone) icone.src = icone.src.replace(/favorites-(un)?filled/, favoritos ? "favorites-filled" : "favorites-unfilled");
    };

    const comprar = id => {
        const sacola = ler("sacola", {});
        sacola[id] = (sacola[id] || 0) + 1;
        guardar("sacola", sacola);
        atualizarContadores();
        aviso("“" + LIVROS[id].titulo + "” foi para a sacola.");
    };

    const favoritar = id => {
        let favoritos = ler("favoritos", []);
        const ja = favoritos.includes(id);
        favoritos = ja ? favoritos.filter(f => f !== id) : favoritos.concat(id);
        guardar("favoritos", favoritos);
        atualizarContadores();
        aviso(ja ? "Removido dos favoritos." : "Adicionado aos favoritos.");
        return !ja;
    };

    const mostrarSacola = () => {
        const sacola = ler("sacola", {});
        const ids = Object.keys(sacola).filter(id => LIVROS[id]);
        const total = ids.reduce((a, id) => a + LIVROS[id].preco * sacola[id], 0);
        const itens = ids.map(id => '<li class="painel__item"><span>' + sacola[id] + "× " + esc(LIVROS[id].titulo) + "</span><span>" + brl(LIVROS[id].preco * sacola[id]) +
            '</span><button class="painel__btn painel__btn--vazado" type="button" data-remover="' + id + '">Remover</button></li>').join("");
        abrir('<p class="painel__rotulo">SUA SACOLA</p><h2 class="painel__titulo">Sacola de compras</h2>' + (ids.length
            ? '<ul class="painel__lista">' + itens + '</ul><div class="painel__acoes"><strong class="painel__preco">Total: ' + brl(total) +
            '</strong><button class="painel__btn" type="button" data-limpar>Limpar sacola</button></div>'
            : '<p class="painel__texto">Sua sacola está vazia.</p>'));
    };

    const mostrarFavoritos = () => {
        const ids = ler("favoritos", []).filter(id => LIVROS[id]);
        const itens = ids.map(id => '<li class="painel__item"><span>' + esc(LIVROS[id].titulo) + " — " + esc(LIVROS[id].autor) +
            '</span><button class="painel__btn painel__btn--vazado" type="button" data-detalhes="' + id + '">Ver</button></li>').join("");
        abrir('<p class="painel__rotulo">SEUS FAVORITOS</p><h2 class="painel__titulo">Livros favoritos</h2>' + (ids.length
            ? '<ul class="painel__lista">' + itens + "</ul>"
            : '<p class="painel__texto">Você ainda não favoritou nenhum livro. Abra um livro no catálogo e toque em Favoritar.</p>'));
    };

    /* ----- Google Books ----- */
    const googleBooks = async id => {
        const guardado = ler("gb:" + id, null);
        if (guardado) return guardado;
        const l = LIVROS[id];
        const q = encodeURIComponent("intitle:" + l.titulo + " inauthor:" + l.autor);
        try {
            const r = await fetch("https://www.googleapis.com/books/v1/volumes?q=" + q + "&maxResults=1&printType=books");
            if (!r.ok) return null;
            const itens = (await r.json()).items;
            const v = itens && itens[0] && itens[0].volumeInfo;
            if (!v) return null;
            const capa = v.imageLinks && (v.imageLinks.thumbnail || v.imageLinks.smallThumbnail);
            const dado = {
                capa: capa ? capa.replace("http:", "https:").replace("zoom=1", "zoom=2").replace("&edge=curl", "") : "",
                descricao: v.description ? new DOMParser().parseFromString(v.description, "text/html").body.textContent : "",
                paginas: v.pageCount, editora: v.publisher, ano: (v.publishedDate || "").slice(0, 4),
                nota: v.averageRating, avaliacoes: v.ratingsCount, link: v.infoLink
            };
            guardar("gb:" + id, dado);
            return dado;
        } catch (e) { return null; }
    };

    /* Complementa o acervo com resultados reais do Google Books. */
    const carregarMaisLivros = async () => {
        const grade = document.querySelector(".catalog__books");
        if (!grade) return;
        const contador = document.getElementById("catalog-count");
        const buscas = [
            ["romance", "subject:romance"],
            ["fantasia", "subject:fantasy"],
            ["misterio", "subject:mystery"],
            ["classicos", "subject:classics"]
        ];
        const existentes = new Set(Object.values(LIVROS).map(l => (l.titulo + "|" + l.autor).toLowerCase()));
        let adicionados = 0;
        try {
            const resultados = await Promise.all(buscas.map(async ([categoria, consulta]) => {
                const url = "https://www.googleapis.com/books/v1/volumes?q=" + encodeURIComponent(consulta) + "&langRestrict=pt&maxResults=20&printType=books&orderBy=relevance";
                const resposta = await fetch(url);
                if (!resposta.ok) return [categoria, []];
                const dados = await resposta.json();
                return [categoria, dados.items || []];
            }));
            resultados.forEach(([categoria, itens]) => itens.forEach(item => {
                const v = item.volumeInfo || {};
                const titulo = (v.title || "").trim();
                const autor = (v.authors || []).join(", ");
                if (!titulo || !autor || existentes.has((titulo + "|" + autor).toLowerCase())) return;
                existentes.add((titulo + "|" + autor).toLowerCase());
                const id = "gb-" + item.id.replace(/[^a-z0-9_-]/gi, "");
                LIVROS[id] = { titulo, autor, categoria, googleId: item.id, link: v.infoLink || ("https://books.google.com/books?id=" + encodeURIComponent(item.id)), capa: v.imageLinks && (v.imageLinks.thumbnail || v.imageLinks.smallThumbnail) };
                const card = document.createElement("article");
                card.className = "slct-cards slct-cards--api slct-cards--" + categoria;
                const capa = LIVROS[id].capa ? "background-image:url('" + esc(LIVROS[id].capa.replace("http:", "https:")) + "')" : "";
                card.innerHTML = '<a class="slct-cards__link slct-cards__link--capa" style="' + capa + '" href="#livro-' + id + '"><div class="book-card slct-cards__book"><p class="book-card__title">' + esc(titulo.toUpperCase()) + '</p><p class="book-card__author">' + esc(autor.toUpperCase()) + '</p></div></a>' +
                    '<div class="book-info slct-cards__infos"><span class="book-info__category">' + esc(CATEGORIAS[categoria].toUpperCase()) + '</span><a class="book-info__title" href="#livro-' + id + '">' + esc(titulo) + '</a><p class="book-info__author">por ' + esc(autor) + '</p></div>' +
                    '<div class="cards-shop slct-cards__shop"><a class="cards-shop__btn" href="' + esc(LIVROS[id].link) + '" target="_blank" rel="noopener">Ver no Google Books</a></div>';
                grade.append(card);
                adicionados++;
            }));
            if (contador) contador.textContent = adicionados ? (adicionados + " livros novos carregados do Google Books") : "O acervo inicial está atualizado; não há novos resultados disponíveis agora.";
        } catch (e) {
            if (contador) contador.textContent = "Não foi possível atualizar o acervo agora. Os livros já disponíveis continuam acessíveis.";
        }
        atualizarContagemCatalogo();
    };

    const atualizarContagemCatalogo = () => {
        const grade = document.querySelector(".catalog__books");
        const contador = document.getElementById("catalog-count");
        if (!grade || !contador) return;
        const selecionado = document.querySelector('input[name="categoria"]:checked');
        const categoria = selecionado ? selecionado.id.replace("filtro-", "") : "todos";
        const visiveis = Array.from(grade.querySelectorAll(".slct-cards")).filter(card => categoria === "todos" || card.classList.contains("slct-cards--" + categoria));
        grade.querySelectorAll(".slct-cards").forEach(card => { card.hidden = categoria !== "todos" && !card.classList.contains("slct-cards--" + categoria); });
        contador.textContent = visiveis.length + (visiveis.length === 1 ? " livro no acervo" : " livros no acervo");
    };

    const aplicarCapas = () => {
        document.querySelectorAll(".slct-cards, .mais-amados__item").forEach(async card => {
            const link = card.querySelector('a[href*="#livro-"]');
            const id = link && idDoLink(link);
            if (!LIVROS[id]) return;
            const dado = await googleBooks(id);
            if (!dado || !dado.capa) return;
            const alvo = card.querySelector(".slct-cards__link, .mais-amados__capa");
            alvo.style.backgroundImage = "url('" + dado.capa + "')";
            alvo.classList.add(alvo.matches(".slct-cards__link") ? "slct-cards__link--capa" : "mais-amados__capa--api");
        });
    };

    const detalhes = async id => {
        const l = LIVROS[id];
        if (!l) return;
        const fav = ler("favoritos", []).includes(id);
        if (l.googleId) {
            abrir('<p class="painel__rotulo">' + CATEGORIAS[l.categoria].toUpperCase() + '</p><h2 class="painel__titulo">' + esc(l.titulo) +
                '</h2><p class="painel__autor">por ' + esc(l.autor) + '</p><p class="painel__texto" data-sinopse>Buscando informa\u00e7\u00f5es no Google Books...</p><ul class="painel__dados" data-dados></ul>' +
                '<div class="painel__acoes"><a class="painel__btn" href="' + esc(l.link) + '" target="_blank" rel="noopener">Consultar no Google Books</a></div>', id);
            const dadoApi = await googleBooks(id);
            if (painel.dataset.livro !== id) return;
            painel.querySelector("[data-sinopse]").textContent = dadoApi && dadoApi.descricao ? dadoApi.descricao.slice(0, 600) : "Sinopse indispon\u00edvel.";
            return;
        }
        abrir('<p class="painel__rotulo">' + CATEGORIAS[l.categoria].toUpperCase() + '</p><h2 class="painel__titulo">' + esc(l.titulo) +
            '</h2><p class="painel__autor">por ' + esc(l.autor) + '</p><p class="painel__texto" data-sinopse>Buscando informações no Google Books…</p>' +
            '<ul class="painel__dados" data-dados></ul><div class="painel__acoes"><strong class="painel__preco">' + brl(l.preco) +
            '</strong><button class="painel__btn" type="button" data-comprar="' + id + '">Adicionar ao carrinho</button>' +
            '<button class="painel__btn painel__btn--vazado" type="button" data-favoritar="' + id + '">' + (fav ? "Remover dos favoritos" : "Favoritar") + "</button></div>", id);
        const dado = await googleBooks(id);
        if (painel.dataset.livro !== id) return;
        const sinopse = painel.querySelector("[data-sinopse]");
        if (!dado) { sinopse.textContent = "Não foi possível carregar mais informações deste livro agora."; return; }
        sinopse.textContent = dado.descricao ? dado.descricao.slice(0, 600) + (dado.descricao.length > 600 ? "…" : "") : "Sinopse indisponível.";
        const dados = [];
        if (dado.editora) dados.push("Editora: " + dado.editora);
        if (dado.ano) dados.push("Ano: " + dado.ano);
        if (dado.paginas) dados.push("Páginas: " + dado.paginas);
        if (dado.nota) dados.push("Nota no Google Books: " + dado.nota + (dado.avaliacoes ? " (" + dado.avaliacoes + ")" : ""));
        painel.querySelector("[data-dados]").innerHTML = dados.map(d => "<li>" + esc(d) + "</li>").join("") +
            (dado.link ? '<li><a class="painel__link" href="' + esc(dado.link) + '" target="_blank" rel="noopener">Ver no Google Books →</a></li>' : "");
    };

    /* ----- Filtro do catálogo ----- */
    const filtrar = categoria => {
        const radio = document.getElementById("filtro-" + categoria);
        if (!radio) return false;
        radio.checked = true;
        history.replaceState(null, "", categoria === "todos" ? "catalogo.html" : "?categoria=" + categoria);
        return true;
    };

    /* ----- EmailJS ----- */
    const enviarEmail = async (modelo, params) => {
        if ([EMAILJS.servico, EMAILJS.chave, modelo].some(v => v.indexOf("SE") === 0 || v.indexOf("SU") === 0)) {
            return null;
        }
        try {
            const r = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ service_id: EMAILJS.servico, template_id: modelo, user_id: EMAILJS.chave, template_params: params })
            });
            if (!r.ok) throw new Error(await r.text());
            return true;
        } catch (e) {
            return null;
        }
    };

    /* ----- Cliques ----- */
    document.addEventListener("click", e => {
        const alvo = e.target.closest("button, a");
        if (!alvo) return;
        const noCatalogo = !!document.getElementById("filtro-todos");
        const d = alvo.dataset;

        if (alvo.matches("button.cards-shop__btn")) {
            const link = alvo.closest("article").querySelector('a[href*="#livro-"]');
            comprar(idDoLink(link));
        } else if (alvo.matches('a[href*="#livro-"]') && noCatalogo) {
            e.preventDefault();
            history.replaceState(null, "", "#livro-" + idDoLink(alvo));
            detalhes(idDoLink(alvo));
        } else if (alvo.matches(".book-info__category") && noCatalogo) {
            e.preventDefault();
            filtrar(new URL(alvo.href).searchParams.get("categoria"));
        } else if (alvo.matches('a[href="#envios"], a[href="#privacidade"]')) {
            e.preventDefault();
            const info = INFOS[alvo.getAttribute("href").slice(1)];
            abrir('<h2 class="painel__titulo">' + info.titulo + '</h2><p class="painel__texto">' + info.texto + "</p>");
        } else if (alvo.matches(".actions__btn--accessbility")) {
            const ativo = document.documentElement.classList.toggle("acessivel");
            alvo.setAttribute("aria-pressed", ativo);
            guardar("acessivel", ativo);
        } else if (alvo.matches(".actions__btn")) {
            alvo === document.querySelector(".actions__btn") ? mostrarFavoritos() : mostrarSacola();
        } else if (d.href) {
            location.href = d.href;
        } else if (d.fechar !== undefined) {
            painel.close();
        } else if (d.comprar) {
            comprar(d.comprar);
        } else if (d.favoritar) {
            alvo.textContent = favoritar(d.favoritar) ? "Remover dos favoritos" : "Favoritar";
        } else if (d.remover) {
            const sacola = ler("sacola", {});
            delete sacola[d.remover];
            guardar("sacola", sacola);
            atualizarContadores();
            mostrarSacola();
        } else if (d.limpar !== undefined) {
            guardar("sacola", {});
            atualizarContadores();
            mostrarSacola();
        } else if (d.detalhes) {
            detalhes(d.detalhes);
        }
    });

    /* ----- Formulários ----- */
    document.addEventListener("submit", async e => {
        const f = e.target;
        e.preventDefault();
        const botao = f.querySelector('[type="submit"]');
        botao.disabled = true;
        if (f.matches(".form-fields")) {
            const dadosContato = { nome: f.nome.value, email: f.email.value, assunto: f.subject.selectedOptions[0].text, mensagem: f.mensagem.value };
            let ok = await enviarEmail(EMAILJS.modeloContato, dadosContato);
            if (ok === null) {
                const corpo = "Nome: " + dadosContato.nome + "\nE-mail para resposta: " + dadosContato.email + "\nAssunto: " + dadosContato.assunto + "\n\n" + dadosContato.mensagem;
                location.href = "mailto:auroralibellum@gmail.com?subject=" + encodeURIComponent("Contato pelo site: " + dadosContato.assunto) + "&body=" + encodeURIComponent(corpo);
                aviso("Seu aplicativo de e-mail foi aberto com a mensagem preenchida.");
                ok = false;
            }
            if (ok) {
                f.reset();
                aviso("Mensagem enviada! Responderemos em breve.");
            }
        } else if (f.matches(".voucher-form")) {
            const vale = VALES[f.codigo.value.trim().toUpperCase()];
            aviso(vale ? "Vale válido: saldo de " + brl(vale.saldo) + ", válido até " + vale.validade + "."
                : "Código não encontrado. Confira os caracteres ou fale com a gente.");
        }
        botao.disabled = false;
    });

    /* ----- Início ----- */
    if (ler("acessivel", false)) {
        document.documentElement.classList.add("acessivel");
        const botao = document.querySelector(".actions__btn--accessbility");
        if (botao) botao.setAttribute("aria-pressed", "true");
    }
    atualizarContadores();
    aplicarCapas();
    carregarMaisLivros();
    document.querySelectorAll('input[name="categoria"]').forEach(radio => radio.addEventListener("change", atualizarContagemCatalogo));
    if (document.getElementById("filtro-todos")) {
        const categoria = new URLSearchParams(location.search).get("categoria");
        if (categoria) filtrar(categoria);
        if (location.hash.indexOf("#livro-") === 0) detalhes(location.hash.slice(7));
    }
})();
