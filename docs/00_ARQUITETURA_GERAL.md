# Arquitetura Geral — Market Intelligence AI

## 1. Visão do Sistema
O **Market Intelligence AI** é uma plataforma analítica autônoma focada na qualificação prévia de nichos de mercado para empresas de desenvolvimento de software, automações, sites e soluções digitais sob demanda.

O sistema atua antes da prospecção de leads, respondendo com base em evidências verificáveis:
1. Quais nichos possuem dores operacionais críticas passíveis de automação?
2. Onde há demanda real por tecnologia (diferenciando de demanda pelo serviço final)?
3. Qual a maturidade digital e o comportamento de tráfego pago dos concorrentes?
4. Quais são as objeções, riscos e argumentos de fechamento?
5. Como transferir essa inteligência para a ferramenta de prospecção existente (`G:\Prospector`)?

## 2. Camadas da Aplicação
- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide React, Recharts.
- **Backend / Engine**: Next.js Server Components e Route Handlers (`/api/...`).
- **Orquestração Multiagente**: 7 Agentes especializados executando com rastreamento de premissas, evidências e confiança.
- **Persistência**: Base estruturada persistente (`src/lib/db.ts` / `data/market_intelligence.json`) com histórico de pesquisas e feedback comercial.
- **Integração Externa**: Conectores para IBGE, Google Trends, Meta Ad Library, Google Ads Transparency, BrasilAPI/CNPJ e Hand-off para `G:\Prospector`.

