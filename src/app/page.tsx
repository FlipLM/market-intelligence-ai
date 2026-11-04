import Link from "next/link";
import { getNiches } from "@/lib/db";
import { initializeDatabaseSeed } from "@/lib/seed";
import { NicheLeaderboard } from "@/components/NicheLeaderboard";
import { UnitEconomicsComparison } from "@/components/UnitEconomicsComparison";
import { NichesCatalogTable } from "@/components/NichesCatalogTable";
import AutoDiscoverDfButton from "@/components/AutoDiscoverDfButton";
import { 
  Building2, 
  TrendingUp, 
  CheckCircle, 
  Target, 
  ArrowRight, 
  Search, 
  MapPin, 
  ChevronRight,
  ExternalLink
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  initializeDatabaseSeed();
  const niches = getNiches();

  const totalNiches = niches.length;
  const topNiche = [...niches].sort((a, b) => b.scoring.finalScore - a.scoring.finalScore)[0];
  const totalEligibleCompanies = niches.reduce((sum, n) => sum + n.commercialViability.totalEligibleCompanies, 0);
  const avgScore = totalNiches ? Math.round(niches.reduce((sum, n) => sum + n.scoring.finalScore, 0) / totalNiches) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner de Ações Rápidas (Estilo Prospector) */}
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
            Identifique setores com alta urgência operacional e disposição a pagar antes de disparar o robô de prospecção do <strong className="text-slate-700 dark:text-slate-200">Prospector B2B</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <AutoDiscoverDfButton />
          <Link
            href="/pesquisa"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.08] transition shadow-sm"
          >
            <Search className="w-4 h-4 text-slate-500" />
            <span>Pesquisar Nicho Específico</span>
          </Link>
        </div>
      </div>

      {/* Métricas Cards (Estilo MetricsBar do Prospector) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="glass-panel p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Nichos no Radar</span>
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Target className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{totalNiches}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Setores auditados</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Segmento Líder</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white truncate pt-1">
            {topNiche ? topNiche.basicInfo.name : "-"}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">
            {topNiche ? `Score: ${topNiche.scoring.finalScore} / 100` : "-"}
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Empresas Mapeadas</span>
            <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {totalEligibleCompanies.toLocaleString("pt-BR")}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">CNAEs oficiais do IBGE</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Score Médio Geral</span>
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {avgScore} <span className="text-xs font-normal text-slate-500">/ 100</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Ponderado em 8 critérios</div>
        </div>
      </div>

      {/* Grid Principal: Leaderboard Sem Truncamento & Unit Economics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Painel Esquerdo: Ranking Completo sem quebra de texto */}
        <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-white/[0.08]">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Ranking de Nichos por Pontuação
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Classificação por viabilidade técnica, comercial e facilidade de entrada
              </p>
            </div>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300">
              {niches.length} Nichos
            </span>
          </div>

          <NicheLeaderboard niches={niches} />
        </div>

        {/* Painel Direito: Unit Economics Comparativo */}
        <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-white/[0.08]">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Projeção de Retorno (Top 4 Nichos)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Setup de Implantação vs Receita Recorrente Anual (ARR) no Cenário Base
              </p>
            </div>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              1º Ano
            </span>
          </div>

          <UnitEconomicsComparison niches={niches} />
        </div>
      </div>

      {/* Catálogo Top 50 Nichos com Filtros e Busca Rápida */}
      <NichesCatalogTable niches={niches} />
    </div>
  );
}
