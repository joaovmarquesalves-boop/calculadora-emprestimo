# Deploy na Vercel

## Configurações de Build

Configure no Dashboard da Vercel (Settings > General > Build & Development Settings):

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

## Variáveis de ambiente necessárias

Configure estas variáveis no Dashboard da Vercel (Settings > Environment Variables):

### Autenticação do Admin (Obrigatórias)
- `ADMIN_PASSWORD_HASH`: Hash SHA-256 da senha do admin (padrão: senha123)
  - Para gerar um novo hash: `echo -n "suasenha" | sha256sum`
- `JWT_SECRET`: Chave secreta para assinar os tokens JWT (IMPORTANTE: use uma senha forte e única)
  - Exemplo: `minha-chave-secreta-super-forte-123456`
  
### Autenticação do Admin (Opcionais)
- `ADMIN_MAX_ATTEMPTS`: Número máximo de tentativas de login (padrão: 5)
- `ADMIN_LOCKOUT_MINUTES`: Tempo de bloqueio após exceder tentativas (padrão: 15)
- `ADMIN_SESSION_MINUTES`: Duração da sessão em minutos (padrão: 60)

### Configuração do Site (opcional)
- `SITE_CONFIG`: JSON com configurações customizadas do site

## Exemplo de variáveis

```
ADMIN_PASSWORD_HASH=a096178e4ff371d9450541f8b253c07476bee0111d311f02c3642dce8b4fd147
JWT_SECRET=minha-chave-secreta-super-forte-altere-isso-em-producao
ADMIN_MAX_ATTEMPTS=5
ADMIN_LOCKOUT_MINUTES=15
ADMIN_SESSION_MINUTES=60
```

## Deploy via CLI

1. Instale a CLI da Vercel: `npm i -g vercel`
2. Execute: `vercel`
3. Siga as instruções para fazer o deploy
4. Configure as variáveis de ambiente no dashboard

## Deploy via GitHub

1. Conecte seu repositório no dashboard da Vercel
2. A Vercel detectará automaticamente as configurações
3. Configure as variáveis de ambiente (IMPORTANTE: configure JWT_SECRET)
4. O deploy será feito automaticamente a cada push

## Observações

- **IMPORTANTE**: Configure uma `JWT_SECRET` forte e única para produção
- Na Vercel, alterações de senha e configuração devem ser feitas via variáveis de ambiente
- As sessões agora usam JWT (JSON Web Tokens) e funcionam entre diferentes funções serverless
- Para persistência de dados, considere usar um banco de dados externo
- A senha padrão é `senha123` (hash fornecido acima)
