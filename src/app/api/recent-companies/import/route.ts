import { NextResponse } from 'next/server';
import { fetchCnpjsBatchFromOpenApi } from '@/lib/connectors/openCnpjApi';
import {
  getRealRecentCompanies,
  upsertRecentCompaniesBatch,
} from '@/lib/data/recentCompaniesData';

const MAX_BATCH_SIZE = 50;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawInput: string[] = Array.isArray(body.cnpjs)
      ? body.cnpjs.map((item: unknown) => String(item))
      : typeof body.text === 'string'
      ? body.text.split(/[\s,;\n\r]+/).filter(Boolean)
      : [];

    if (rawInput.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Envie uma lista de CNPJs válidos para importação.' },
        { status: 400 }
      );
    }

    if (rawInput.length > MAX_BATCH_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `Limite de ${MAX_BATCH_SIZE} CNPJs por lote para respeitar o rate limit das APIs públicas.`,
        },
        { status: 400 }
      );
    }

    const existing = getRealRecentCompanies();
    const { imported, failed } = await fetchCnpjsBatchFromOpenApi(rawInput, existing);

    if (imported.length > 0) {
      upsertRecentCompaniesBatch(imported);
    }

    const updatedStore = getRealRecentCompanies();
    const importedIds = new Set(imported.map((i) => i.id));
    const savedImported = updatedStore.filter((c) => importedIds.has(c.id));

    return NextResponse.json({
      success: true,
      importedCount: savedImported.length,
      failedCount: failed.length,
      failed,
      data: savedImported,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
