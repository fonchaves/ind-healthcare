# Dashboard de Monitoramento SRAG

Sistema full-stack para monitoramento e visualização de dados de SRAG (Síndrome Respiratória Aguda Grave).

## 📊 Visão Geral

Aplicação web que fornece métricas em tempo real e visualizações gráficas sobre casos de SRAG no Brasil, utilizando dados do OpenDataSUS.

### Funcionalidades

- **Dashboard de Métricas**: Exibição de 4 métricas principais
  - Taxa de crescimento de casos (vs mês anterior)
  - Taxa de mortalidade
  - Taxa de ocupação de UTI
  - Taxa de vacinação

- **Visualização Gráfica Interativa**:
  - Gráfico de linhas mostrando evolução temporal dos casos
  - Filtros por período (diário, mensal, anual)
  - Agrupamento por região (estado, município)
  - **Filtro Dinâmico Inteligente**:
    - Filtro por estado (opcional) quando agrupado por estado
    - Filtro por município (obrigatório) quando agrupado por município
    - Preserva última seleção ao alternar entre agrupamentos
  - **Nomes Legíveis**: Municípios exibidos com nomes completos, não códigos IBGE

- **Design Responsivo**: Funciona perfeitamente em desktop, tablet e mobile
- **Validações UX**: Impede estados inválidos (ex: gráfico ilegível com todos os municípios)

## 🛠️ Stack Técnico

### Backend
- **Framework**: NestJS 11
- **Linguagem**: TypeScript 5.7
- **Banco de Dados**: PostgreSQL 15
- **ORM**: Prisma 6
- **Documentação**: Swagger/OpenAPI
- **Validação**: class-validator, class-transformer

### Frontend
- **Framework**: Next.js 15 com App Router
- **UI Library**: React 19
- **Estilização**: Tailwind CSS 4
- **Gráficos**: Recharts 3
- **HTTP Client**: Axios
- **Ícones**: lucide-react
- **Utilitários**: date-fns

### DevOps
- **Containerização**: Docker Compose
- **Package Manager**: pnpm
- **Linting**: ESLint + Prettier

## 📁 Estrutura do Projeto

```
/
├── backend/              # API NestJS
│   ├── prisma/
│   │   └── schema.prisma # Schema do banco de dados
│   └── src/
│       ├── database/     # Prisma service e seed
│       ├── metrics/      # Módulo de métricas
│       ├── charts/       # Módulo de gráficos
│       └── main.ts       # Entry point
│
├── frontend/             # Aplicação Next.js
│   └── src/
│       ├── app/          # App Router
│       ├── components/   # Componentes React
│       │   └── dashboard/
│       ├── services/     # API client
│       └── types/        # TypeScript types
│
├── docs/                 # Documentação e dados
│   └── datasource/
│       ├── partial/      # Dados parciais (dev)
│       └── full/         # Dados completos (prod)
│
└── docker-compose.yml    # PostgreSQL + Backend containers
```

## 🚀 Como Executar Localmente

### Pré-requisitos

- Node.js 20+ e pnpm
- Docker e Docker Compose
- Git

### 1. Clone o Repositório

```bash
git clone https://github.com/fonchaves/ind-healthcare
cd ind-healthcare
cd backend
```

### 2. Inicie o Banco de Dados

```bash
docker-compose up -d
```

Aguarde alguns segundos para o PostgreSQL inicializar completamente.

### 3. Configure o Backend

```bash
cd backend

# Instale as dependências
pnpm install

# Configure as variáveis de ambiente
cp .env.example .env

# Execute as migrations
pnpm exec prisma migrate dev

# Importe os dados (dataset parcial para desenvolvimento)
pnpm run seed

# Para dados completos em produção, use:
# pnpm run seed:full

# Inicie o servidor de desenvolvimento
pnpm run start:dev
```

O backend estará rodando em `http://localhost:3001`
- API: `http://localhost:3001/api`
- Swagger: `http://localhost:3001/api/docs`

### 4. Configure o Frontend

Em outro terminal:

```bash
cd frontend

# Instale as dependências
pnpm install

# Configure as variáveis de ambiente
cp .env.example .env.local

# Inicie o servidor de desenvolvimento
pnpm run dev
```

O frontend estará rodando em `http://localhost:3000`

## 📡 Endpoints da API

### Métricas

**GET** `/api/metrics/dashboard`

Retorna as 4 métricas principais do dashboard.

**Resposta:**
```json
{
  "caseGrowthRate": {
    "value": "+15.3%",
    "context": "vs mês anterior"
  },
  "mortalityRate": {
    "value": "8.2%",
    "context": "casos com óbito"
  },
  "icuOccupancyRate": {
    "value": "45%",
    "context": "pacientes hospitalizados em UTI"
  },
  "vaccinationRate": {
    "value": "72%",
    "context": "com ao menos 1 dose"
  }
}
```

### Gráficos

**GET** `/api/charts/cases`

Retorna dados para o gráfico de evolução temporal de casos.

**Query Parameters:**
- `period` (opcional): `daily`, `monthly`, ou `yearly` (padrão: `monthly`)
- `groupBy` (opcional): `state` ou `municipality` (padrão: `state`)
- `state` (opcional): Código do estado (ex: `SP`, `RJ`)
- `municipality` (opcional): Código IBGE do município (ex: `355030` para São Paulo)

**Resposta (groupBy=state):**
```json
{
  "data": [
    {
      "date": "2024-01",
      "cases": 1523,
      "region": "SP"
    },
    {
      "date": "2024-01",
      "cases": 987,
      "region": "RJ"
    }
  ]
}
```

**Resposta (groupBy=municipality):**
```json
{
  "data": [
    {
      "date": "2024-01",
      "cases": 856,
      "region": "SAO PAULO"
    },
    {
      "date": "2024-01",
      "cases": 432,
      "region": "RIO DE JANEIRO"
    }
  ]
}
```

**GET** `/api/charts/states`

Retorna lista de todos os estados disponíveis para o filtro.

**Resposta:**
```json
{
  "states": ["SP", "RJ", "MG", "RS", ...]
}
```

**GET** `/api/charts/municipalities`

Retorna lista de todos os municípios com código e nome para o filtro.

**Resposta:**
```json
{
  "municipalities": [
    { "code": "355030", "name": "SAO PAULO" },
    { "code": "310620", "name": "BELO HORIZONTE" },
    { "code": "330455", "name": "RIO DE JANEIRO" },
    ...
  ]
}
```

## 🏗️ Arquitetura e Decisões Técnicas

### Backend

#### 1. NestJS
Escolhido por sua arquitetura modular, forte tipagem com TypeScript, e suporte nativo a decorators para validação e documentação.

#### 2. Prisma ORM
- Type-safe database client
- Migrations gerenciadas
- Simplifica queries complexas
- Ótima DX (Developer Experience)

#### 3. Schema Simplificado
Em vez de usar todas as 194 colunas do CSV, selecionamos apenas ~21 campos essenciais para os requisitos do desafio:
- Dados de notificação (NU_NOTIFIC, DT_NOTIFIC, SEM_NOT)
- Localização (SG_UF_NOT, CO_MUN_NOT, **ID_MUNICIP**, SG_UF, CO_MUN_RES)
- Demografia (CS_SEXO, NU_IDADE_N, TP_IDADE)
- Hospitalização e UTI (HOSPITAL, DT_INTERNA, UTI, DT_ENTUTI)
- Vacinação COVID (VACINA_COV, DOSE_1_COV, DOSE_2_COV)
- Evolução do caso (EVOLUCAO, DT_EVOLUCA)

**Campos de Município:**
- `municipality` (CO_MUN_NOT): Código IBGE - usado para filtros eficientes
- `municipalityName` (ID_MUNICIP): Nome legível - usado para exibição no gráfico

#### 4. Seed Service Flexível
Suporta tanto dados parciais (desenvolvimento) quanto completos (produção) através da variável de ambiente `USE_FULL_DATA`.

```bash
# Desenvolvimento - usa dados da pasta /docs/datasource/partial
pnpm run seed

# Produção - usa dados da pasta /docs/datasource/full
pnpm run seed:full
```

### Frontend

#### 1. Next.js 15 + App Router
- Server Components para melhor performance
- File-based routing
- Built-in optimizations
- Excelente DX

#### 2. Tailwind CSS 4
- Utility-first CSS
- Design responsivo facilitado
- Customização simples
- Bundle size otimizado

#### 3. Recharts
- Biblioteca declarativa para gráficos React
- Responsiva por padrão com `ResponsiveContainer`
- Fácil customização de cores, tooltips e legendas
- Suporte a múltiplas séries de dados (múltiplas regiões)

#### 4. Componentização
Estrutura modular com componentes reutilizáveis:
- **MetricCard**: Card individual com ícone, valor e contexto
- **MetricsGrid**: Grid responsivo com as 4 métricas
- **ChartFilters**: Controles de filtro dinâmicos (período, agrupamento, região)
  - Dropdown adaptativo: mostra estados OU municípios baseado no agrupamento
  - Validação visual: campo vermelho quando município não selecionado
  - Persistência: mantém última seleção ao alternar entre agrupamentos
- **CasesChart**: Visualização gráfica com Recharts
  - Placeholder informativo quando município não selecionado

### Responsividade

Implementada usando CSS Grid com breakpoints do Tailwind:

**MetricsGrid:**
- **Mobile** (< 768px): 1 coluna
- **Tablet** (768px - 1280px): 2 colunas (grid 2x2)
- **Desktop** (> 1280px): 4 colunas (grid 1x4)

**Gráfico:**
- Usa `ResponsiveContainer` do Recharts
- Ajusta automaticamente largura e altura
- Tooltips e legendas adaptam-se ao espaço disponível
- Rótulos do eixo X rotacionados em telas pequenas

**Filtros:**
- Layout vertical em mobile
- Grid de 3 colunas em desktop

## 🧪 Testes

### Backend

```bash
cd backend

# Testes unitários
pnpm run test

# Testes E2E
pnpm run test:e2e

# Coverage
pnpm run test:cov
```

### Linting

```bash
# Backend
cd backend
pnpm run lint

# Frontend
cd frontend
pnpm run lint
```

## 📦 Build para Produção

### Backend

```bash
cd backend
pnpm run build
pnpm run start:prod
```

### Frontend

```bash
cd frontend
pnpm run build
pnpm run start
```

## 🚢 Deploy

### Docker Deployment (Backend + Database)

A aplicação backend está pronta para deploy com Docker usando multi-stage build otimizado.

#### Usando Docker Compose (Recomendado)

```bash
# Inicia PostgreSQL + Backend em produção
docker-compose up -d

# Verifica logs
docker-compose logs -f backend

# Popula banco com dados completos
docker exec -it srag-backend pnpm run seed:full
```

O `docker-compose.yml` inclui:
- PostgreSQL 15 com health check
- Backend NestJS na porta 3001
- Volume persistente para dados
- Rede compartilhada entre serviços
- Migrations automáticas no startup

#### Build Manual do Docker

```bash
cd backend

# Build da imagem
docker build -t srag-backend .

# Execução
docker run -p 3001:3001 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e PORT=3001 \
  -e NODE_ENV=production \
  -e CORS_ORIGIN=https://seu-frontend.vercel.app \
  srag-backend
```

**Características do Dockerfile:**
- Multi-stage build (deps → builder → runner)
- Usuário não-root (`nestjs:nodejs`) para segurança
- Health check na porta 3001
- Prisma migrations automáticas
- Imagem otimizada com Alpine Linux

### Vercel Deployment (Frontend)

O frontend está otimizado para deploy na Vercel com Next.js 15.

#### Passos para Deploy:

1. **Push para GitHub** (se ainda não feito)

2. **Importar para Vercel:**
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "Import Project"
   - Selecione seu repositório
   - **Importante**: Defina o diretório raiz como `frontend`

3. **Configure Variáveis de Ambiente:**
   ```env
   NEXT_PUBLIC_API_URL=https://seu-backend-domain.com
   ```

4. **Deploy:** Vercel detecta automaticamente Next.js e usa a configuração do `vercel.json`

**Configuração do vercel.json:**
- Framework: Next.js
- Build: `pnpm run build`
- Install: `pnpm install`
- Região: `gru1` (São Paulo - otimizado para usuários brasileiros)

### Plataformas Recomendadas

**Backend + Database:**
- **Railway**: Auto-deploy do GitHub, PostgreSQL gerenciado, suporte Docker
- **Render**: Free tier disponível, suporte Docker, databases gerenciados
- **Fly.io**: Deploy global, Docker-native, extensões PostgreSQL
- **Heroku**: PaaS clássico, PostgreSQL add-on, scaling fácil

**Frontend:**
- **Vercel**: Melhor suporte Next.js, CDN global, previews automáticos ✅
- **Netlify**: Alternativa com bom suporte Next.js
- **Cloudflare Pages**: Opção de edge deployment

**Database (se separado):**
- **Railway PostgreSQL**: Auto-backups, connection pooling
- **Supabase**: Free tier, recursos realtime, auth built-in
- **AWS RDS**: Enterprise-grade, múltiplas regiões
- **Neon**: PostgreSQL serverless, free tier generoso

### Variáveis de Ambiente para Produção

**Backend (.env ou Docker env vars):**
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://seu-frontend.vercel.app
USE_FULL_DATA=true
```

**Frontend (Vercel Environment Variables):**
```env
NEXT_PUBLIC_API_URL=https://seu-backend.railway.app
```

### Checklist Pós-Deploy

**Backend:**
1. ✅ Verificar conexão com banco: logs do Prisma
2. ✅ Popular dados: `docker exec -it srag-backend pnpm run seed:full`
3. ✅ Testar endpoints: `https://seu-backend.com/api/docs`
4. ✅ Monitorar health check: `https://seu-backend.com/` deve retornar 200

**Frontend:**
1. ✅ Testar CORS: backend deve permitir requests do domínio frontend
2. ✅ Verificar conexão API: console do browser sem erros de rede
3. ✅ Testar todas features: métricas, gráficos, filtros, agrupamento
4. ✅ Validar responsividade: mobile, tablet, desktop

**Segurança:**
1. ✅ CORS_ORIGIN definido para domínio frontend (não `*`)
2. ✅ Backend rodando como usuário não-root no Docker
3. ✅ Credenciais do banco não expostas
4. ✅ HTTPS habilitado em frontend e backend

## 📚 Fonte de Dados

- **Dataset**: OpenDataSUS - SRAG 2019-2025
- **Link**: https://opendatasus.saude.gov.br/dataset/srag-2021-a-2024
- **Dicionário de Dados**: `/docs/dicionario-de-dados-2019-a-2025.pdf`

## ✅ Requisitos Atendidos

- ✅ Dashboard com 4 métricas principais
- ✅ Visualização gráfica com filtros
- ✅ Filtro por período (diário, mensal, anual)
- ✅ Agrupamento por região (estado, município)
- ✅ Design totalmente responsivo
- ✅ Consumo de dados do OpenDataSUS
- ✅ Backend robusto com NestJS
- ✅ Frontend moderno com Next.js
- ✅ Documentação completa com Swagger

## 🤝 Contribuindo

Este é um projeto de desafio técnico. Para sugestões ou melhorias, abra uma issue.

## 📄 Licença

UNLICENSED - Projeto educacional
