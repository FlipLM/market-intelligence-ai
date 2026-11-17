'use client';

import React from 'react';
import { NicheReport } from '@/types/market';
import { formatProvenanceText } from '@/types/provenance';

interface UnitEconomicsComparisonProps {
  niches: NicheReport[];
}

export function UnitEconomicsComparison({ niches }: UnitEconomicsComparisonProps) {
  const top4 = [...niches]
    .sort((a, b) => (b.scoring.finalScore ?? -1) - (a.scoring.finalScore ?? -1))
    .slice(0, 4);

  if (top4.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
        Nenhum cenário hipotético disponível. Cadastre um nicho para simular com premissas próprias.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {top4.map((niche) => {
        const scenario = niche.financialScenarios[0];
        return (
          <div
            key={niche.id}
            className="glass-panel p-3.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {formatProvenanceText(niche.basicInfo.name)}
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold shrink-0">
                Cenário Hipotético
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="bg-slate-50 dark:bg-white/[0.03] p-2 rounded-lg border border-slate-200/60 dark:border-white/[0.04]">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                  Setup Simulado
                </span>
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                  R$ {(scenario?.upfrontRevenue || 0).toLocaleString('pt-BR')}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-white/[0.03] p-2 rounded-lg border border-slate-200/60 dark:border-white/[0.04]">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                  ARR Simulado
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  R$ {(scenario?.firstYearArr || 0).toLocaleString('pt-BR')}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-white/[0.03] p-2 rounded-lg border border-slate-200/60 dark:border-white/[0.04]">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                  Payback Simulado
                </span>
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {scenario?.paybackMonths !== null && scenario?.paybackMonths !== undefined
                    ? `${scenario.paybackMonths} meses`
                    : 'N/V'}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
