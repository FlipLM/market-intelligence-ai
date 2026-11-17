# Relatório Final — Refatoração para Proveniência Auditada (Market Intelligence AI)

**Data:** 17/11/2026  
**Commits por fase:**
- Fase 1 (Diagnóstico): `b6d17bf` — [AUDITORIA_DIAGNOSTICO.md](file:///c:/Users/filip/.gemini/antigravity/scratch/market-intelligence-ai/AUDITORIA_DIAGNOSTICO.md)
- Fase 2 (Modelo de proveniência & migração): `3c37c1b`
- Fase 3 (Auditoria real de CNPJ + IBGE): `62a654d`
- Fase 4 (Auditoria de nichos baseada em evidência): `74fe76d`
- Fase 5 (Abordagem manual WhatsApp): `28b8898`
- Fase 6 (Qualidade, badges na UI, E2E e documentação): commit final desta entrega

---

## 1. O que foi removido

1. **Geradores sintéticos e auto-seed em produção:**
   - `recentCompaniesMasterGenerator.ts` (PRNG Mulberry32 gerando 5.200+ empresas fictícias) e `top50Niches.ts` movidos para `__fixtures__/` e excluídos do `tsconfig.json`.
   - Removidos `src/lib/data/recentCompaniesPool.ts`, `src/lib/seed.ts`, `scripts/runSeed.ts` e `src/components/AutoDiscoverDfButton.tsx`.
   - Desativados (HTTP `410`) os endpoints `/api/recent-companies/fetch-new` e `/api/niches/discover-region`.
   - Migrados os **55 nichos sintéticos** de `data/market_intelligence.json` para `discardedSynthetic` com `recordStatus: 'descartado_sintetico'`.
2. **Fallbacks e métricas fabricadas:**
   - Removidos de `openCnpjApi.ts` os fallbacks falsos (`61981001234`, `contato@empresa.com.br`, `capital_social: 50000`, `70000-000`, `Sócio-Administrador`, `temWhatsappVerificado: true`).
   - Removidas todas as probabilidades de `"chance sem sistema"` (`98/93/86/74%` / `scoreSemSistema`), estágios com texto de caos, dores genéricas por CNAE e faixas de setup/mensalidade inventadas.
   - Removidos os dados hardcoded com falso `origin: 'observado'` de `ibge.ts`, `trends.ts`, `googleAds.ts`, `competitors.ts` e `softwareOpportunityAgent.ts`.
   - Removidos do `WhatsAppPitchModal` e `outreachCopywriterAgent.ts` a cadência de 4 mensagens, frases proibidas (`"muitos empresários"`, `"acompanho"`, `"gargalo"`, percentuais) e promessas sem fonte.

---

## 2. O que virou `desconhecido` (exibido como "Não verificado")

- **Na ficha de empresa (`RecentCompanyLead`):**
  - `possuiSistema`: sempre `desconhecido` até confirmação manual na conversa comercial.
  - Qualquer campo ausente ou falho na BrasilAPI/MinhaReceita/IBGE (`email`, `ddd_telefone_1`, `ddd_telefone_2`, `capitalSocial`, `qsa` em não-MEI/EI, `bairro`, `complemento`, `codigoIbgeMunicipio`) passa a `status: 'desconhecido'`, `valor: null`.
  - `tipoContato`: vira `desconhecido` quando o cadastro tem apenas telefone/webmail genérico sem repetição nem correspondência nominal com a empresa/titular.
- **No dossiê de nicho (`NicheReport`):**
  - Demanda (`overallDemandScore`, volumes, termos em alta, sazonalidade), tráfego pago (`averageCpc`, concorrência, dificuldade), competição (`marketSaturation`, `mainCompetitors`) e viabilidade comercial (`averageCompanyRevenue`, `recommendedPricing`, `estimatedSalesCycleDays`, `regulatoryRisks`) ficam `desconhecido` ("Não verificado: requer pesquisa manual") até que uma evidência com fonte citada e URL seja registrada.
  - Em `scoring.ts`, critérios sem evidência recebem `rawScore: null`, e o `finalScore` fica `null` quando não há nenhum critério com evidência.

---

## 3. O que ainda exige verificação manual (ou coleta externa pelo operador)

1. **Listagem inicial de CNPJs recentes do DF:** as APIs públicas gratuitas (`BrasilAPI` e `MinhaReceita`) consultam **um CNPJ específico por vez** (não listam empresas recém-abertas por UF/data). O operador precisa informar/importar os CNPJs reais (via consulta unitária ou importação em lote de até 50 CNPJs por vez no modal, a partir de listas exportadas dos Dados Abertos da Receita Federal / Compras.gov.br / JUCIS-DF).
2. **Validação de WhatsApp e titularidade do telefone:** o telefone retornado pela Receita Federal é verificado apenas como *"consta no cadastro público"*; confirmar se atende no WhatsApp e se pertence ao sócio (não à contabilidade) exige verificação humana.
3. **Confirmação de uso de sistema (`possuiSistema`):** deve ser preenchida manualmente no dossiê da empresa após a conversa comercial.
4. **Pesquisa de demanda, concorrência e ticket de mercado:** deve ser pesquisada manualmente (Google Ads, entrevistas, concorrentes reais) e registrada com fonte/URL no painel do nicho.
5. **Premissas do simulador financeiro:** continuam sendo entradas hipotéticas editáveis pelo usuário.
6. **Envio de mensagens no WhatsApp:** permanece estritamente manual (o usuário revisa o texto e clica em enviar no WhatsApp Web/App).
