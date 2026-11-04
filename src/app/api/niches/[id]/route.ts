import { NextResponse } from 'next/server';
import { getNicheById } from '@/lib/db';
import { initializeDatabaseSeed } from '@/lib/seed';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    initializeDatabaseSeed();
    const { id } = await params;
    const niche = getNicheById(id);

    if (!niche) {
      return NextResponse.json({ success: false, error: 'Nicho não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: niche });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

