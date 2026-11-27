# Biblioteca-Virtual
Aurora Livros — Biblioteca Virtual

Projeto de uma livraria virtual com curadoria de clássicos e descobertas contemporâneas. A interface foi construída com HTML, CSS e JavaScript, com páginas responsivas para explorar livros, autores e serviços da Aurora.

## Prints do site em diferentes tipos de tela:

<img width="515" height="325" alt="WhatsApp Image 2026-11-25 at 23 12 44 (2)" src="https://github.com/user-attachments/assets/8acbf10b-d0f5-46e3-8b27-e01e7528f908" />
<img width="350" height="325" alt="WhatsApp Image 2026-11-25 at 23 12 44 (1)" src="https://github.com/user-attachments/assets/fe3e52da-43f5-4626-be7c-a37685b16aea" />
<img width="333" height="325" alt="WhatsApp Image 2026-11-25 at 23 12 44" src="https://github.com/user-attachments/assets/e031e73c-aa63-4320-bb07-e1e2c05cbea4" />


## Funcionalidades

- **Página inicial** com destaques, recomendações e acesso às demais áreas do site.
- **Catálogo** com livros organizados por Romance, Fantasia, Mistério e Clássicos; filtros por categoria e contador de resultados.
- **Detalhes dos livros** em janela modal, com sinopses e informações complementares consultadas na API Google Books.
- **Capas e livros adicionais** carregados da API Google Books quando disponíveis.
- **Sacola e favoritos** com dados guardados no armazenamento local do navegador.
- **Página de autores** com apresentação da equipe do projeto.
- **Página de contato** com envio pelo EmailJS (quando configurado) e alternativa para abrir o aplicativo de e-mail.
- **Resgate de vale-presente** com código demonstrativo incluído no projeto.
- **Ajuste de acessibilidade** para ampliar a legibilidade, com preferência salva no navegador.
- **Layout responsivo**, fontes locais e elementos de navegação com rótulos acessíveis.

## Tecnologias

- HTML5
- CSS3: Grid, Flexbox, variáveis, `clamp()` e media queries
- JavaScript (sem etapa de build)
- API Google Books para dados de livros
- EmailJS para o formulário de contato
- Fontes locais: Atkinson Hyperlegible Mono, Libre Caslon Text, Manrope e Special Elite

## Estrutura do projeto

```
Biblioteca-Virtual-main/
├── index.html                  # Página inicial
├── script.js                   # Interações e integrações do site
├── style.css                   # Estilos compartilhados
├── pages/
│   ├── autores.html
│   ├── catalogo.html
│   ├── contato.html
│   └── vale-presente.html
└── style/
    ├── autores.css
    ├── catalogo.css
    ├── contato.css
    ├── footer.css
    ├── index.css
    ├── modal.css
    ├── vale-presente.css
    ├── fonts/                  # Fontes locais
    └── icons/                  # Ícones e logotipos em SVG
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
  
## Configuração do formulário

O formulário de contato usa EmailJS. Para conectá-lo à sua conta, atualize as propriedades `servico`, `chave` e `modeloContato` no objeto `EMAILJS`, no início de `script.js`, e configure o modelo para receber `nome`, `email`, `assunto` e `mensagem`. Se o envio não estiver disponível, o site tenta abrir uma mensagem preenchida no aplicativo de e-mail padrão.

A consulta ao Google Books depende de conexão com a internet. Se a API não retornar dados, o site mantém o conteúdo já presente na página.

## Observações

- O projeto ainda está em desenvolvimento e apresenta apenas uma versão inicial. Posto isso, ainda podem ser apresentados problemas de funcionalidade e de estrutura. Agradecemos a paciência e compreensão!
p.s: arthmendz <3

## Equipe

- Héber Ebenézer
- Kyvia Wenne
- João Gabriel
- Pedro Arthur
- Philipe Gabriel
