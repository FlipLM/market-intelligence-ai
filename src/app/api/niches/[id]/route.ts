import { NextResponse } from 'next/server';
import { getNicheById, getScoringWeights, saveNiche } from '@/lib/db';
import { aggregateNicheFromCollectedCnpjs } from '@/lib/nicheAggregation';
import { runCommercialViabilityAgent } from '@/lib/agents/commercialViabilityAgent';
import { calculateNicheScore } from '@/lib/scoring';
import { calculateHypotheticalScenario } from '@/lib/simulator';
import { runDecisionAnalystAgent } from '@/lib/agents/decisionAnalystAgent';
import { verificado } from '@/types/provenance';
import { HypotheticalAssumptions } from '@/types/market';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const niche = getNicheById(id);

    if (!niche) {
      return NextResponse.json({ success: false, error: 'Nicho não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: niche });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const niche = getNicheById(id);
    if (!niche) {
      return NextResponse.json({ success: false, error: 'Nicho não encontrado' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const now = new Date().toISOString();

    // 1. Recalcular agregação a partir da base real de CNPJs
    if (body.recalculateFromBase) {
      const primaryCnae = niche.basicInfo.cnaes.valor?.[0] || null;
      const { aggregation, matchedCount, probableDirectContactsCount } =
        aggregateNicheFromCollectedCnpjs({
          cnae: primaryCnae,
          state: niche.basicInfo.geographicScope.state.valor,
          city: niche.basicInfo.geographicScope.city.valor,
        });
      niche.baseAggregation = aggregation;
      const updatedViab = runCommercialViabilityAgent({
        matchedCount,
        probableDirectContactsCount,
        collectedAt: now,
      });
      niche.commercialViability = {
        ...niche.commercialViability,
        totalEligibleCompanies: updatedViab.totalEligibleCompanies,
        accessibleDecisionMakers: updatedViab.accessibleDecisionMakers,
        evidences: [
          ...niche.commercialViability.evidences.filter(
            (e) => !e.id.startsWith('ev-base-cnpjs-')
          ),
          ...updatedViab.evidences,
        ],
      };
    }

    // 2. Registrar evidência manual com fonte citada obrigatória
    if (body.manualEvidence) {
      const { category, value, source, sourceUrl, notes } = body.manualEvidence as {
        category: 'demandScore' | 'marketSaturation' | 'averageCompanyRevenue' | 'averageCpc';
        value: string | number;
        source: string;
        sourceUrl?: string;
        notes?: string;
      };

      if (!source || !source.trim()) {
        return NextResponse.json(
          { success: false, error: 'É obrigatório informar a fonte citada da evidência.' },
          { status: 400 }
        );
      }

      const evItem = {
        id: `ev-manual-${category}-${Date.now()}`,
        source: source.trim(),
        sourceUrl: sourceUrl?.trim() || undefined,
        collectedAt: now,
        status: 'verificado' as const,
        metricName: category,
        value,
        notes: notes?.trim() || 'Evidência manual registrada com fonte citada.',
      };

      if (category === 'demandScore') {
        const num = Number(value);
        if (Number.isNaN(num) || num < 0 || num > 100) {
          return NextResponse.json(
            { success: false, error: 'Score de demanda deve estar entre 0 e 100.' },
            { status: 400 }
          );
        }
        niche.demand.overallDemandScore = verificado({
          valor: num,
          fonte: source.trim(),
          url_ou_api: sourceUrl?.trim() || null,
          consultado_em: now,
        });
        niche.demand.evidences.push(evItem);
      } else if (category === 'marketSaturation') {
        const allowed = ['subatendido', 'moderado', 'saturado', 'dominado_por_legados'] as const;
        if (!allowed.includes(String(value) as (typeof allowed)[number])) {
          return NextResponse.json(
            { success: false, error: 'Valor inválido para saturação de mercado.' },
            { status: 400 }
          );
        }
        niche.competition.marketSaturation = verificado({
          valor: String(value) as (typeof allowed)[number],
          fonte: source.trim(),
          url_ou_api: sourceUrl?.trim() || null,
          consultado_em: now,
        });
        niche.competition.evidences.push(evItem);
      } else if (category === 'averageCompanyRevenue') {
        niche.commercialViability.averageCompanyRevenue = verificado({
          valor: String(value),
          fonte: source.trim(),
          url_ou_api: sourceUrl?.trim() || null,
          consultado_em: now,
        });
        niche.commercialViability.evidences.push(evItem);
      } else if (category === 'averageCpc') {
        const num = Number(value);
        if (Number.isNaN(num) || num < 0) {
          return NextResponse.json(
            { success: false, error: 'CPC médio inválido.' },
            { status: 400 }
          );
        }
        niche.paidTraffic.averageCpc = verificado({
          valor: num,
          fonte: source.trim(),
          url_ou_api: sourceUrl?.trim() || null,
          consultado_em: now,
        });
        niche.paidTraffic.evidences.push(evItem);
      }
    }

    // 3. Atualizar premissas editáveis do simulador hipotético
    if (body.hypotheticalAssumptions) {
      const assumptions = body.hypotheticalAssumptions as HypotheticalAssumptions;
      niche.financialScenarios = [calculateHypotheticalScenario('Personalizado', assumptions)];
    }

    // Recalcula score e decisão com base nas evidências atuais
    const weights = getScoringWeights();
    niche.scoring = calculateNicheScore(
      {
        demand: niche.demand,
        paidTraffic: niche.paidTraffic,
        competition: niche.competition,
        viability: niche.commercialViability,
        opportunities: niche.opportunities,
      },
      weights
    );

    const decision = runDecisionAnalystAgent({
      basicInfo: niche.basicInfo,
      viability: niche.commercialViability,
      scoring: niche.scoring,
    });
    niche.decisionRecommendation = decision.decisionRecommendation;
    niche.recommendedAction = decision.recommendedAction;
    niche.dataSufficiency = decision.dataSufficiency;

    const updated = saveNiche(niche);
    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
