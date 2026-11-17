'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ChevronRight } from 'lucide-react';
import { NicheReport } from '@/types/market';
import DownloadPdfButton from '@/components/DownloadPdfButton';
import { formatProvenanceText } from '@/types/provenance';

interface NichesCatalogTableProps {
  niches: NicheReport[];
}

export function NichesCatalogTable({ niches }: NichesCatalogTableProps) {
  const [search, setSearch] = useState('');

  const filteredNiches = useMemo(() => {
    return niches
      .filter((n) => {
        if (search.trim() === '') return true;
        const q = search.toLowerCase();
        return (
          formatProvenanceText(n.basicInfo.name, '').toLowerCase().includes(q) ||
          formatProvenanceText(n.basicInfo.segment, '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (b.scoring.finalScore ?? -1) - (a.scoring.finalScore ?? -1));
  }, [niches, search]);

  return (
    <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] overflow-hidden shadow-sm">
      <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Nichos Auditados
            </h2>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              {filteredNiches.length} exibidos
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Exibindo apenas registros auditados com proveniência declarada
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Filtrar por nicho ou setor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {filteredNiches.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
          Nenhum nicho ativo encontrado. Registros sintéticos legados foram descartados.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50/90 dark:bg-white/[0.02] uppercase text-[10px] font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-white/[0.08] tracking-wider">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Nicho &amp; Setor</th>
                <th className="py-3 px-3 text-center">Região</th>
                <th className="py-3 px-3 text-center">Score</th>
                <th className="py-3 px-3 text-center">Confiança</th>
                <th className="py-3 px-4">Empresas Coletadas</th>
                <th className="py-3 px-4 text-right">Dossiê</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-white/[0.04]">
              {filteredNiches.map((niche, idx) => (
                <tr key={niche.id} className="hover:bg-slate-100/50 dark:hover:bg-white/[0.02] transition">
                  <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">#{idx + 1}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {formatProvenanceText(niche.basicInfo.name)}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {formatProvenanceText(niche.basicInfo.segment)}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono">
                    {formatProvenanceText(niche.basicInfo.geographicScope.state, 'BR')}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono font-bold">
                    {niche.scoring.finalScore !== null ? niche.scoring.finalScore : 'Não verificado'}
                  </td>
                  <td className="py-3.5 px-3 text-center capitalize">
                    {niche.scoring.confidenceLevel} ({niche.scoring.evidencedCriteriaCount}/
                    {niche.scoring.totalCriteriaCount})
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    {formatProvenanceText(niche.commercialViability.totalEligibleCompanies)}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <DownloadPdfButton niche={niche} variant="compact" />
                      <Link
                        href={`/nicho/${niche.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-400 border border-blue-500/20 transition cursor-pointer"
                      >
                        Dossiê <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
