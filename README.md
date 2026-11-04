# Market Intelligence AI — Plataforma de Inteligência de Mercado para Venda de Software

> Plataforma analítica autônoma baseada em agentes especializados de IA para identificar, pesquisar, auditar e classificar os melhores nichos de mercado para venda de sites, sistemas web, automações e softwares sob demanda no Brasil (com foco prioritário no Distrito Federal).

---

## 🚀 Como Rodar o Projeto (Guia Rápido)

### 1. Pré-requisitos
- **Node.js**: v18 ou superior instalado ([Download Node.js](https://nodejs.org/))
- **Git**

### 2. Clonar o Repositório
```bash
git clone https://github.com/FlipLM/market-intelligence-ai.git
cd market-intelligence-ai
```

### 3. Instalar Dependências
```bash
npm install
```

### 4. Iniciar a Aplicação
```bash
npm run dev
```
*(No Windows, você também pode simplesmente dar um duplo clique no arquivo `iniciar.bat`).*

Acesse no seu navegador:
👉 **[http://localhost:3001](http://localhost:3001)**

---

## ✨ Principais Funcionalidades

1. **Catálogo Top 50+ Nichos Qualificados**:
   - 54 nichos mapeados com dados do IBGE/CEMPRE, volume de empresas no DF e Brasil, CNAEs oficiais e tickets médios.
   - Categorias: *Saúde & Clínicas*, *Automotivo & Frotas*, *Construção & Obras*, *Jurídico & Gestão B2B*, *Atacado & Distribuição*, *Engenharia & Facilities*.

2. **Dashboard Executivo & Filtros**:
   - Leaderboard sem truncamento ordenado por viabilidade e retorno.
   - Tabela responsiva com busca instantânea por dor operacional ou segmento.
   - Projeção de Unit Economics (Setup vs ARR anual).

3. **Arquitetura Multiagente Especializada**:
   - **Agente 1 (Descoberta):** Mapeamento de setores e CNAEs.
   - **Agente 2 (Demanda):** Pesquisas e intenção por software.
   - **Agente 3 (Tráfego Pago):** CPC estimado e concorrência no Google Ads.
   - **Agente 4 (Inteligência Competitiva):** Análise de softwares legados e saturação.
   - **Agente 5 (Oportunidades de Software):** Problemas operacionais reais e soluções digitais sob demanda.
   - **Agente 6 (Viabilidade Comercial):** Universo de empresas, acesso a decisores e pricing.
   - **Agente 7 (Analista de Decisão):** Diagnóstico estratégico com prós e riscos.
   - **Agente 8 (Auditor Técnico / Visão CTO):** Análise de viabilidade técnica, stack recomendada, complexidade de arquitetura e armadilhas a evitar.
   - **Agente 9 (Copywriter & Estrategista B2B):** Cadência de 4 passos no WhatsApp focada em conversão sem parecer invasiva.

4. **Exportação & Download em PDF**:
   - Download direto em PDF com layout A4 executivo pronto para apresentação e tomada de decisão.
   - Modo de impressão limpo via `@media print`.

5. **Integração com o Prospector**:
   - Exportação automática de dados de qualificação em JSON para o robô de prospecção ativa (`G:\Prospector`).

---

## 🛠️ Stack Tecnológica

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **UI & Estilos**: [Tailwind CSS v4](https://tailwindcss.com/) + [Lucide React](https://lucide.dev/)
- **Geração de PDF**: [jsPDF](https://github.com/parallax/jsPDF)
- **Persistência**: Base estruturada persistente (`data/market_intelligence.json`).

---

## 📂 Estrutura de Pastas

```
market-intelligence-ai/
├── data/
│   └── market_intelligence.json  # Base de dados dos 54 nichos qualificados
├── docs/                         # Documentação técnica e arquitetura
├── scripts/                      # Scripts de seed e verificação de integridade
├── src/
│   ├── app/
│   │   ├── api/                  # Endpoints REST (handoff, pesos, descoberta)
│   │   ├── nicho/[id]/           # Dossiê completo do nicho
│   │   ├── pesquisa/             # Pesquisa de nicho sob demanda
│   │   ├── relatorios/           # Visão consolidada para exportação
│   │   └── page.tsx              # Dashboard executivo principal
│   ├── components/               # Componentes de UI, tabelas, PDF e gráficos
│   ├── lib/
│   │   ├── agents/               # Os 9 agentes de inteligência de mercado
│   │   ├── connectors/           # Conectores com IBGE, Google Ads e concorrentes
│   │   ├── data/                 # Catálogo mestre dos nichos
│   │   └── pdfGenerator.ts       # Motor de geração de relatórios A4 em PDF
│   └── types/
│       └── market.ts             # Tipos TypeScript do ecossistema
```
