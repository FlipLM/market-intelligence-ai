"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, TrendingUp, Building2, ChevronRight } from "lucide-react";
import { NicheReport } from "@/types/market";

interface NicheLeaderboardProps {
  niches: NicheReport[];
}

export function NicheLeaderboard({ niches }: NicheLeaderboardProps) {
  const sorted = [...niches].sort((a, b) => b.scoring.finalScore - a.scoring.finalScore);

  return (
    <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
      {sorted.map((niche, idx) => {
        const isTop3 = idx < 3;
        const regState = niche.basicInfo.geographicScope.state || "BR";
        const score = niche.scoring.finalScore;

        return (
          <Link
            key={niche.id}
            href={`/nicho/${niche.id}`}
            className="group block glass-panel p-3.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all duration-150"
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 ${
                    idx === 0
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                      : idx === 1
                      ? "bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10"
                      : idx === 2
                      ? "bg-amber-700/15 text-amber-700 dark:text-amber-500 border border-amber-700/30"
                      : "bg-slate-100 dark:bg-white/[0.04] text-slate-500 dark:text-slate-400"
                  }`}
                >
                  #{idx + 1}
                </span>

                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {niche.basicInfo.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span>{niche.basicInfo.segment}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600" />
                    <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">{regState}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                    {score} <span className="text-[10px] text-slate-500 font-normal">/ 100</span>
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    {niche.scoring.commercialPotential.toUpperCase()}
                  </div>
                </div>
                <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.04] group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-slate-400 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Barra de Progresso Fina e Elegante */}
            <div className="w-full bg-slate-100 dark:bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isTop3
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-400"
                    : "bg-slate-400 dark:bg-slate-600"
                }`}
                style={{ width: `${score}%` }}
              />
            </div>

            {/* Indicadores do Nicho */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 font-mono">
              <div>
                Setup: <span className="text-slate-700 dark:text-slate-200">R$ {niche.commercialViability.recommendedPricing.implementationSetupMin.toLocaleString("pt-BR")} - {niche.commercialViability.recommendedPricing.implementationSetupMax.toLocaleString("pt-BR")}</span>
              </div>
              <div>
                Recorrência: <span className="text-slate-700 dark:text-slate-200">R$ {niche.commercialViability.recommendedPricing.monthlyFeeMin.toLocaleString("pt-BR")}/mês</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

