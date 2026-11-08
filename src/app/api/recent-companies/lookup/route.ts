import { NextResponse } from 'next/server';
import { fetchCnpjFromOpenApi } from '@/lib/connectors/openCnpjApi';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cnpj = searchParams.get('cnpj');

    if (!cnpj) {
      return NextResponse.json({ success: false, error: 'Parâmetro cnpj obrigatório.' }, { status: 400 });
    }

    const lead = await fetchCnpjFromOpenApi(cnpj);

    if (!lead) {
      return NextResponse.json({ 
        success: false, 
        error: 'CNPJ não encontrado na base pública da Receita Federal ou fora do ar.' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      source: 'Receita Federal do Brasil via BrasilAPI / MinhaReceita',
      data: lead,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cnpj = body.cnpj;

    if (!cnpj) {
      return NextResponse.json({ success: false, error: 'Campo cnpj obrigatório.' }, { status: 400 });
    }

    const lead = await fetchCnpjFromOpenApi(cnpj);

    if (!lead) {
      return NextResponse.json({ 
        success: false, 
        error: 'CNPJ não localizado na Receita Federal via APIs abertas.' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      source: 'Receita Federal do Brasil via BrasilAPI / MinhaReceita',
      data: lead,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
