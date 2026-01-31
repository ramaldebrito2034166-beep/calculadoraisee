# Simulador ISEE (IZ) e ISPE (ISP) - Academitaly

Mini web app estático (HTML + CSS + JavaScript puro), sem backend e sem coleta/armazenamento/envio de dados. Tudo roda localmente no navegador.

## Rodar localmente

Opção simples:

- Abra o arquivo `index.html` no navegador.

Opção recomendada (servidor local):

- VS Code/Cursor: use a extensão "Live Server" e abra o `index.html`.
- Ou com Python:

```bash
cd simulador-isee-ispe-academitaly
python3 -m http.server 5173
```

Depois acesse `http://localhost:5173`.

## Deploy (Vercel ou Netlify)

### Vercel

1. Suba esta pasta como um projeto na Vercel (Import Project).
2. Não precisa de build: é site estático.
3. O arquivo `vercel.json` já inclui um `Content-Security-Policy` com `frame-ancestors` permitindo embed no Notion.

### Netlify

1. Faça deploy da pasta como site estático (Drag and drop ou via Git).
2. Se quiser configurar headers no Netlify, você pode criar um arquivo `_headers` depois (não incluído aqui).

## Embutir no Notion via /embed

1. Faça deploy do projeto (Vercel ou Netlify).
2. Copie a URL pública do seu site (ex.: `https://seu-site.vercel.app/`).
3. No Notion, digite `/embed` e cole a URL.

Observação: para o embed funcionar, o servidor não pode bloquear iframes. Na Vercel, este projeto evita `X-Frame-Options` e permite `frame-ancestors` do Notion via CSP.

## Logo

O app tenta carregar `assets/logo-white.png`. Você pode substituir esse arquivo pelo logo oficial em branco, mantendo o mesmo nome e caminho.

