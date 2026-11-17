import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error:
        'Descoberta automática baseada em catálogo hardcoded foi desativada. Cadastre nichos com CNAE e evidências reais.',
    },
    { status: 410 }
  );
}
