import { NextResponse } from 'next/server';
import { getScoringWeights, updateScoringWeights, getNiches, saveNiche } from '@/lib/db';
import { calculateNicheScore } from '@/lib/scoring';
import { ScoringWeights } from '@/types/market';

export async function GET() {
  try {
    const weights = getScoringWeights();
    return NextResponse.json({ success: true, data: weights });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newWeights: ScoringWeights = await request.json();
    updateScoringWeights(newWeights);

    // Recalcular todos os nichos com os novos pesos
    const niches = getNiches();
    for (const niche of niches) {
      niche.scoring = calculateNicheScore({
        demand: niche.demand,
        paidTraffic: niche.paidTraffic,
        competition: niche.competition,
        viability: niche.commercialViability,
        opportunities: niche.opportunities
      }, newWeights);
      saveNiche(niche);
    }

    return NextResponse.json({ success: true, message: 'Pesos atualizados e nichos recalculados com sucesso.', data: newWeights });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

