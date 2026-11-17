import { NextResponse } from 'next/server';
import { updateRecentCompanyManualFields } from '@/lib/data/recentCompaniesData';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const updated = updateRecentCompanyManualFields(id, {
      possuiSistema: body.possuiSistema,
      observacaoSistema: body.observacaoSistema,
      statusContato: body.statusContato,
      naoContatar: body.naoContatar,
      motivoBloqueio: body.motivoBloqueio,
      registrarPrimeiroContato: body.registrarPrimeiroContato,
      registrarFollowup: body.registrarFollowup,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Empresa não encontrada na base local.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes('não contatar') || msg.includes('Aguardar') || msg.includes('Limite') ? 400 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
