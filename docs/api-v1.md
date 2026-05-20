# NefroDoc — API v1

API interna para acesso à biblioteca clínica determinística do NefroDoc.  
Todos os endpoints são **efêmeros**: calculam e retornam sem persistir dados.  
Base URL: `https://<seu-domínio>/api/v1`

---

## Autenticação

Obrigatória em todos os endpoints. Dois mecanismos aceitos:

### Bearer token (Supabase JWT)
```
Authorization: Bearer <jwt-do-supabase>
```
Obtido via `supabase.auth.getSession()` no cliente. Validado em tempo real via `getUser()`.

### API Key estática
```
X-API-Key: <chave>
```
Configurada na variável de ambiente `NEFRODOC_API_KEY` no servidor.  
Indicada para integrações server-to-server.

### Resposta de erro (401)
```json
{
  "error": "Unauthorized",
  "message": "Token inválido ou expirado."
}
```

---

## Endpoints

### POST /api/v1/calc/ckd-epi

Calcula a TFGe pela equação CKD-EPI 2021 (sem fator raça).  
Referência: Inker et al. NEJM 2021;385:1737-1749.

**Request**
```json
{
  "creatinina": 1.8,
  "idade": 65,
  "sexo": "MALE"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| creatinina | number | ✓ | Creatinina sérica em mg/dL (0–50) |
| idade | number | ✓ | Idade em anos (1–120) |
| sexo | "MALE" \| "FEMALE" | ✓ | Sexo biológico |

**Response 200**
```json
{
  "tfge": 38.4,
  "gStage": "G3b",
  "unit": "mL/min/1.73m²",
  "formula": "CKD-EPI 2021 (sem fator raça) — Inker et al. NEJM 2021;385:1737-1749"
}
```

---

### POST /api/v1/kdigo/classify

Classifica o risco KDIGO e retorna recomendações clínicas completas.  
Referência: KDIGO 2024 CKD Guideline.

**Request**
```json
{
  "tfg": 38.4,
  "acr": 250
}
```

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| tfg | number | ✓ | TFGe em mL/min/1.73m² (0–200) |
| acr | number | ✓ | Relação albumina/creatinina em mg/g (0–20000) |

**Response 200**
```json
{
  "stagLabel": "G3bA2",
  "gStage": "G3b",
  "aCategory": "A2",
  "risk": "vermelho",
  "riskLabel": "Risco muito alto",
  "followUpFrequency": "3–4× ao ano",
  "followUpDetail": "Retorno a cada 3–4 meses; rastrear anemia, acidose e DMO.",
  "referralIndicated": true,
  "conductPoints": [
    "IECA ou BRA + iSGLT2 (manter se TFG ≥ 25 mL/min) + finerenona.",
    "..."
  ],
  "examPanel": [
    "Ureia",
    "Creatinina (com TFG estimada por CKD-EPI)",
    "..."
  ],
  "source": "KDIGO 2024 CKD Guideline — kdigo.org/..."
}
```

---

### GET /api/v1/exam-packages

Lista todos os pacotes de exames disponíveis.

**Response 200**
```json
{
  "packages": [
    {
      "key": "rotina",
      "label": "Rotina — consulta de seguimento",
      "description": "Cada consulta — função renal, eletrólitos, proteinúria...",
      "exams": ["Ureia", "Creatinina (com TFG estimada por CKD-EPI)", "..."]
    },
    { "key": "semestral", "..." },
    { "key": "drc_avancada", "..." }
  ]
}
```

Pacotes disponíveis: `rotina`, `semestral`, `trimestral_dm`, `semestral_dm`, `anual_completo`, `drc_avancada`, `glomerulopatia`, `nefrolitiase`.

---

### POST /api/v1/exam-packages/recommend

Recomenda pacotes de exames com base no diagnóstico e estágio CKD.

**Request**
```json
{
  "diagnosisKey": "NEFROPATIA_DIABETICA",
  "ckdStage": "G3a"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| diagnosisKey | string | ✓ | Ver valores aceitos abaixo |
| ckdStage | string \| null | — | "G1"–"G5" ou null |

Valores aceitos para `diagnosisKey`:  
`DRC`, `HAS_NEFROSCLEROSE`, `NEFROPATIA_DIABETICA`, `GLOMERULOPATIA`, `NEFROLITIASE`, `CONSULTA_GERAL`, `HAS_RESISTENTE`

**Response 200**
```json
{
  "recommended": [
    { "key": "rotina", "label": "...", "exams": ["..."] },
    { "key": "semestral_dm", "label": "...", "exams": ["..."] }
  ]
}
```

---

### POST /api/v1/macros/expand

Expande todas as macros taquigráficas presentes em um texto.  
As macros são prefixadas por `.` e seguidas de espaço.

**Request**
```json
{
  "text": "Paciente em retorno semestral. .ret Mantendo esquema atual."
}
```

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| text | string | ✓ | Texto a expandir (máx. 50.000 chars) |

**Response 200**
```json
{
  "expanded": "Paciente em retorno semestral. Retorno em consulta de seguimento nefrológico. Mantendo esquema atual.",
  "macrosFound": ["ret"]
}
```

---

### POST /api/v1/notes/compose

Gera uma nota de consulta pronta para colar no prontuário externo.  
Motor completamente determinístico — zero LLM.

**Request**
```json
{
  "patient": {
    "name": "João da Silva",
    "birthDate": "1958-07-15",
    "sex": "MALE",
    "diagnosis": "NEFROPATIA_DIABETICA",
    "ckdStage": "G3b",
    "albuminuria": "A2",
    "comorbidities": ["DM2", "HAS"],
    "medications": [
      { "name": "Dapagliflozina", "dose": "10mg", "frequency": "1x/dia" }
    ],
    "etiology": "Nefropatia diabética"
  },
  "evolution": {
    "consultationDate": "2026-05-20",
    "bloodPressure": "138/84",
    "weight": 82.5,
    "chiefComplaint": "Retorno semestral. Sem queixas agudas.",
    "clinicalNote": "DRC G3b estável. Boa adesão.",
    "conductText": "Manter iSGLT2. Retorno em 3 meses."
  },
  "labResults": [
    { "examType": "creatinina", "value": 2.1, "unit": "mg/dL", "examDate": "2026-05-10" },
    { "examType": "tfg",        "value": 34,  "unit": "mL/min", "examDate": "2026-05-10" },
    { "examType": "potassio",   "value": 4.8, "unit": "mEq/L",  "examDate": "2026-05-10" }
  ]
}
```

**Campos obrigatórios:** `patient.name`, `patient.birthDate`, `patient.sex`, `patient.diagnosis`, `evolution.consultationDate`.

**Response 200**
```json
{
  "note": "NefroDoc — Nota de Consulta\n65a M — Nefropatia Diabética...",
  "compact": "João da Silva (65a M) · Nefropatia Diabética G3b/A2 · Cr 2.1 TFGe 34 K 4.8"
}
```

---

## Códigos de erro

| Status | Significado |
|---|---|
| 200 | Sucesso |
| 400 | Payload inválido — ver campo `message` para detalhe |
| 401 | Não autenticado ou token inválido |
| 405 | Método HTTP não suportado |

---

## Variáveis de ambiente relevantes

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase (obrigatório para Bearer auth) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon do Supabase (obrigatório para Bearer auth) |
| `NEFRODOC_API_KEY` | Chave estática para autenticação server-to-server (opcional) |

---

## Notas de implementação

- Todos os endpoints residem em `src/app/api/v1/` (Next.js App Router Route Handlers).
- A biblioteca clínica fica em `src/lib/clinical/` — zero dependências de Next.js, Prisma ou React.
- O middleware (`src/middleware.ts`) deixa `/api/v1/*` passar sem redirecionar para `/login`.
- Nenhum endpoint da API v1 lê ou escreve no banco de dados.
