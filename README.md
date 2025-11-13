# Landing Page - Consignado 99

Landing page desenvolvida em React + Vite + TypeScript com Tailwind CSS para apresentação e captação de leads de empréstimo consignado para servidores públicos.

## Pré-requisitos

- Node.js 18 ou superior
- npm 9 ou superior

## Instalação

```bash
npm install
```

## Configuração da senha administrativa

1. Copie o arquivo `.env.example` para `.env`.
2. Ajuste as variáveis `ADMIN_PASSWORD_HASH`, `ADMIN_MAX_ATTEMPTS`, `ADMIN_LOCKOUT_MINUTES` e `ADMIN_SESSION_MINUTES` conforme a
   política desejada.
3. Para gerar o hash SHA-256 de uma nova senha utilize, por exemplo:

```bash
node -e "import('crypto').then(({ createHash }) => { const senha = 'NovaSenhaSegura'; const hash = createHash('sha256').update(senha).digest('hex'); console.log(hash); });"
```

As alterações feitas pelo administrador dentro do painel serão gravadas automaticamente no arquivo `.env`. Ao trocar a senha, o
servidor mantém apenas a sessão em uso e encerra as demais automaticamente.

## Ambiente de desenvolvimento

```bash
npm run dev
```

A aplicação ficará disponível em [http://localhost:5173](http://localhost:5173).

Inicie também o servidor da API administrativa em outro terminal:

```bash
npm run server
```

## Build de produção

```bash
npm run build
```

O resultado será gerado na pasta `dist/`.

Para servir a aplicação já compilada junto com a API execute:

```bash
npm run server
```

## Tecnologias e destaques

- ⚛️ React com Vite e TypeScript
- 🎨 Tailwind CSS totalmente configurado
- 🧮 Calculadora interativa com atualização em tempo real
- 💬 Envio dos leads diretamente para o WhatsApp
- 📱 Layout responsivo e mobile-first
