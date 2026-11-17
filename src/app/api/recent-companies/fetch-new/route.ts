import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error:
        'Gerador sintético removido. Utilize a consulta unitária (/api/recent-companies/lookup) ou importação de lista de CNPJs reais.',
    },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error:
        'Gerador sintético removido. Utilize a consulta unitária (/api/recent-companies/lookup) ou importação de lista de CNPJs reais.',
    },
    { status: 410 }
  );
}
