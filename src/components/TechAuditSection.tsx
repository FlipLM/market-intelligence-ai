'use client';

import { TechAuditAnalysis } from '@/types/market';
import { 
  Code, 
  CheckCircle, 
  AlertCircle, 
  Server, 
  Layers
} from 'lucide-react';

interface TechAuditSectionProps {
  audit: TechAuditAnalysis;
}

export default function TechAuditSection({ audit }: TechAuditSectionProps) {
  const getVerdictBadge = () => {
    switch (audit.verdict) {
      case 'altamente_viavel':
        return (
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Altamente Viável para Dev
          </span>
        );
      case 'viavel_com_escopo_fechado':
        return (
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
            Escopo Fechado Recomendado
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
            Risco de Suporte Elevado
          </span>
        );
    }
  };

  return (
    <div className="bg-[#141517] border border-white/[0.08] rounded-lg p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
        <div>
          <h3 className="text-sm font-semibold text-[#ededed]">
            Auditoria Técnica de TI & Engenharia de Software
          </h3>
          <p className="text-xs text-[#85858b]">
            Viabilidade de código, arquitetura e relação esforço vs retorno financeiro
          </p>
        </div>
        <div>{getVerdictBadge()}</div>
      </div>

      {/* Veredito */}
      <div className="bg-[#19191b] p-3.5 rounded-md border border-white/[0.06] space-y-1">
        <div className="text-xs font-semibold text-[#ededed]">
          {audit.verdictTitle}
        </div>
        <p className="text-xs text-[#a1a1a6] leading-relaxed">
          {audit.verdictReason}
        </p>
      </div>

      {/* Indicadores Chave de TI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#101113] p-3 rounded-md border border-white/[0.04]">
          <span className="text-[10px] text-[#6e6e73] uppercase font-mono block">Dev Effort vs ROI</span>
          <span className="text-lg font-semibold text-[#ededed] font-mono">
            {audit.devEffortVsRoiScore} <span className="text-[11px] text-[#6e6e73] font-normal">/ 100</span>
          </span>
        </div>

        <div className="bg-[#101113] p-3 rounded-md border border-white/[0.04]">
          <span className="text-[10px] text-[#6e6e73] uppercase font-mono block">Complexidade</span>
          <span className="text-xs font-medium text-[#ededed] capitalize block pt-1">
            {audit.architectureComplexity}
          </span>
        </div>

        <div className="bg-[#101113] p-3 rounded-md border border-white/[0.04]">
          <span className="text-[10px] text-[#6e6e73] uppercase font-mono block">Reaproveitamento</span>
          <span className="text-lg font-semibold text-[#ededed] font-mono">
            ~{audit.reusabilityPercentageEstimated}%
          </span>
        </div>

        <div className="bg-[#101113] p-3 rounded-md border border-white/[0.04]">
          <span className="text-[10px] text-[#6e6e73] uppercase font-mono block">Prazo MVP</span>
          <span className="text-lg font-semibold text-[#ededed] font-mono">
            ~{audit.mvpDeliveryTargetDays} dias
          </span>
        </div>
      </div>

      {/* Stack Recomendada */}
      <div className="space-y-2 pt-1">
        <span className="text-[11px] text-[#85858b] font-medium uppercase font-mono block">
          Arquitetura e Stack Sugerida:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="bg-[#19191b] p-2.5 rounded border border-white/[0.04]">
            <span className="text-[#6e6e73] block text-[10px] font-mono">Frontend:</span>
            <span className="text-[#ededed] font-mono text-[11px]">{audit.recommendedTechStack.frontend}</span>
          </div>
          <div className="bg-[#19191b] p-2.5 rounded border border-white/[0.04]">
            <span className="text-[#6e6e73] block text-[10px] font-mono">Backend & Banco:</span>
            <span className="text-[#ededed] font-mono text-[11px]">{audit.recommendedTechStack.backendAndDb}</span>
          </div>
        </div>
      </div>

      {/* Pontos de Atenção de TI */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[11px] text-[#85858b] font-medium uppercase font-mono block">
          Scope Creep & Armadilhas a Bloquear no Contrato:
        </span>
        <ul className="space-y-1">
          {audit.pitfallsToAvoid.map((pitfall, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-[#a1a1a6]">
              <span className="w-1 h-1 rounded-full bg-[#85858b] shrink-0 mt-2" />
              <span>{pitfall}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
