import type { CommercialViability, DataEvidence } from '@/types/market';
import { desconhecido, inferido } from '@/types/provenance';

export function runCommercialViabilityAgent(params?: {
  matchedCount?: number;
  probableDirectContactsCount?: number;
  collectedAt?: string;
}): CommercialViability {
  const matched = params?.matchedCount ?? 0;
  const directContacts = params?.probableDirectContactsCount ?? 0;
  const now = params?.collectedAt || new Date().toISOString();
  const fonteNaoVerificado = 'Não verificado: requer pesquisa manual ou entrevistas comerciais';

  const evidences: DataEvidence[] = [];
  let totalEligible = desconhecido<number>(
    'Sem base real de CNPJs coletada para este nicho',
    now
  );
  let accessibleDecisionMakers = desconhecido<
    'muito_dificil' | 'moderado' | 'acessivel' | 'direto'
  >(fonteNaoVerificado, now);

  if (matched > 0) {
    totalEligible = inferido({
      valor: matched,
      fonte: 'Contagem real sobre base local (data/recent_companies.json)',
      regra: 'Contagem direta de CNPJs reais coletados compatíveis com o CNAE/região',
      consultado_em: now,
    });

    const directRatio = directContacts / matched;
    const accessClass =
      directRatio >= 0.6
        ? 'direto'
        : directRatio >= 0.35
        ? 'acessivel'
        : directRatio > 0
        ? 'moderado'
        : 'muito_dificil';

    accessibleDecisionMakers = inferido({
      valor: accessClass,
      fonte: 'Heurística determinística sobre contatos verificados da base local',
      regra: `Proporção de contatos classificados como provavel_empresa: ${directContacts}/${matched} (${Math.round(directRatio * 100)}%)`,
      consultado_em: now,
    });

    evidences.push({
      id: `ev-base-cnpjs-${Date.now()}`,
      source: 'Base local de CNPJs reais (BrasilAPI/MinhaReceita)',
      collectedAt: now,
      status: 'inferido',
      metricName: 'Empresas reais coletadas e proporção de contato direto provável',
      value: `${matched} empresas (${directContacts} com contato provável da empresa)`,
      notes: 'Agregação determinística exclusiva sobre CNPJs reais coletados na base local.',
    });
  }

  return {
    totalEligibleCompanies: totalEligible,
    accessibleDecisionMakers,
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
    evidences,
  };
}
