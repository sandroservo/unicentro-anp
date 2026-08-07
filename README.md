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

Edite o arquivo `.env`:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"
NEXTAUTH_URL="http://localhost:3000"
ANTHROPIC_API_KEY="sk-ant-..." # Opcional - para Professor Virtual real
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

O Professor Virtual aceita **qualquer API de IA** configurada no `.env`. Suporta **Anthropic (Claude)** e **OpenAI (GPT)**.

### Configuração

1. Escolha o provedor e obtenha uma API key:
   - **Anthropic (Claude):** [console.anthropic.com](https://console.anthropic.com)
   - **OpenAI (GPT):** [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. No `.env`, defina o provedor (opcional) e a chave:
```env
# Opcional: anthropic | openai (se omitido, usa o primeiro com chave)
AI_PROVIDER=openai

# Use a chave do provedor desejado
ANTHROPIC_API_KEY="sk-ant-..."
# ou
OPENAI_API_KEY="sk-..."
```

### Funcionamento

- Cada curso pode ter sua própria "persona" de professor
- O contexto da aula atual é enviado automaticamente
- Respostas são baseadas no conteúdo do curso
- Sem chave configurada (ou em caso de erro da API), usa respostas simuladas

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
- **IA**: Claude API (Anthropic)

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
ANTHROPIC_API_KEY="sk-ant-..."
```

## 📄 Licença

Este projeto é apenas para fins educacionais.

---

Desenvolvido com ❤️ para educação à distância
# unicentro-anp
