# Actio Pro — Guia de Configuração

## O que você vai precisar (tudo gratuito)
- Conta no **Supabase** (banco de dados + login): https://supabase.com
- Conta no **GitHub** (para subir o código): https://github.com
- Conta no **Vercel** (para hospedar o app): https://vercel.com

---

## PASSO 1 — Criar projeto no Supabase

1. Acesse https://supabase.com e clique em **Start your project** (pode entrar com Google)
2. Clique em **New project**
3. Preencha:
   - **Name**: actio-pro
   - **Database Password**: anote esta senha (não será usada depois, mas é necessária)
   - **Region**: South America (São Paulo)
4. Clique em **Create new project** e aguarde ~2 minutos

---

## PASSO 2 — Criar as tabelas e importar seus exercícios

1. No painel do Supabase, clique em **SQL Editor** (ícone de código no menu lateral)
2. Clique em **New query**
3. Abra o arquivo `supabase-setup.sql` deste projeto e copie TODO o conteúdo
4. Cole no editor SQL e clique em **Run** (botão verde)
5. Deve aparecer "Success. No rows returned"

> ⚠️ **Importante:** Execute este script DEPOIS de criar sua conta no app (Passo 5),
> pois ele usa seu ID de usuário automaticamente via `auth.uid()`.
> Se executar antes, os dados ficarão sem dono.

---

## PASSO 3 — Pegar as chaves do Supabase

1. No painel do Supabase, vá em **Settings** (engrenagem) → **API**
2. Copie os dois valores:
   - **Project URL**: algo como `https://xyzxyz.supabase.co`
   - **anon public** key: uma chave longa começando com `eyJ...`
3. Guarde esses dois valores — você vai precisar no Passo 5

---

## PASSO 4 — Subir o código no GitHub

1. Acesse https://github.com e crie uma conta (ou faça login)
2. Clique em **New repository** (botão verde ou ícone +)
3. Preencha:
   - **Repository name**: actio-pro
   - Deixe como **Private**
   - NÃO marque "Add README"
4. Clique em **Create repository**
5. Na tela que aparecer, clique em **uploading an existing file**
6. Selecione TODOS os arquivos desta pasta `actio-pro` e arraste para a área de upload
   - Inclua todos os arquivos e a pasta `src/` completa
   - NÃO inclua a pasta `node_modules` (se existir)
7. Clique em **Commit changes**

---

## PASSO 5 — Fazer o deploy no Vercel

1. Acesse https://vercel.com e clique em **Sign Up** (pode entrar com GitHub)
2. Clique em **Add New → Project**
3. Selecione o repositório **actio-pro** que você criou
4. Nas configurações do projeto, expanda **Environment Variables** e adicione:

   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | (o Project URL do Passo 3) |
   | `VITE_SUPABASE_ANON_KEY` | (a anon key do Passo 3) |

5. Clique em **Deploy**
6. Aguarde ~1 minuto. O Vercel vai te dar um link como `actio-pro-abc123.vercel.app`

---

## PASSO 6 — Criar sua conta e importar os dados

1. Abra o link do Vercel no navegador
2. Clique em **Criar conta** e registre com seu e-mail
3. Volte ao **SQL Editor** do Supabase e execute novamente o bloco de dados do `supabase-setup.sql`
   (agora que você está logado, o script vai associar os dados à sua conta)
4. Atualize o app — seus 18 exercícios e o plano Fase I aparecerão automaticamente!

---

## Resultado final

- ✅ App rodando no Vercel (link para sempre, sem custo)
- ✅ Banco de dados no Supabase (plano gratuito suporta até 500 MB e 50.000 requisições/mês — mais que suficiente)
- ✅ Todos os 18 exercícios do Fase I pré-carregados
- ✅ Timer de descanso entre séries de musculação (novo!)
- ✅ Timer de corrida com intervalos (Intervalos, Ritmo, Longão)
- ✅ Estatísticas e insights de corrida
- ✅ Adicionar / editar / remover exercícios

---

## Dúvidas?

Abra o Claude em Cowork e descreva o problema — posso ajudar a diagnosticar qualquer erro de configuração.
