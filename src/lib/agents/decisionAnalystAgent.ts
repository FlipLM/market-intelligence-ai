import { 
  NicheBasicInfo,
  DemandAnalysis,
  PaidTrafficAnalysis,
  CompetitiveAnalysis,
  SoftwareOpportunity,
  CommercialViability,
  NicheScoreBreakdown,
  NicheReport
} from '@/types/market';

export function runDecisionAnalystAgent(params: {
  basicInfo: NicheBasicInfo;
  demand: DemandAnalysis;
  paidTraffic: PaidTrafficAnalysis;
  competition: CompetitiveAnalysis;
  opportunities: SoftwareOpportunity[];
  viability: CommercialViability;
  scoring: NicheScoreBreakdown;
}): {
  whyEnterArguments: string[];
  whyNotEnterRisks: string[];
  decisionRecommendation: string;
  recommendedAction: NicheReport['recommendedAction'];
  dataSufficiency: NicheReport['dataSufficiency'];
} {
  const { basicInfo, demand, paidTraffic, competition, opportunities, viability, scoring } = params;

  const whyEnterArguments: string[] = [
    `Universo de ${viability.totalEligibleCompanies.toLocaleString('pt-BR')} empresas elegíveis, permitindo prospecção contínua e sem saturação imediata.`,
    `Acesso a decisores classificado como "${viability.accessibleDecisionMakers}", viabilizando prospecção ativa direta via WhatsApp através do Prospector.`,
    `Demanda latente comprovada por modernização com ${opportunities.length} oportunidades críticas de software mapeadas para substituição de planilhas.`,
    `Potencial de monetização híbrida com ticket de setup (R$ ${viability.recommendedPricing.implementationSetupMin} a R$ ${viability.recommendedPricing.implementationSetupMax}) gerando caixa rápido, somado a receita recorrente previsível.`
  ];

  if (paidTraffic.acquisitionDifficulty === 'facil' || paidTraffic.acquisitionDifficulty === 'moderada') {
    whyEnterArguments.push(`Custo por clique e concorrência no Google Ads em patamar favorável (CPC médio de R$ ${paidTraffic.estimatedAverageCpc.toFixed(2)}), facilitando estratégias futuras de atração por tráfego.`);
  }

  const whyNotEnterRisks: string[] = [
    `Inércia cultural e resistência à mudança por parte da equipe operacional acostumada aos processos manuais legados.`,
    `Risco de suporte intensivo nos primeiros 30 dias de implantação se o treinamento inicial dos operadores não for assertivo.`
  ];

  if (viability.regulatoryRisks.length > 0) {
    whyNotEnterRisks.push(`Exigência de atenção a requisitos específicos de conformidade (${viability.regulatoryRisks.join(', ')}).`);
  }

  if (competition.marketSaturation === 'dominado_por_legados') {
    whyNotEnterRisks.push(`Presença de ERPs e sistemas legados já instalados no cliente, demandando estratégia de integração ou substituição baseada em suporte e usabilidade superior.`);
  }

  let recommendedAction: NicheReport['recommendedAction'] = 'testar_com_piloto';
  let recommendationText = '';

  if (scoring.finalScore >= 78) {
    recommendedAction = 'avancar_imediatamente';
    recommendationText = `O nicho de ${basicInfo.name} apresenta combinação de alta dor operacional, acessibilidade direta aos donos e baixa fricção de desenvolvimento. Recomendamos carregar este segmento diretamente no robô do Prospector para campanha de prospecção nos próximos 7 dias.`;
  } else if (scoring.finalScore >= 65) {
    recommendedAction = 'testar_com_piloto';
    recommendationText = `O segmento possui boas métricas financeiras, mas exige validação prévia de oferta. O caminho ideal é rodar um lote piloto de 30 empresas no Prospector ofertando a oportunidade "${opportunities[0]?.title || 'Automação'}" antes de desenvolver a solução completa.`;
  } else if (scoring.finalScore >= 50) {
    recommendedAction = 'monitorar';
    recommendationText = `Nicho viável, porém com barreiras competitivas ou ciclo de vendas mais longo. Recomenda-se priorizar segmentos com maior urgência operacional.`;
  } else {
    recommendedAction = 'descartar';
    recommendationText = `Dados indicam alta saturação ou baixa disposição imediata a pagar por tecnologia personalizada. Não priorizar esforços comerciais neste nicho.`;
  }

  return {
    whyEnterArguments,
    whyNotEnterRisks,
    decisionRecommendation: recommendationText,
    recommendedAction,
    dataSufficiency: 'completa'
  };
}

