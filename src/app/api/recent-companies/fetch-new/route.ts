import { NextRequest, NextResponse } from 'next/server';
import { fetchTopNewestCompanies } from '@/lib/data/recentCompaniesPool';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const existingCnpjs: string[] = Array.isArray(body.existingCnpjs) ? body.existingCnpjs : [];
    const limit = typeof body.limit === 'number' && body.limit > 0 ? body.limit : 100;

    const result = fetchTopNewestCompanies(existingCnpjs, limit);

    return NextResponse.json({
      success: true,
      count: result.newCompanies.length,
      skippedCount: result.skippedCount,
      totalCandidatePool: result.totalCandidatePool,
      limit,
      data: result.newCompanies,
    });
  } catch (err: any) {
    console.error('Erro ao buscar novas empresas do pool:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'Falha interna ao buscar novas empresas.',
        message: err.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const existingParam = searchParams.get('existingCnpjs');
    const existingCnpjs = existingParam ? existingParam.split(',') : [];

    const result = fetchTopNewestCompanies(existingCnpjs, limit);

    return NextResponse.json({
      success: true,
      count: result.newCompanies.length,
      skippedCount: result.skippedCount,
      totalCandidatePool: result.totalCandidatePool,
      limit,
      data: result.newCompanies,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Falha interna ao buscar novas empresas.',
        message: err.message,
      },
      { status: 500 }
    );
  }
}
