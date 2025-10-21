# Deploy no CapRover - Guia Completo

Este guia detalha como fazer o deploy da aplicação SRAG no CapRover.

## 📋 Pré-requisitos

- Acesso ao painel CapRover: `http://captain.cloud.fonchaves.com/`
- CapRover CLI instalado: `npm install -g caprover`
- Git configurado localmente

## 🗄️ Passo 1: Criar Banco de Dados PostgreSQL

### 1.1 Acessar One-Click Apps

1. Faça login no painel do CapRover
2. Vá em **Apps** → **One-Click Apps/Databases**
3. Busque por **PostgreSQL**
4. Clique em **PostgreSQL**

### 1.2 Configurar PostgreSQL

Preencha os campos:

```
App Name: ind-healthcare-db
PostgreSQL Version: 15
PostgreSQL Password: [ESCOLHA UMA SENHA FORTE]
```

Clique em **Deploy** e aguarde a instalação.

### 1.3 Obter String de Conexão

Após o deploy, acesse a app `ind-healthcare-db`:

1. Vá na aba **App Configs**
2. Anote as informações:
   - **Host**: `srv-captain--ind-healthcare-db`
   - **Port**: `5432`
   - **User**: `postgres`
   - **Password**: [a senha que você definiu]
   - **Database**: `postgres`

**String de conexão:**
```
postgresql://postgres:[SUA_SENHA]@srv-captain--ind-healthcare-db:5432/postgres
```

## 🚀 Passo 2: Criar e Configurar a Aplicação Backend

### 2.1 Criar Nova App

1. Vá em **Apps** → clique no botão **Create New App**
2. Preencha:
   ```
   App Name: ind-healthcare-api
   Has Persistent Data: ☐ (não marcar)
   ```
3. Clique em **Create New App**

### 2.2 Configurar Variáveis de Ambiente

Na app `ind-healthcare-api`, vá em **App Configs** → **Environment Variables** e adicione:

```env
DATABASE_URL=postgresql://postgres:[SUA_SENHA]@srv-captain--ind-healthcare-db:5432/postgres
PORT=3001
NODE_ENV=production
CORS_ORIGIN=http://cloud.fonchaves.com
USE_FULL_DATA=true
```

**Importante:**
- Substitua `[SUA_SENHA]` pela senha do PostgreSQL
- Clique em **Add Bulk Environment Variables** para adicionar todas de uma vez
- Clique em **Save & Update**

### 2.3 Habilitar HTTPS (Opcional mas Recomendado)

1. Na seção **HTTP Settings**:
   - Marque ☑ **Enable HTTPS**
   - Marque ☑ **Force HTTPS by redirecting all HTTP traffic to HTTPS**
   - Marque ☑ **Websocket Support** (caso precise no futuro)

2. Clique em **Save & Update**

### 2.4 Configurar Domínio Customizado (Opcional)

Se quiser usar `https://api.cloud.fonchaves.com`:

1. Vá em **HTTP Settings** → **Custom Domains**
2. Adicione: `api.cloud.fonchaves.com`
3. Clique em **Connect New Domain**
4. Marque ☑ **Enable HTTPS**
5. Aguarde o certificado SSL ser gerado

## 📦 Passo 3: Deploy da Aplicação

### 3.1 Preparar Repositório Local

No seu terminal, navegue até a pasta do backend:

```bash
cd /<user_path>/<project_folder>/backend
```

### 3.2 Fazer Login no CapRover CLI

```bash
caprover login
```

Quando solicitado:
- **CapRover URL**: `http://captain.cloud.fonchaves.com`
- **Password**: [sua senha do CapRover]
- **Name**: `fonchaves` (ou qualquer nome para salvar esta configuração)

### 3.3 Deploy via CLI

```bash
caprover deploy
```

Quando solicitado:
- Selecione o servidor: `fonchaves` (ou o nome que você escolheu)
- Selecione a app: `ind-healthcare-api`
- Selecione o branch: `main` (ou o branch atual)

O CapRover irá:
1. ✅ Fazer build da imagem Docker
2. ✅ Executar as migrations do Prisma
3. ✅ Fazer seed automático do banco (primeira vez)
4. ✅ Iniciar a aplicação

### 3.4 Acompanhar o Deploy

**IMPORTANTE:** O CapRover CLI não possui comando de logs. Use o painel web.

**Ver logs de BUILD (durante deploy):**
1. Acesse `http://captain.cloud.fonchaves.com/`
2. Faça login
3. Vá em **Apps** → `ind-healthcare-api`
4. Vá na aba **Deployment**
5. Clique em **View Build Logs**
6. Acompanhe o build em tempo real

**Ver logs da APLICAÇÃO (após deploy):**
1. Na mesma app `ind-healthcare-api`
2. Vá na aba **App Logs**
3. Os logs aparecem em tempo real automaticamente
4. Use o botão **Download Logs** para baixar histórico completo

## ✅ Passo 4: Verificar o Deploy

### 4.1 Verificar Seed

Nos logs da aplicação, você deve ver:

```
🚀 Starting application initialization...
📦 Running database migrations...
🔍 Checking if database needs seeding...
🌱 Database is empty. Running seed with FULL dataset...
[SeedService] Starting to seed database from full dataset...
[SeedService] Found 6 CSV files to process
...
✅ Seed completed successfully!
🎯 Starting NestJS application...
```

### 4.2 Testar Endpoints

Acesse no navegador:

**Health Check:**
```
http://ind-healthcare-api.captain.cloud.fonchaves.com/
ou
https://api.cloud.fonchaves.com/ (se configurou domínio customizado)
```

**Swagger Docs:**
```
http://ind-healthcare-api.captain.cloud.fonchaves.com/api/docs
```

**Métricas:**
```
http://ind-healthcare-api.captain.cloud.fonchaves.com/api/metrics/dashboard
```

### 4.3 Verificar Dados

Teste se os dados foram importados corretamente:

```bash
# Acesse o terminal do PostgreSQL
caprover run -a ind-healthcare-db -- psql -U postgres -d postgres

# Execute query
SELECT COUNT(*) FROM "SragCase";
\q
```

Você deve ver milhares de registros.

## 🔄 Passo 5: Redeploys (Atualizações)

Para fazer redeploy após mudanças no código:

```bash
cd backend
caprover deploy
```

**Nota:** O seed NÃO rodará novamente se o banco já tiver dados.

Para forçar novo seed (CUIDADO: apaga dados existentes):

```bash
# Acesse o terminal do PostgreSQL
caprover run -a ind-healthcare-db -- psql -U postgres -d postgres -c "TRUNCATE TABLE \"SragCase\" CASCADE;"

# Faça redeploy
caprover deploy -a ind-healthcare-api
```

## 🐛 Troubleshooting

### Problema: Build falhou

**Solução:**
1. Verifique os logs de build no painel
2. Certifique-se que o arquivo `captain-definition` existe
3. Verifique se o Dockerfile está correto

### Problema: Migrations falharam

**Solução:**
1. Verifique a `DATABASE_URL` nas variáveis de ambiente
2. Confirme que o PostgreSQL está rodando
3. Teste a conexão:
   ```bash
   caprover run -a ind-healthcare-db -- pg_isready
   ```

### Problema: Seed está demorando muito

**Solução:**
- O seed com dataset completo pode demorar 10-30 minutos
- Acompanhe os logs: `caprover logs -a ind-healthcare-api -f`
- Se travar, reinicie a app no painel

### Problema: CORS errors no frontend

**Solução:**
1. Verifique se `CORS_ORIGIN` está correto
2. Deve ser: `http://cloud.fonchaves.com` (sem /challenges/ind-healthcare)
3. Ou use `*` para permitir todas origens (não recomendado para produção)

### Problema: App reiniciando constantemente

**Solução:**
1. Verifique os logs: `caprover logs -a ind-healthcare-api`
2. Pode ser problema de memória - aumente em **App Configs** → **Instance Count**
3. Ou problema de Health Check - ajuste o timeout

## 📊 Monitoramento

### Verificar Status da App

```bash
caprover list
```

### Ver Logs em Tempo Real

**Via Painel Web (única forma disponível):**

1. Acesse `http://captain.cloud.fonchaves.com/`
2. Faça login
3. Vá em **Apps** → `ind-healthcare-api`
4. Clique na aba **App Logs**
5. Os logs atualizam automaticamente

**Dica:** Use Ctrl+F no navegador para buscar por palavras-chave como "error", "seed", "migration", etc.

### Verificar Uso de Recursos

No painel CapRover:
1. Acesse a app
2. Vá em **Monitoring**
3. Veja CPU, Memória, Network

## 🔐 Segurança

### Recomendações:

1. ✅ Usar HTTPS (já configurado)
2. ✅ Senha forte no PostgreSQL
3. ✅ CORS configurado corretamente
4. ✅ App rodando como usuário não-root (nestjs)
5. ⚠️ Considere restringir acesso ao PostgreSQL apenas para a app backend

### Restringir Acesso ao PostgreSQL:

No painel, vá em `ind-healthcare-db` → **App Configs**:
- Desmarque ☐ **Expose as web-app**
- Isso impede acesso externo ao PostgreSQL

## 📚 Recursos Úteis

- [CapRover Documentation](https://caprover.com/docs/)
- [CapRover CLI](https://github.com/caprover/caprover-cli)
- [NestJS Deployment](https://docs.nestjs.com/deployment)
- [Prisma Production Best Practices](https://www.prisma.io/docs/guides/deployment/deployment-guides)

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs detalhados
2. Consulte a documentação do CapRover
3. Revise as variáveis de ambiente
4. Teste a conexão com o banco de dados

---

**URL da API após deploy:**
- Padrão: `http://ind-healthcare-api.captain.cloud.fonchaves.com`
- Com domínio customizado: `https://api.cloud.fonchaves.com`

**Swagger Docs:**
- `http://ind-healthcare-api.captain.cloud.fonchaves.com/api/docs`
