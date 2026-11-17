import { NextResponse } from 'next/server';
import { getNicheById } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const niche = getNicheById(id);

    if (!niche) {
      return NextResponse.json({ success: false, error: 'Nicho não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: niche });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
