import Link from 'next/link';
import { getNiches, getDiscardedSyntheticNiches } from '@/lib/db';
import { NicheLeaderboard } from '@/components/NicheLeaderboard';
import { UnitEconomicsComparison } from '@/components/UnitEconomicsComparison';
import { NichesCatalogTable } from '@/components/NichesCatalogTable';
import {
  Building2,
  TrendingUp,
  CheckCircle,
  Target,
  Search,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { formatProvenanceText } from '@/types/provenance';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const niches = getNiches();
  const discardedCount = getDiscardedSyntheticNiches().length;

  const totalNiches = niches.length;
  const scoredNiches = niches.filter((n) => n.scoring.finalScore !== null);
  const topNiche = [...scoredNiches].sort(
    (a, b) => (b.scoring.finalScore ?? -1) - (a.scoring.finalScore ?? -1)
  )[0];

  const verifiedCompanyTotal = niches.reduce((sum, n) => {
    const val = n.commercialViability.totalEligibleCompanies;
    return val.status !== 'desconhecido' && val.valor ? sum + val.valor : sum;
  }, 0);

  const avgScore = scoredNiches.length
    ? Math.round(
        scoredNiches.reduce((sum, n) => sum + (n.scoring.finalScore ?? 0), 0) /
          scoredNiches.length
      )
    : null;

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Terminal de Mercado B2B
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-amber-500" /> Distrito Federal & Brasil
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Descoberta & Qualificação de Nichos Comerciais
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Todos os dados exibidos seguem proveniência explícita (Verificado, Inferido ou Não verificado).
            {discardedCount > 0 && ` (${discardedCount} registros sintéticos legados marcados como descartados.)`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            href="/empresas-recentes"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 transition shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Radar de Novas Empresas</span>
          </Link>
          <Link
            href="/pesquisa"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.08] transition shadow-sm"
          >
            <Search className="w-4 h-4 text-slate-500" />
            <span>Pesquisar Nicho Específico</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="glass-panel p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Nichos Auditados</span>
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Target className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{totalNiches}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Sem dados sintéticos</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Segmento Líder</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white truncate pt-1">
            {topNiche ? formatProvenanceText(topNiche.basicInfo.name) : 'Não verificado'}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">
            {topNiche && topNiche.scoring.finalScore !== null
              ? `Score: ${topNiche.scoring.finalScore} / 100`
              : 'Sem score verificado'}
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Empresas Verificadas</span>
            <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {verifiedCompanyTotal > 0 ? verifiedCompanyTotal.toLocaleString('pt-BR') : '0'}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Base real coletada</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Score Médio Geral</span>
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {avgScore !== null ? avgScore : 'Não verificado'}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Critérios com evidência</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-white/[0.08]">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Ranking de Nichos por Evidência
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Classificação baseada exclusivamente em critérios verificáveis
              </p>
            </div>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300">
              {niches.length} Nichos
            </span>
          </div>

          <NicheLeaderboard niches={niches} />
        </div>

        <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-white/[0.08]">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Cenários Hipotéticos (Editáveis)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Simulações matemáticas com premissas declaradas — não constituem previsão
              </p>
            </div>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
              Hipotético
            </span>
          </div>

          <UnitEconomicsComparison niches={niches} />
        </div>
      </div>

      <NichesCatalogTable niches={niches} />
    </div>
  );
}
