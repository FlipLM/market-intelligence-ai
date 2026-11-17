import { NextRequest, NextResponse } from 'next/server';
import { discoverRecentCompaniesFromMinhaReceita } from '@/lib/connectors/openCnpjApi';
import {
  getDiscoveryCursor,
  getRealRecentCompanies,
  setDiscoveryCursor,
  upsertRecentCompaniesBatchWithStats,
} from '@/lib/data/recentCompaniesData';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const uf = typeof body.uf === 'string' && body.uf.trim() ? body.uf.trim().toUpperCase().slice(0, 2) : 'DF';
    const maxAgeDays =
      typeof body.maxAgeDays === 'number' && !Number.isNaN(body.maxAgeDays)
        ? body.maxAgeDays
        : 180;
    const maxPages =
      typeof body.maxPages === 'number' && !Number.isNaN(body.maxPages) ? body.maxPages : 3;
    const maxResults =
      typeof body.maxResults === 'number' && !Number.isNaN(body.maxResults)
        ? body.maxResults
        : 120;
    const cnaeFiscal =
      typeof body.cnaeFiscal === 'string' ? body.cnaeFiscal.replace(/\D/g, '') : '';
    const municipio =
      typeof body.municipio === 'string' ? body.municipio.replace(/\D/g, '') : '';
    const onlyWithPhone = Boolean(body.onlyWithPhone);
    const resetCursor = Boolean(body.resetCursor);

    if (!/^[A-Z]{2}$/.test(uf)) {
      return NextResponse.json(
        { success: false, error: 'UF inválida. Informe uma sigla de estado de 2 letras (ex.: DF, SP).' },
        { status: 400 }
      );
    }

    if (cnaeFiscal && cnaeFiscal.length !== 7) {
      return NextResponse.json(
        { success: false, error: 'CNAE inválido. Informe os 7 dígitos numéricos (ex.: 5611201) ou deixe em branco.' },
        { status: 400 }
      );
    }

    const filterKey = `${uf}:${cnaeFiscal || '*'}:${municipio || '*'}`;
    const savedCursor = resetCursor ? undefined : getDiscoveryCursor(filterKey);
    const existingLeads = getRealRecentCompanies();

    const discovery = await discoverRecentCompaniesFromMinhaReceita({
      uf,
      maxAgeDays,
      maxPages,
      maxResults,
      cnaeFiscal: cnaeFiscal || undefined,
      municipio: municipio || undefined,
      cursor: savedCursor,
      onlyWithPhone,
      existingLeadsInBase: existingLeads,
    });

    if (discovery.pagesFetched === 0 && discovery.warning) {
      const status = discovery.warning.includes('429') ? 429 : 502;
      return NextResponse.json(
        {
          success: false,
          error: discovery.warning,
          datasetCompetencia: discovery.datasetCompetencia,
        },
        { status }
      );
    }

    const persistStats = upsertRecentCompaniesBatchWithStats(discovery.leads);
    setDiscoveryCursor(filterKey, discovery.exhausted ? undefined : discovery.nextCursor);

    return NextResponse.json({
      success: true,
      uf,
      maxAgeDays,
      fetchedCount: discovery.leads.length,
      addedCount: persistStats.addedCount,
      updatedCount: persistStats.updatedCount,
      scannedRows: discovery.scannedRows,
      activeRows: discovery.activeRows,
      matchedRecentRows: discovery.matchedRecentRows,
      pagesFetched: discovery.pagesFetched,
      exhausted: discovery.exhausted,
      datasetCompetencia: discovery.datasetCompetencia,
      warning: discovery.warning,
      filterKey,
      data: discovery.leads,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: 'Utilize POST /api/recent-companies/fetch-new com { uf, maxAgeDays, cnaeFiscal?, onlyWithPhone? } para buscar empresas reais via MinhaReceita.',
    },
    { status: 405 }
  );
}
