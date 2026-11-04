import { NextResponse } from 'next/server';
import { executeNicheResearch } from '@/lib/agents/orchestrator';

// Catálogo de nichos de alto potencial mapeados por região estratégica
const REGIONAL_OPPORTUNITY_MAP: Record<string, Array<{ nicheQuery: string; segment: string }>> = {
  'DF': [
    {
      nicheQuery: 'Sociedades de Advocacia & Consultorias Tributárias',
      segment: 'Serviços Jurídicos & Regulatórios',
    },
    {
      nicheQuery: 'Clínicas Odontológicas e Estéticas de Alto Padrão',
      segment: 'Saúde, Estética & Cuidados Pessoais',
    },
    {
      nicheQuery: 'Pequenas Construtoras e Reformas Comerciais no DF',
      segment: 'Construção Civil & Engenharia',
    },
    {
      nicheQuery: 'Distribuidoras Atacadistas do SIA e Ceasa-DF',
      segment: 'Comércio Atacadista & Distribuição',
    },
    {
      nicheQuery: 'Oficinas Mecânicas de Frotas e Centros Automotivos no DF',
      segment: 'Serviços Automotivos e Logística',
    }
  ],
  'SP': [
    {
      nicheQuery: 'Clínicas Odontológicas Especializadas',
      segment: 'Saúde e Cuidados Pessoais',
    },
    {
      nicheQuery: 'Pequenas Construtoras e Reformas Comerciais',
      segment: 'Construção Civil & Engenharia',
    },
    {
      nicheQuery: 'Distribuidoras Regionais de Alimentos e Bebidas',
      segment: 'Comércio Atacadista & Distribuição',
    }
  ]
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const state = (body.state || 'DF').toUpperCase();

    const targets = REGIONAL_OPPORTUNITY_MAP[state] || REGIONAL_OPPORTUNITY_MAP['DF'];
    const results = [];

    for (const target of targets) {
      const report = executeNicheResearch({
        nicheQuery: target.nicheQuery,
        segment: target.segment,
        state: state,
        city: state === 'DF' ? 'Brasília' : undefined
      });
      results.push(report);
    }

    // Ordenar pelo score decrescente
    results.sort((a, b) => b.scoring.finalScore - a.scoring.finalScore);

    return NextResponse.json({
      success: true,
      state,
      count: results.length,
      data: results
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

