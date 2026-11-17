import { NextResponse } from 'next/server';
import { fetchCnpjFromOpenApi } from '@/lib/connectors/openCnpjApi';
import { getRealRecentCompanies, upsertRecentCompany } from '@/lib/data/recentCompaniesData';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cnpj = searchParams.get('cnpj');

    if (!cnpj) {
      return NextResponse.json({ success: false, error: 'Parâmetro cnpj obrigatório.' }, { status: 400 });
    }

    const existing = getRealRecentCompanies();
    const lead = await fetchCnpjFromOpenApi(cnpj, existing);

    if (!lead) {
      return NextResponse.json(
        {
          success: false,
          error: 'CNPJ não encontrado na base pública da Receita Federal ou fora do ar.',
        },
        { status: 404 }
      );
    }

    const saved = upsertRecentCompany(lead);

    return NextResponse.json({
      success: true,
      source: saved.cnpj.fonte,
      data: saved,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cnpj = body.cnpj;

    if (!cnpj) {
      return NextResponse.json({ success: false, error: 'Campo cnpj obrigatório.' }, { status: 400 });
    }

    const existing = getRealRecentCompanies();
    const lead = await fetchCnpjFromOpenApi(cnpj, existing);

    if (!lead) {
      return NextResponse.json(
        {
          success: false,
          error: 'CNPJ não localizado na Receita Federal via APIs abertas.',
        },
        { status: 404 }
      );
    }

    const saved = upsertRecentCompany(lead);

    return NextResponse.json({
      success: true,
      source: saved.cnpj.fonte,
      data: saved,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
