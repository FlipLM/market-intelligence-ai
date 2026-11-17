import Link from 'next/link';
import { getNiches } from '@/lib/db';
import DownloadPdfButton from '@/components/DownloadPdfButton';
import { ChevronRight } from 'lucide-react';
import { formatProvenanceText } from '@/types/provenance';

export const dynamic = 'force-dynamic';

export default async function RelatoriosPage() {
  const niches = getNiches();

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Dossiês & Relatórios de Mercado
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Relatórios auditados com proveniência explícita de cada informação
        </p>
      </div>

      {niches.length === 0 ? (
        <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-8 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            Nenhum nicho auditado ativo no momento.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Registros sintéticos anteriores foram descartados. Crie uma nova auditoria em Pesquisar Nichos.
          </p>
          <Link
            href="/pesquisa"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline pt-2"
          >
            Pesquisar Nicho <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {niches.map((niche) => (
            <div
              key={niche.id}
              className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-5 sm:p-6 space-y-4 flex flex-col justify-between shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    {formatProvenanceText(niche.basicInfo.segment)}
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {niche.scoring.finalScore !== null
                      ? `Score: ${niche.scoring.finalScore} / 100`
                      : 'Score: Não verificado'}
                  </span>
                </div>

                <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  {formatProvenanceText(niche.basicInfo.name)}
                </h2>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {formatProvenanceText(niche.basicInfo.description)}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50/80 dark:bg-white/[0.02] p-3 rounded-xl border border-slate-200/60 dark:border-white/[0.04]">
                  <div>
                    Empresas:{' '}
                    <strong className="text-slate-900 dark:text-white font-mono">
                      {formatProvenanceText(niche.commercialViability.totalEligibleCompanies)}
                    </strong>
                  </div>
                  <div>
                    Confiança:{' '}
                    <strong className="text-slate-900 dark:text-white capitalize">
                      {niche.scoring.confidenceLevel} ({niche.scoring.evidencedCriteriaCount}/
                      {niche.scoring.totalCriteriaCount})
                    </strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/60 dark:border-white/[0.06] flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                  {formatProvenanceText(niche.basicInfo.geographicScope.state, 'BR')} •{' '}
                  {niche.dataSufficiency}
                </span>
                <div className="flex items-center gap-2">
                  <DownloadPdfButton niche={niche} variant="compact" />
                  <Link
                    href={`/nicho/${niche.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-400 transition"
                  >
                    Abrir Dossiê <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
