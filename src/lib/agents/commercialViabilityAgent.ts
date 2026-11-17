import { CommercialViability } from '@/types/market';
import { desconhecido, inferido } from '@/types/provenance';

export function runCommercialViabilityAgent(
  collectedCompanyCount?: number,
  collectedAt?: string
): CommercialViability {
  const fonteNaoVerificado = 'Não verificado: requer pesquisa manual ou entrevistas comerciais';
  return {
    totalEligibleCompanies:
      typeof collectedCompanyCount === 'number' && collectedCompanyCount > 0
        ? inferido({
            valor: collectedCompanyCount,
            fonte: 'Contagem real da base local de CNPJs coletados',
            regra: 'Contagem direta de empresas com CNAE correspondente na base local',
            consultado_em: collectedAt || new Date().toISOString(),
          })
        : desconhecido<number>('Sem base real de CNPJs coletada para este nicho'),
    accessibleDecisionMakers: desconhecido(fonteNaoVerificado),
    averageCompanyRevenue: desconhecido(fonteNaoVerificado),
    recommendedPricing: {
      implementationSetupMin: desconhecido(fonteNaoVerificado),
      implementationSetupMax: desconhecido(fonteNaoVerificado),
      monthlyFeeMin: desconhecido(fonteNaoVerificado),
      monthlyFeeMax: desconhecido(fonteNaoVerificado),
    },
    reusabilityPotential: desconhecido(fonteNaoVerificado),
    estimatedSalesCycleDays: desconhecido(fonteNaoVerificado),
    regulatoryRisks: desconhecido(fonteNaoVerificado),
    evidences: [],
  };
}
