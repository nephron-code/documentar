<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# NefroDoc — Guia de Agentes

**Copiloto determinístico de consulta em Nefrologia ambulatorial.**
O NefroDoc organiza dados clínicos, aplica regras nefrológicas determinísticas e gera uma nota revisável para colar no prontuário externo que o médico já usa. Não é um prontuário eletrônico completo. Não decide pelo médico. Não usa LLM para gerar texto clínico.

Stack: Next.js 16 (App Router) · TypeScript strict · Tailwind CSS · Prisma 7 · PostgreSQL (Supabase)

> **Regra de framing:** agentes nunca devem descrever o NefroDoc como "prontuário eletrônico". Usar "copiloto de consulta", "apoio à consulta nefrológica" ou "nota pronta para colar no prontuário externo". O app menciona "prontuário" apenas como destino externo do texto gerado.

---

## Regras globais (todos os agentes)

- **Zero LLM no código da aplicação.** Textos clínicos gerados por template literals puros — nunca chamar APIs de IA dentro do app.
- **TypeScript strict.** Sem `any` salvo em cast de enum do Prisma (`as any`).
- **Server Components por padrão.** Client Components (`'use client'`) apenas onde há estado ou interatividade.
- **Nomes completos nos pedidos de exame.** Nunca abreviaturas nas listas de exames para o paciente.
- **Sumário de urina** — regionalismo adotado; nunca "EAS" ou "urina tipo 1" nos pedidos.
- Antes de criar qualquer arquivo novo, verificar se já existe algo semelhante.
- Commits atômicos: uma responsabilidade por commit.

---

## Agente DB — Banco de Dados & Acesso a Dados

**Responsabilidade:** schema Prisma, migrations, Server Actions, queries.

**Arquivos sob sua responsabilidade:**
- `prisma/schema.prisma`
- `prisma/migrations/**`
- `prisma.config.ts`
- `src/lib/prisma.ts`
- `src/lib/actions/*.ts`

**Regras específicas:**
- Sempre usar `prisma migrate dev --name <descricao>` para mudanças de schema. Nunca `db push` em produção.
- `DATABASE_URL` (porta 6543, pooler) para runtime. `DIRECT_URL` (porta 5432) para migrations via `prisma.config.ts`.
- Campos opcionais no schema devem ser `String?` — nunca string vazia no banco.
- Server Actions ficam em `src/lib/actions/patients.ts` (ou arquivo específico por domínio).
- Toda Server Action começa com `'use server'` e valida os inputs antes de gravar.
- `LabResult` usa `examDate` independente da data da consulta — nunca vincular ao `evolutionId`.
- Ao adicionar campo novo no schema, sempre atualizar também a Server Action correspondente.

**Modelos atuais:**
- `Patient` — dados demográficos, diagnóstico, comorbidades
- `Evolution` — consulta clínica (chiefComplaint, bloodPressure, weight, clinicalNote, conductText, imagingResults)
- `LabResult` — um registro por tipo de exame, com `examDate` própria

---

## Agente UI — Interface & Componentes

**Responsabilidade:** páginas Next.js, componentes React, formulários, estilos Tailwind.

**Arquivos sob sua responsabilidade:**
- `src/app/**/*.tsx` (páginas e layouts)
- `src/components/**/*.tsx`

**Regras específicas:**
- Inputs sempre com `text-gray-900 bg-white` e `placeholder="..."` válido — nunca `placeholder-gray-400="..."`.
- Formulários longos divididos em `<section>` com borda e padding padrão:
  `className="bg-white border border-gray-200 rounded-lg p-6 space-y-4"`
- Classe padrão de input:
  `"w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"`
- Botão primário: `bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 rounded-lg`
- Labels de estágio CKD usam badges coloridos por estágio (G1=verde … G5=vermelho, G5D=roxo).
- Separar componentes visuais puros (sem lógica de dados) dos que chamam Server Actions.
- Nunca usar `localStorage` para dados clínicos — persistência sempre via banco.

**Estrutura de páginas:**
```
/patients                          → lista de pacientes
/patients/new                      → cadastro de novo paciente
/patients/[id]                     → perfil + histórico
/patients/[id]/evolution/new       → nova consulta
/patients/[id]/evolution/[eid]     → visualização de consulta
```

---

## Agente Clinical — Lógica Médica & Diretrizes

**Responsabilidade:** motores de regras clínicas, calculadoras, painéis de exames, geração de texto.

**Arquivos sob sua responsabilidade:**
- `src/lib/kdigo.ts`
- `src/lib/examPanels.ts`
- `src/lib/generateEHRText.ts`
- `src/components/KdigoAlert.tsx`
- `src/components/ExamOrderPanel.tsx`

**Regras específicas:**
- Toda lógica clínica é **determinística e estática** — sem chamadas a APIs externas.
- Diretrizes de referência: KDIGO 2026 (DRC), ADA 2024 (diabetes), ACC/AHA 2019 + SBC 2020 (lipídeos), AUA/EAU 2023 (litíase), KDIGO GN 2021 (glomerulopatia).
- `getKdigoRecommendations(tfg, acr)` — classificação G1–G5 × A1–A3, matriz de risco, painel de exames.
- Gasometria venosa é **opcional** (toggle no KdigoAlert) — não incluir por padrão.
- Pacotes de exames em `EXAM_PACKAGES` — organizados por frequência clínica, não por diagnóstico.
- `generateEHRText` produz saída compacta: uma linha por data de exame com abreviaturas (`Cr`, `Ur`, `TFG`, `K`, etc.) — apenas para a nota de consulta que o médico cola no prontuário externo, nunca para pedidos ao paciente.
- Pedidos de exame ao paciente: nomes completos, sem abreviaturas, sem símbolos de marcação.

**Pacotes de exames disponíveis:**
| Chave | Frequência |
|-------|-----------|
| `rotina` | Cada consulta |
| `semestral` | + Lipidograma |
| `trimestral_dm` | + HbA1c (diabéticos) |
| `semestral_dm` | + HbA1c + Lipidograma |
| `anual_completo` | Painel completo |
| `drc_avancada` | G4–G5, cada consulta |
| `glomerulopatia` | + Sorologias imunológicas |
| `nefrolitiase` | + Urina 24h metabólica |

---

## Fluxo de trabalho entre agentes

```
Agente Clinical  →  define lógica e tipos
Agente DB        →  persiste os dados necessários
Agente UI        →  consome e exibe
```

Mudanças no schema sempre precedem mudanças na UI que dependem delas.
Ao adicionar um campo novo: DB primeiro → Clinical (se relevante) → UI por último.
