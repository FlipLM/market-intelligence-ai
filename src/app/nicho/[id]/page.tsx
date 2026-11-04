import { notFound } from "next/navigation";
import Link from "next/link";
import { getNicheById, saveNiche } from "@/lib/db";
import ScoreBreakdownView from "@/components/ScoreBreakdownView";
import HandoffButton from "@/components/HandoffButton";
import DownloadPdfButton from "@/components/DownloadPdfButton";
import TechAuditSection from "@/components/TechAuditSection";
import OutreachCopySection from "@/components/OutreachCopySection";
import { runTechAuditorAgent } from "@/lib/agents/techAuditorAgent";
import { runOutreachCopywriterAgent } from "@/lib/agents/outreachCopywriterAgent";
import { 
  ChevronLeft,
  ExternalLink,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Building2,
  DollarSign,
  TrendingUp,
  MapPin
} from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function NicheDetailPage({ params }: Props) {
  const { id } = await params;
  const niche = getNicheById(id);

  if (!niche) {
    notFound();
  }

  if (!niche.techAudit) {
    niche.techAudit = runTechAuditorAgent({
      basicInfo: niche.basicInfo,
      opportunities: niche.opportunities,
      viability: niche.commercialViability,
      competition: niche.competition,
    });
    saveNiche(niche);
  }

  if (!niche.outreachCopy) {
    niche.outreachCopy = runOutreachCopywriterAgent({
      basicInfo: niche.basicInfo,
      opportunities: niche.opportunities,
      viability: niche.commercialViability,
    });
    saveNiche(niche);
  }

  const {
    basicInfo,
    demand,
    paidTraffic,
    competition,
    opportunities,
    commercialViability,
    scoring,
    financialScenarios,
    whyEnterArguments,
    whyNotEnterRisks,
    decisionRecommendation,
    techAudit,
    outreachCopy,
  } = niche;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Navegação de Topo e Barra de Ações Executivas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-white/[0.08] no-print">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            <ChevronLeft className="w-4 h-4" /> Voltar ao Painel Geral
          </Link>
          <span className="text-slate-300 dark:text-white/10">•</span>
          <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
            ID: {niche.id}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <DownloadPdfButton niche={niche} />
          <HandoffButton nicheId={niche.id} nicheName={niche.basicInfo.name} />
        </div>
      </div>

      {/* Header do Dossiê */}
      <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-6 sm:p-7 space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                {basicInfo.segment}
              </span>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08]">
                CNAE {basicInfo.cnaes.join(", ")}
              </span>
              <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {basicInfo.geographicScope.state ? `Região: ${basicInfo.geographicScope.state}` : "Brasil"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {basicInfo.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
              {basicInfo.description}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] p-4 rounded-xl shrink-0">
            <div className="text-right">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Score Geral</div>
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">{scoring.commercialPotential}</div>
            </div>
            <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white pl-4 border-l border-slate-200 dark:border-white/[0.08]">
              {scoring.finalScore}
            </div>
          </div>
        </div>

        {/* Parecer do Agente */}
        <div className="glass-panel-subtle p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.06] space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Síntese do Analista de Mercado:
          </span>
          <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
            {decisionRecommendation}
          </p>
        </div>
      </div>

      {/* Tese Comercial: Por Que Abordar vs Riscos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <h3>Por Que Entrar Neste Nicho?</h3>
          </div>
          <ul className="space-y-2">
            {whyEnterArguments.map((arg, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-2" />
                <span>{arg}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <h3>Fricções Operacionais & Pontos de Atenção</h3>
          </div>
          <ul className="space-y-2">
            {whyNotEnterRisks.map((risk, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-2" />
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Agente 8: Auditoria Técnica de TI */}
      {techAudit && <TechAuditSection audit={techAudit} />}

      {/* Hand-off Direto para G:\Prospector */}
      <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Pronto para Disparar Prospecção no Google Maps?
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Transmita este nicho diretamente para o <strong className="text-slate-700 dark:text-slate-200">G:\Prospector</strong> com filtros de WhatsApp e script de abordagem prontos.
          </p>
        </div>
        <HandoffButton nicheId={niche.id} nicheName={basicInfo.name} />
      </div>

      {/* Agente 9: Copywriting & Cadência */}
      {outreachCopy && (
        <OutreachCopySection copyBriefing={outreachCopy} nicheName={basicInfo.name} />
      )}

      {/* Soluções Digitais & Cenários */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Oportunidades de Software */}
          <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-white/[0.08]">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Oportunidades de Software Mapeadas
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Gargalos operacionais reais transformados em produtos vendáveis
                </p>
              </div>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300">
                {opportunities.length} Soluções
              </span>
            </div>

            <div className="space-y-3.5">
              {opportunities.map((opp) => (
                <div
                  key={opp.id}
                  className="bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] rounded-xl p-4 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      {opp.title}
                    </h4>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold">
                      MVP: ~{opp.typicalDevelopmentDays} dias
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white dark:bg-white/[0.02] p-3 rounded-lg border border-slate-200/60 dark:border-white/[0.04]">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">
                        Gargalo Operacional:
                      </span>
                      <p className="text-slate-700 dark:text-slate-300">{opp.operationalProblem}</p>
                    </div>
                    <div className="bg-white dark:bg-white/[0.02] p-3 rounded-lg border border-slate-200/60 dark:border-white/[0.04]">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold block mb-1">
                        Solução Digital Proposta:
                      </span>
                      <p className="text-slate-700 dark:text-slate-300">{opp.digitalSolution}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cenários Financeiros */}
          <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-5 sm:p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Simulador de Cenários Comerciais (1º Ano)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {financialScenarios.map((scen, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] rounded-xl p-4 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-500 dark:text-slate-400 uppercase">{scen.name}</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{scen.dealsClosed} contratos</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                    R$ {(scen.upfrontRevenue + scen.firstYearArr).toLocaleString("pt-BR")}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5 pt-1 border-t border-slate-200/60 dark:border-white/[0.04] font-mono">
                    <div>Setup: R$ {scen.upfrontRevenue.toLocaleString("pt-BR")}</div>
                    <div>ARR: R$ {scen.firstYearArr.toLocaleString("pt-BR")}</div>
                    <div>Payback: {scen.paybackMonths} meses</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna Direita: Scoring Breakdown & Tráfego */}
        <div className="space-y-5">
          <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Composição da Pontuação (8 Critérios)
            </h3>
            <ScoreBreakdownView items={scoring.items} />
          </div>

          <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Inteligência de Tráfego Pago & Leilão
            </h3>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-white/[0.04]">
                <span>CPC Médio no Google:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  R$ {paidTraffic.estimatedAverageCpc.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-white/[0.04]">
                <span>Disputa Publicitária:</span>
                <span className="font-semibold text-slate-900 dark:text-white capitalize">
                  {paidTraffic.auctionCompetition}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span>Dificuldade de Aquisição:</span>
                <span className="font-semibold text-slate-900 dark:text-white capitalize">
                  {paidTraffic.acquisitionDifficulty}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Evidências Auditadas */}
      <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-white/[0.08]">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Auditoria de Dados & Fontes Oficiais
          </h3>
          <span className="text-xs text-slate-500 font-mono">100% Verificável</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {[
            ...demand.evidences,
            ...paidTraffic.evidences,
            ...competition.evidences,
            ...commercialViability.evidences,
          ].map((ev) => (
            <div
              key={ev.id}
              className="bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] rounded-xl p-3.5 text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-blue-600 dark:text-blue-400 truncate max-w-[180px]">
                  {ev.source}
                </span>
                <span className="text-[10px] font-mono uppercase bg-slate-200 dark:bg-white/[0.06] px-1.5 py-0.5 rounded">
                  {ev.origin}
                </span>
              </div>
              <div className="font-bold text-slate-900 dark:text-white">{ev.metricName}</div>
              <div className="text-[11px] font-mono text-slate-700 dark:text-slate-300 bg-white dark:bg-white/[0.04] p-2 rounded border border-slate-200/60 dark:border-white/[0.04]">
                {String(ev.value)}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{ev.notes}</p>
              {ev.sourceUrl && (
                <a
                  href={ev.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline pt-1"
                >
                  Acessar Fonte <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
