'use client';

import React from 'react';
import { ProvenanceField, ProvenanceStatus } from '@/types/provenance';

interface ProvenanceBadgeProps {
  status: ProvenanceStatus;
  fonte: string;
  consultado_em?: string | null;
  url_ou_api?: string | null;
  regra?: string | null;
  compact?: boolean;
}

const STATUS_CONFIG: Record<
  ProvenanceStatus,
  { label: string; className: string }
> = {
  verificado: {
    label: 'Verificado',
    className:
      'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  },
  inferido: {
    label: 'Inferido',
    className:
      'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
  },
  desconhecido: {
    label: 'Não verificado',
    className:
      'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  },
};

function formatDateBr(iso?: string | null): string {
  if (!iso) return 'Não consultado';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('pt-BR');
}

export function ProvenanceBadge({
  status,
  fonte,
  consultado_em,
  url_ou_api,
  regra,
  compact = false,
}: ProvenanceBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  const tooltipLines = [
    `Status: ${cfg.label}`,
    `Fonte: ${fonte}`,
    `Consulta: ${formatDateBr(consultado_em)}`,
    regra ? `Regra: ${regra}` : null,
    url_ou_api ? `URL/API: ${url_ou_api}` : null,
  ].filter(Boolean);

  return (
    <span
      title={tooltipLines.join('\n')}
      aria-label={tooltipLines.join(' | ')}
      className={`inline-flex items-center gap-1 rounded border font-mono font-semibold cursor-help select-none ${
        compact ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-0.5'
      } ${cfg.className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === 'verificado'
            ? 'bg-emerald-500'
            : status === 'inferido'
            ? 'bg-blue-500'
            : 'bg-amber-500'
        }`}
      />
      <span>{cfg.label}</span>
    </span>
  );
}

export function FieldProvenanceBadge<T>({
  field,
  compact = true,
}: {
  field?: ProvenanceField<T> | null;
  compact?: boolean;
}) {
  if (!field) {
    return (
      <ProvenanceBadge
        status="desconhecido"
        fonte="Campo não preenchido"
        consultado_em={null}
        compact={compact}
      />
    );
  }
  return (
    <ProvenanceBadge
      status={field.status}
      fonte={field.fonte}
      consultado_em={field.consultado_em}
      url_ou_api={field.url_ou_api}
      regra={field.regra}
      compact={compact}
    />
  );
}
