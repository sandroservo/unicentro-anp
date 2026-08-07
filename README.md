# 🎓 ANP - Aulas Não Presenciais

Plataforma de ensino à distância com **Professor Virtual (IA)** integrado.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8)
![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748)

## ✨ Funcionalidades

- 📹 **Vídeo-aulas** com player YouTube integrado
- 🤖 **Professor Virtual IA** para tirar dúvidas 24/7
- 📚 **Materiais de apoio** (PDFs, slides, documentos)
- 📝 **Atividades** com correção automática
- 💬 **Fórum de discussão** por aula
- 📊 **Acompanhamento de progresso**
- 👥 **Múltiplos perfis** (Aluno, Monitor, Professor, Admin)

## 🚀 Começando

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Instalação

1. **Clone o repositório**
```bash
git clone <seu-repositorio>
cd anp-mvp
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` (veja `.env.example`). Para o Professor IA, suba o OmniRoute:

```bash
npm i -g omniroute && omniroute serve
# API em http://127.0.0.1:20128/v1
```

4. **Configure o banco de dados**
```bash
npx prisma generate
npx prisma db push
```

5. **Popule com dados de exemplo**
```bash
npx tsx prisma/seed.ts
```

6. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 🔐 Credenciais de Teste

| Perfil | Email | Senha |
|--------|-------|-------|
| Aluno | aluno@unicentroma.edu.br | CPF `52998224725` |
| Professor | professor@unicentroma.edu.br | 123456 |
| Admin | admin@unicentroma.edu.br | 123456 |

Login apenas com email `@unicentroma.edu.br`. Alunos usam o **CPF** como senha; demais usuários usam senha normal.

## 📁 Estrutura do Projeto

```
anp-mvp/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Páginas de autenticação
│   ├── (dashboard)/       # Área logada
│   │   ├── aluno/         # Portal do aluno
│   │   └── admin/         # Portal administrativo
│   └── api/               # API Routes
├── components/            # Componentes React
│   ├── layout/           # Sidebar, Header
│   ├── ui/               # Componentes base
│   └── ai/               # Componentes do chat IA
├── lib/                   # Utilitários
│   ├── prisma.ts         # Cliente Prisma
│   ├── auth.ts           # NextAuth config
│   └── ai/               # Módulo Professor Virtual
├── prisma/
│   ├── schema.prisma     # Schema do banco
│   └── seed.ts           # Dados de exemplo
└── public/               # Arquivos estáticos
```

## 🤖 Professor Virtual (IA)

Motor: **OmniRoute** (gateway OpenAI-compatible com roteamento entre provedores).
Configuração em Admin → Configurações ou via `OMNIROUTE_*` no `.env`.

### Configuração

```env
OMNIROUTE_BASE_URL=http://127.0.0.1:20128/v1
OMNIROUTE_MODEL=auto
# OMNIROUTE_API_KEY=...   # se o OmniRoute exigir chave
```

No dashboard do OmniRoute, use a estratégia **Free** / cost-optimized para priorizar free tiers.

### Funcionamento

- Cada turma pode ter `aiPersona` própria
- Na aula, o chat recebe título, conceito e trecho da transcrição
- RAG busca trechos da KnowledgeBase do curso
- Respostas em streaming (SSE); sem gateway, devolve fontes RAG + aviso

## 🛠️ Scripts Disponíveis

```bash
npm run dev        # Servidor de desenvolvimento
npm run build      # Build de produção
npm run start      # Inicia produção
npm run db:push    # Sincroniza schema
npm run db:generate # Gera cliente Prisma
```

## 📦 Tecnologias

- **Frontend**: Next.js 14, React 18, TypeScript
- **Estilização**: Tailwind CSS
- **Banco de Dados**: SQLite (dev) / PostgreSQL (prod)
- **ORM**: Prisma
- **Autenticação**: NextAuth.js
- **IA**: OmniRoute (gateway OpenAI-compatible)

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório na Vercel
2. Configure as variáveis de ambiente
3. Para banco de dados, use:
   - [Supabase](https://supabase.com) (PostgreSQL gratuito)
   - [Neon](https://neon.tech) (PostgreSQL serverless)
   - [PlanetScale](https://planetscale.com) (MySQL)

### Variáveis de Ambiente para Produção

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="gere-uma-chave-forte"
NEXTAUTH_URL="https://seu-dominio.com"
OMNIROUTE_BASE_URL=http://127.0.0.1:20128/v1
OMNIROUTE_MODEL=auto
```

## 📄 Licença

Este projeto é apenas para fins educacionais.

---

Desenvolvido com ❤️ para educação à distância
# unicentro-anp
