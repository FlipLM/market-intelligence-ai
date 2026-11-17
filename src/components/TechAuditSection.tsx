'use client';

import { TechAuditAnalysis } from '@/types/market';
import { formatProvenanceText } from '@/types/provenance';

interface TechAuditSectionProps {
  audit: TechAuditAnalysis;
}

export default function TechAuditSection({ audit }: TechAuditSectionProps) {
  return (
    <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-5 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/60 dark:border-white/[0.06]">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Levantamento Técnico de TI
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{audit.disclaimer}</p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
          {audit.verdict.status}
        </span>
      </div>

      <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
        <div>
          <span className="text-slate-400">Veredito técnico: </span>
          <strong>{formatProvenanceText(audit.verdictTitle)}</strong>
        </div>
        <p>{formatProvenanceText(audit.verdictReason)}</p>
      </div>
    </div>
  );
}
