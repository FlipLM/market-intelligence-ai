# Arquitetura dos 9 Agentes Especializados — Market Intelligence AI

Cada agente é um módulo desacoplado com responsabilidade única, gerando evidências auditáveis e entradas para os agentes seguintes:

## 1. Agente 1 — Descoberta de Nichos (`nicheDiscoveryAgent.ts`)
- **Responsabilidade**: Mapear subsetores, códigos CNAE correspondentes e universo de empresas registradas na localidade informada.
- **Fontes Utilizadas**: Dados consolidados do CEMPRE/IBGE, RAIS e tabelas de CNAE oficial do IBGE Concla.
- **Saída**: Objeto `NicheBasicInfo` contendo identificador único, segmento, CNAEs vigentes e escopo geográfico.

## 2. Agente 2 — Inteligência de Demanda (`demandIntelligenceAgent.ts`)
- **Responsabilidade**: Isolar a demanda pelo serviço final (ex: pacientes buscando dentistas) da **demanda real por softwares e automações** de gestão.
- **Fontes Utilizadas**: Google Trends (Brasil), Google Search Console e SERP Analytics.
- **Saída**: Termos em ascensão, categorização de intenção (comercial, informacional, tecnológica) e nível de urgência de digitalização.

## 3. Agente 3 — Inteligência de Tráfego Pago (`paidTrafficAgent.ts`)
- **Responsabilidade**: Aferir a competitividade do leilão publicitário, faixa de CPC e estratégias de aquisição ativas no país.
- **Fontes Utilizadas**: Google Ads Keyword Planner, Google Ads Transparency Center e Meta Ad Library.
- **Saída**: Faixa de CPC em BRL, volume estimado de concorrentes anunciando no nicho e ganchos comerciais de alta conversão.

## 4. Agente 4 — Inteligência Competitiva (`competitiveIntelligenceAgent.ts`)
- **Responsabilidade**: Catalogar softwares SaaS líderes, ERPs legados e controles manuais via planilhas, mapeando insatisfações e pontos cegos.
- **Fontes Utilizadas**: Avaliações em portais corporativos, Reclame Aqui e fóruns setoriais.
- **Saída**: Mapeamento de concorrentes, falhas recorrentes (ex: lentidão, suporte demorado) e ângulo de ataque para diferenciação.

## 5. Agente 5 — Oportunidades de Software & Dores Operacionais (`softwareOpportunityAgent.ts`)
- **Responsabilidade**: Traduzir gargalos operacionais específicos do setor em produtos e automações vendáveis de software.
- **Saída**: Lista estruturada contendo:
  - Gargalo Operacional Observado
  - Evidência Documentada
  - Solução Digital Proposta
  - Benefício Mensurável (tempo/dinheiro)
  - Hipótese de Disposição a Pagar
  - Dias de Desenvolvimento para MVP (10 a 25 dias)

## 6. Agente 6 — Viabilidade Comercial (`commercialViabilityAgent.ts`)
- **Responsabilidade**: Avaliar acessibilidade dos decisores (proprietários/sócios), capacidade de pagamento e modelo de monetização (Setup + MRR).
- **Saída**: Preço recomendado de implantação, faixa de mensalidade sugerida, potencial de recorrência e ciclo médio de vendas em dias.

## 7. Agente 7 — Analista de Decisão & Síntese (`decisionAnalystAgent.ts`)
- **Responsabilidade**: Consolidar todos os relatórios, produzir os blocos obrigatórios **"Por que entrar neste nicho?"** e **"Por que NÃO entrar neste nicho?"**, e emitir a recomendação de ação final (`avancar_imediatamente`, `testar_com_piloto`, `monitorar`, `descartar`).

## 8. Agente 8 — Auditor Técnico de TI & Engenharia de Software (`techAuditorAgent.ts`)
- **Responsabilidade**: Avaliar o nicho sob a perspectiva de um Engenheiro de Software / CTO sênior.
- **Pergunta Central**: *"Vale a pena construir e manter esse software ou vai virar um pesadelo de suporte e retrabalho?"*
- **Saídas**:
  - Veredito Técnico de Viabilidade (`Altamente Viável`, `Viável com Escopo Fechado`, `Risco de Suporte`, `Não Recomendado`)
  - Score de Esforço de Dev vs. ROI Financeiro (0-100)
  - Complexidade de Arquitetura e % Estimado de Reutilização de Código entre Clientes
  - Stack Tecnológica Recomendada (Frontend, Backend, DB, Auth e Integrações)
  - Armadilhas Técnicas e Scope Creep a serem rigidamente evitados no contrato

## 9. Agente 9 — Estrategista de Abordagem & Copywriting B2B (`outreachCopywriterAgent.ts`)
- **Responsabilidade**: Criar narrativas magnéticas, textos prontos e briefings comerciais para entrar em contato com os leads gerados pelo Prospector.
- **Saídas**:
  - Briefing do Tomador de Decisão (frustrações diárias e gatilhos de compra)
  - Cadência Completa de WhatsApp em 4 Passos (Dia 1, Follow-up 48h, Demonstração em Vídeo 96h e Breakup) com botão de copiar em 1 clique
  - Script de Ligação / Cold Call (como passar da secretária e pitch de 30 segundos com o sócio)
  - Perguntas Diagnósticas Investigativas (SPIN Selling)
  - Quebra das 3 maiores objeções do nicho com respostas prontas
