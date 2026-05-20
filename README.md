# NefroDoc

**Copiloto determinístico de consulta em Nefrologia ambulatorial**

NefroDoc é uma ferramenta de apoio à consulta nefrológica. Ela organiza dados clínicos, aplica regras das diretrizes KDIGO de forma determinística e gera uma nota revisável para colar no prontuário que o médico já utiliza.

> **O NefroDoc não é um prontuário eletrônico.** Não substitui o sistema oficial de documentação, não contém trilha jurídico-documental completa e não decide pelo médico. É um atalho de consulta: o médico usa, revisa e cola o texto onde quiser.

**Zero IA externa.** Todo texto gerado é produzido por template literals e regras determinísticas — previsível, auditável e sem risco de alucinação.

---

## Funcionalidades

- **Cadastro e gestão de pacientes** com diagnóstico, etiologia e comorbidades
- **Evolução clínica (SOAP)** com gerador automático de nota revisável para colar no prontuário externo
- **Calculadora de TFGe** inline (CKD-EPI 2021) com estadiamento automático CKD G1–G5D × A1–A3
- **Motor clínico KDIGO** — matriz de risco, conduta por estágio, frequência de retorno sugerida
- **Rastreamento longitudinal de exames** com datas independentes da consulta
- **Prescritor de pedidos de exame** com pacotes dinâmicos baseados no estágio CKD
- **Macros taquigráficas** (ex: `.drc` → template completo) para acelerar a digitação
- **Autocomplete de medicamentos** com os fármacos mais usados em Nefrologia
- **Autenticação** segura via Supabase Auth (email + senha)

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript (strict) |
| Estilização | Tailwind CSS |
| Banco de dados | PostgreSQL via Supabase |
| ORM | Prisma 7 |
| Autenticação | Supabase Auth + `@supabase/ssr` |
| Deploy | Vercel |

---

## Rodando localmente

### Pré-requisitos

- Node.js 20+
- Uma instância do Supabase (gratuita em [supabase.com](https://supabase.com))
- Um banco PostgreSQL acessível pelo Prisma

### Instalação

```bash
git clone https://github.com/nephron-code/documentar
cd documentar
npm install
```

### Variáveis de ambiente

Crie um arquivo `.env` na raiz com:

```env
# Banco de dados
DATABASE_URL="postgresql://..."        # Supabase pooler (porta 6543)
DIRECT_URL="postgresql://..."          # Conexão direta para migrations (porta 5432)

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL="https://<seu-projeto>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<sua-anon-key>"
```

### Banco de dados

```bash
npx prisma generate
npx prisma migrate deploy
```

### Servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## Arquitetura

```
src/
├── app/                    # Páginas (App Router)
│   ├── page.tsx            # Splash / landing
│   ├── login/              # Autenticação
│   └── patients/           # Área protegida
│       ├── [id]/           # Perfil do paciente
│       └── [id]/evolution/ # Consultas
├── components/             # Componentes React
│   ├── KdigoAlert.tsx      # Motor KDIGO + alertas visuais
│   └── ExamOrderPanel.tsx  # Prescritor de exames
└── lib/
    ├── kdigo.ts            # Diretrizes KDIGO 2024 (determinístico)
    ├── generateEHRText.ts  # Gerador de texto para prontuário
    ├── macros.ts           # Expansão de macros taquigráficas
    └── actions/            # Server Actions (Prisma)
```

### Princípio fundamental

> **Zero IA no código da aplicação.** Todo texto clínico gerado é 100% determinístico — template literals puros, sem chamadas a APIs de LLM. Isso garante previsibilidade e conformidade em ambiente médico.

---

## Diretrizes clínicas implementadas

| Diretriz | Aplicação |
|----------|-----------|
| KDIGO 2024 (DRC) | Estadiamento, matriz de risco, conduta, frequência de retorno |
| ADA 2024 | Metas glicêmicas e rastreio de complicações renais |
| ACC/AHA + SBC | Metas lipídicas por risco cardiovascular |

---

## Deploy

O projeto está configurado para deploy contínuo na Vercel a partir da branch `main`.

Configure as variáveis de ambiente no painel da Vercel em **Settings → Environment Variables** e adicione no Supabase em **Authentication → URL Configuration** a URL de produção como Site URL e Redirect URL.
