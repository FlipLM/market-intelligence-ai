'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { NicheReport } from '@/types/market';
import { formatProvenanceText } from '@/types/provenance';

interface NicheLeaderboardProps {
  niches: NicheReport[];
}

export function NicheLeaderboard({ niches }: NicheLeaderboardProps) {
  const sorted = [...niches].sort(
    (a, b) => (b.scoring.finalScore ?? -1) - (a.scoring.finalScore ?? -1)
  );

  if (sorted.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
        Nenhum nicho ativo auditado ainda.
      </div>
    );
  }

  return (
    <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
      {sorted.map((niche, idx) => {
        const regState = formatProvenanceText(niche.basicInfo.geographicScope.state, 'BR');
        const score = niche.scoring.finalScore;

        return (
          <Link
            key={niche.id}
            href={`/nicho/${niche.id}`}
            className="group block glass-panel p-3.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all duration-150"
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300">
                  #{idx + 1}
                </span>

                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {formatProvenanceText(niche.basicInfo.name)}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span>{formatProvenanceText(niche.basicInfo.segment)}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600" />
                    <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">
                      {regState}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                    {score !== null ? `${score} / 100` : 'N/V'}
                  </div>
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium uppercase">
                    Confiança {niche.scoring.confidenceLevel}
                  </div>
                </div>
                <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.04] group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-slate-400 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="w-full bg-slate-100 dark:bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-500"
                style={{ width: `${score ?? 0}%` }}
              />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
