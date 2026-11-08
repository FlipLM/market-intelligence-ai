import { NextResponse } from 'next/server';
import { getRecentCompanies } from '@/lib/recentCompaniesService';
import { exportRecentCompaniesToProspector } from '@/lib/handoff';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { companyIds, filters } = body;

    let targetCompanies = getRecentCompanies(filters);

    if (Array.isArray(companyIds) && companyIds.length > 0) {
      targetCompanies = targetCompanies.filter(c => companyIds.includes(c.id));
    }

    if (targetCompanies.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Nenhuma empresa selecionada para exportação.' },
        { status: 400 }
      );
    }

    const result = exportRecentCompaniesToProspector(targetCompanies);

    return NextResponse.json({
      success: result.success,
      message: result.message,
      destinationFile: result.destinationFile,
      count: targetCompanies.length,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

