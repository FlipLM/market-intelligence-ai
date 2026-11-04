import { NextResponse } from 'next/server';
import { getNiches } from '@/lib/db';
import { executeNicheResearch } from '@/lib/agents/orchestrator';
import { initializeDatabaseSeed } from '@/lib/seed';

export async function GET(request: Request) {
  try {
    initializeDatabaseSeed();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q')?.toLowerCase();
    const segment = searchParams.get('segment');
    const minScore = searchParams.get('minScore');

    let niches = getNiches();

    if (search) {
      niches = niches.filter(n => 
        n.basicInfo.name.toLowerCase().includes(search) || 
        n.basicInfo.segment.toLowerCase().includes(search)
      );
    }

    if (segment && segment !== 'all') {
      niches = niches.filter(n => n.basicInfo.segment === segment);
    }

    if (minScore) {
      const min = parseInt(minScore, 10);
      niches = niches.filter(n => n.scoring.finalScore >= min);
    }

    // Ordenar pelo score final decrescente
    niches.sort((a, b) => b.scoring.finalScore - a.scoring.finalScore);

    return NextResponse.json({ success: true, count: niches.length, data: niches });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nicheQuery, segment, state, city } = body;

    if (!nicheQuery || typeof nicheQuery !== 'string' || !nicheQuery.trim()) {
      return NextResponse.json({ success: false, error: 'O termo ou nome do nicho é obrigatório.' }, { status: 400 });
    }

    const report = executeNicheResearch({
      nicheQuery: nicheQuery.trim(),
      segment,
      state,
      city
    });

    return NextResponse.json({ success: true, data: report });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

