# Market Intelligence AI — Plataforma de Inteligência de Mercado com Proveniência Auditada

> Plataforma analítica em Next.js 16 / TypeScript para qualificação de nichos B2B e auditoria de empresas recentes (CNPJs) com **proveniência explícita e verificável** em todos os dados exibidos, persistidos ou usados em abordagem comercial.

---

## Regra de Ouro (Proveniência Obrigatória)

Nenhum dado, número, percentual, estatística ou afirmação sobre uma empresa ou nicho é exibido, salvo ou usado em mensagem sem origem verificável. Todo campo segue o contrato `ProvenanceField<T>` ([provenance.ts](file:///c:/Users/filip/.gemini/antigravity/scratch/market-intelligence-ai/src/types/provenance.ts)):

```json
{
  "valor": "...",
  "status": "verificado | inferido | desconhecido",
  "fonte": "Nome da fonte ou justificativa",
  "url_ou_api": "https://...",
  "consultado_em": "2026-11-17T14:00:00.000Z",
  "regra": "Opcional: regra determinística quando inferido"
}
```

- **`verificado`**: obtido de fonte oficial/pública consultada em tempo real (`BrasilAPI`, `MinhaReceita`, `IBGE Concla API v2`, `IBGE Localidades API v1`) ou pesquisa manual com fonte citada.
- **`inferido`**: derivado por regra determinística documentada a partir de dados verificados (ex.: `diasCriacao = hoje - data_inicio_atividade`, classificação de `tipoContato`, agregações reais sobre CNPJs coletados).
- **`desconhecido`**: informação não disponível ou ainda não verificada. A UI exibe **"Não verificado"** e nunca preenche com palpites, fallbacks ou `Math.random`.

---

## Como Rodar o Projeto

### 1. Instalar Dependências
```bash
npm install
```

### 2. Iniciar em Desenvolvimento
```bash
npm run dev
```
Acesse **[http://localhost:3001](http://localhost:3001)**.

### 3. Build de Produção
```bash
npm run build
```

### 4. Testes Automatizados de Aceite
```bash
npm test
```
Os testes em [acceptance.test.ts](file:///c:/Users/filip/.gemini/antigravity/scratch/market-intelligence-ai/tests/acceptance.test.ts) falham se:
1. Qualquer campo de empresa ou nicho estiver sem `status` / `fonte` ou usar fallback inventado;
2. Existir `Math.random`, gerador sintético ou import de `__fixtures__/` em produção;
3. A mensagem de abordagem contiver frases proibidas (`"muitos empresários"`, `"acompanho"`, `"gargalo"`, percentuais) ou variável não verificada.

### 5. Teste E2E com 3 CNPJs Reais Recentes do DF
```bash
node --import ./tests/registerAlias.mjs scripts/e2eVerify3Cnpjs.ts
```

---

## Funcionalidades Principais

1. **Radar de Empresas Recém-Abertas (`/empresas-recentes`)**
   - Consulta unitária (`/api/recent-companies/lookup`) e importação em lote de até 50 CNPJs reais (`/api/recent-companies/import`) via **BrasilAPI** / **MinhaReceita** + **IBGE** com cache, controle de rate limit e retry com backoff exponencial.
   - Classificação automática (`inferido`) de contato: `provavel_empresa`, `possivel_contabilidade` (domínio contábil ou telefone/e-mail repetido em múltiplos CNPJs) ou `desconhecido`.
   - `possuiSistema` inicia como `desconhecido` e é confirmado manualmente após conversa comercial (`PATCH /api/recent-companies/[id]`).
   - Badges visíveis por campo (`Verificado` / `Inferido` / `Não verificado`) com tooltip contendo fonte, data da consulta e regra/URL.

2. **Abordagem Manual via WhatsApp (`WhatsAppPitchModal`)**
   - Modelo padrão único sem afirmações de dores, estatísticas ou fase da empresa.
   - Usa `{nome}` apenas quando vem de QSA/titular verificado e não é `possivel_contabilidade`.
   - Bloco "Parabéns pela abertura" habilitado apenas se `dataAbertura` for `verificado`.
   - Limite estrito de **1 follow-up após 4 a 5 dias** e lista **Não Contatar** (`recusou` bloqueia CNPJ e telefones).
   - Envio estritamente manual via `wa.me` após revisão do operador.

3. **Auditoria de Nichos Baseada em Evidência (`/`, `/pesquisa`, `/nicho/[id]`)**
   - Contagens reais sobre os CNPJs coletados por CNAE, UF, município, período (30/90/365 dias), bairro e porte.
   - Critérios sem evidência recebem nota `null` em `scoring.ts`; o score final exibe nível de confiança (`baixa` / `media` / `alta`) pela fração de critérios com evidência.
   - Simulador financeiro rotulado explicitamente como **CENÁRIO HIPOTÉTICO** com premissas editáveis pelo usuário.

---

## Estrutura de Pastas

```text
market-intelligence-ai/
├── __fixtures__/                 # Legado sintético isolado (nunca importado em produção)
├── data/
│   ├── market_intelligence.json  # Nichos auditados + histórico descartado (descartado_sintetico)
│   └── recent_companies.json     # CNPJs reais consultados + lista Não Contatar
├── scripts/
│   ├── migrateData.mjs           # Migração da base legada
│   ├── verifyNiches.ts           # Verificação de schema dos nichos
│   └── e2eVerify3Cnpjs.ts        # Teste E2E ao vivo com 3 CNPJs reais do DF
├── src/
│   ├── app/                      # Páginas App Router e Route Handlers (/api/*)
│   ├── components/               # UI com ProvenanceBadge e simulador editável
│   ├── lib/
│   │   ├── agents/               # Pipeline de nichos com proveniência
│   │   ├── connectors/           # BrasilAPI, MinhaReceita, IBGE, httpClient e classificador
│   │   ├── data/                 # Persistência real em JSON
│   │   ├── outreachMessage.ts    # Modelo único de abordagem e regras de follow-up
│   │   ├── nicheAggregation.ts   # Agregações reais sobre CNPJs coletados
│   │   ├── scoring.ts            # Pontuação ponderada apenas sobre critérios com evidência
│   │   └── simulator.ts          # Simulador hipotético com premissas editáveis
│   └── types/                    # Contratos com ProvenanceField<T>
└── tests/                        # Suíte automatizada de critérios de aceite
```
