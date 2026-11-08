import { NextResponse } from 'next/server';
import { 
  getRecentCompanies, 
  getRecentCompaniesStats, 
  exportCompaniesToCsv 
} from '@/lib/recentCompaniesService';
import { CompanySector } from '@/types/recentCompanies';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const tempoMaximoParam = searchParams.get('tempoMaximoDias');
    const tempoMaximoDias = tempoMaximoParam ? parseInt(tempoMaximoParam, 10) : undefined;
    const setor = (searchParams.get('setor') as CompanySector) || 'todos';
    const regiao = searchParams.get('regiao') || undefined;
    const busca = searchParams.get('busca') || undefined;
    const porte = searchParams.get('porte') || undefined;
    const ordenarPor = (searchParams.get('ordenarPor') as any) || 'mais_recentes';
    const format = searchParams.get('format');

    const companies = getRecentCompanies({
      tempoMaximoDias,
      setor,
      regiao,
      busca,
      porte,
      ordenarPor,
    });

    // Se solicitado formato CSV para download
    if (format === 'csv') {
      const csv = exportCompaniesToCsv(companies);
      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="empresas_recentes_df.csv"',
        },
      });
    }

    const stats = getRecentCompaniesStats();

    return NextResponse.json({
      success: true,
      count: companies.length,
      stats,
      data: companies,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

