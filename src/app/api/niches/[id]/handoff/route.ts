import { NextResponse } from 'next/server';
import { getNicheById } from '@/lib/db';
import { buildProspectorHandoff, exportHandoffToProspector } from '@/lib/handoff';

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

    const handoff = buildProspectorHandoff(niche);
    return NextResponse.json({ success: true, data: handoff });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const niche = getNicheById(id);

    if (!niche) {
      return NextResponse.json({ success: false, error: 'Nicho não encontrado' }, { status: 404 });
    }

    const handoff = buildProspectorHandoff(niche);
    const result = exportHandoffToProspector(handoff);

    return NextResponse.json({ 
      success: result.success, 
      message: result.message,
      data: handoff,
      destinationFile: result.destinationFile 
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

