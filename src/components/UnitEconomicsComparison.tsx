"use client";

import React from "react";
import { NicheReport } from "@/types/market";
import { DollarSign, Clock, TrendingUp } from "lucide-react";

interface UnitEconomicsComparisonProps {
  niches: NicheReport[];
}

export function UnitEconomicsComparison({ niches }: UnitEconomicsComparisonProps) {
  const top4 = [...niches]
    .sort((a, b) => b.scoring.finalScore - a.scoring.finalScore)
    .slice(0, 4);

  return (
    <div className="space-y-3">
      {top4.map((niche, idx) => {
        const baseScenario = niche.financialScenarios.find((s) => s.name === "Base") || niche.financialScenarios[0];
        const totalYearRevenue = (baseScenario?.upfrontRevenue || 0) + (baseScenario?.firstYearArr || 0);

        return (
          <div
            key={niche.id}
            className="glass-panel p-3.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {niche.basicInfo.name}
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold shrink-0">
                {baseScenario?.dealsClosed || 0} contratos
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="bg-slate-50 dark:bg-white/[0.03] p-2 rounded-lg border border-slate-200/60 dark:border-white/[0.04]">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Setup Inicial</span>
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                  R$ {(baseScenario?.upfrontRevenue || 0).toLocaleString("pt-BR")}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-white/[0.03] p-2 rounded-lg border border-slate-200/60 dark:border-white/[0.04]">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">ARR (12 meses)</span>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  R$ {(baseScenario?.firstYearArr || 0).toLocaleString("pt-BR")}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-white/[0.03] p-2 rounded-lg border border-slate-200/60 dark:border-white/[0.04]">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Payback Estimado</span>
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {baseScenario?.paybackMonths || 0} meses
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

