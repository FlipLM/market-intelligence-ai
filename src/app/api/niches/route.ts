import { NextResponse } from 'next/server';
import { getNiches } from '@/lib/db';
import { executeNicheResearch } from '@/lib/agents/orchestrator';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q')?.toLowerCase();
    const segment = searchParams.get('segment');
    const minScore = searchParams.get('minScore');

    let niches = getNiches();

    if (search) {
      niches = niches.filter(
        (n) =>
          (n.basicInfo.name.valor || '').toLowerCase().includes(search) ||
          (n.basicInfo.segment.valor || '').toLowerCase().includes(search)
      );
    }

    if (segment && segment !== 'all') {
      niches = niches.filter((n) => n.basicInfo.segment.valor === segment);
    }

    if (minScore) {
      const min = parseInt(minScore, 10);
      niches = niches.filter((n) => (n.scoring.finalScore ?? -1) >= min);
    }

    niches.sort((a, b) => (b.scoring.finalScore ?? -1) - (a.scoring.finalScore ?? -1));

    return NextResponse.json({ success: true, count: niches.length, data: niches });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nicheQuery, segment, state, city, cnae } = body;

    if (!nicheQuery || typeof nicheQuery !== 'string' || !nicheQuery.trim()) {
      return NextResponse.json(
        { success: false, error: 'O termo ou nome do nicho é obrigatório.' },
        { status: 400 }
      );
    }

    const report = executeNicheResearch({
      nicheQuery: nicheQuery.trim(),
      segment,
      state,
      city,
      cnae,
    });

    return NextResponse.json({ success: true, data: report });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
