/**
 * Modelo de Proveniência Obrigatória — Market Intelligence AI
 * Regra de ouro: nenhum dado é exibido, salvo ou usado sem origem verificável.
 */

export type ProvenanceStatus = 'verificado' | 'inferido' | 'desconhecido';

export interface ProvenanceField<T> {
  valor: T | null;
  status: ProvenanceStatus;
  fonte: string;
  url_ou_api?: string | null;
  consultado_em: string | null;
  regra?: string | null;
}

export function verificado<T>(params: {
  valor: T;
  fonte: string;
  url_ou_api?: string | null;
  consultado_em?: string;
}): ProvenanceField<T> {
  return {
    valor: params.valor,
    status: 'verificado',
    fonte: params.fonte,
    url_ou_api: params.url_ou_api ?? null,
    consultado_em: params.consultado_em ?? new Date().toISOString(),
  };
}

export function inferido<T>(params: {
  valor: T;
  fonte: string;
  regra: string;
  consultado_em?: string | null;
  url_ou_api?: string | null;
}): ProvenanceField<T> {
  return {
    valor: params.valor,
    status: 'inferido',
    fonte: params.fonte,
    url_ou_api: params.url_ou_api ?? null,
    consultado_em: params.consultado_em ?? new Date().toISOString(),
    regra: params.regra,
  };
}

export function desconhecido<T>(
  fonte = 'Não verificado (sem fonte pública consultada)',
  consultado_em: string | null = null
): ProvenanceField<T> {
  return {
    valor: null,
    status: 'desconhecido',
    fonte,
    url_ou_api: null,
    consultado_em,
  };
}

export function isProvenanceField(value: unknown): value is ProvenanceField<unknown> {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return (
    'valor' in obj &&
    (obj.status === 'verificado' || obj.status === 'inferido' || obj.status === 'desconhecido') &&
    typeof obj.fonte === 'string' &&
    obj.fonte.trim().length > 0 &&
    'consultado_em' in obj
  );
}

export function hasEvidence<T>(field?: ProvenanceField<T> | null): boolean {
  return Boolean(
    field &&
      (field.status === 'verificado' || field.status === 'inferido') &&
      field.valor !== null &&
      field.valor !== undefined &&
      field.valor !== ''
  );
}

export function formatProvenanceText(
  field?: ProvenanceField<string | number | boolean> | null,
  fallback = 'Não verificado'
): string {
  if (!field || field.status === 'desconhecido' || field.valor === null || field.valor === undefined || field.valor === '') {
    return fallback;
  }
  return String(field.valor);
}
