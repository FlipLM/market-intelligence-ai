'use client';

import React, { useState } from 'react';
import { FinancialScenario, HypotheticalAssumptions } from '@/types/market';
import { calculateHypotheticalScenario, HYPOTHETICAL_DISCLAIMER } from '@/lib/simulator';
import { AlertTriangle, Save, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HypotheticalSimulatorProps {
  nicheId: string;
  initialScenario?: FinancialScenario;
}

const DEFAULT_ASSUMPTIONS: HypotheticalAssumptions = {
  prospectableCompanies: 0,
  effectiveContactRate: 0,
  responseRate: 0,
  meetingConversionRate: 0,
  closingRate: 0,
  avgSetupFee: 0,
  avgMonthlyFee: 0,
  estimatedCac: 0,
};

export default function HypotheticalSimulator({
  nicheId,
  initialScenario,
}: HypotheticalSimulatorProps) {
  const router = useRouter();
  const [assumptions, setAssumptions] = useState<HypotheticalAssumptions>(
    initialScenario?.assumptions || DEFAULT_ASSUMPTIONS
  );
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const computed = calculateHypotheticalScenario('Personalizado', assumptions);

  const updateField = (key: keyof HypotheticalAssumptions, raw: string) => {
    const num = Number(raw);
    setAssumptions((prev) => ({
      ...prev,
      [key]: Number.isNaN(num) || num < 0 ? 0 : num,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSavedMsg(null);
      const res = await fetch(`/api/niches/${nicheId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hypotheticalAssumptions: assumptions }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedMsg('Premissas hipotéticas salvas.');
        router.refresh();
      } else {
        setSavedMsg(`Erro: ${data.error}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const fields: Array<{
    key: keyof HypotheticalAssumptions;
    label: string;
    suffix?: string;
  }> = [
    { key: 'prospectableCompanies', label: 'Empresas prospectáveis (premissa)' },
    { key: 'effectiveContactRate', label: 'Taxa de contato efetivo', suffix: '%' },
    { key: 'responseRate', label: 'Taxa de resposta', suffix: '%' },
    { key: 'meetingConversionRate', label: 'Conversão p/ reunião', suffix: '%' },
    { key: 'closingRate', label: 'Taxa de fechamento', suffix: '%' },
    { key: 'avgSetupFee', label: 'Setup por cliente (R$)' },
    { key: 'avgMonthlyFee', label: 'Mensalidade por cliente (R$)' },
    { key: 'estimatedCac', label: 'CAC estimado (R$)' },
  ];

  return (
    <div className="glass-panel rounded-2xl border border-amber-500/30 p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Simulador Financeiro — CENÁRIO HIPOTÉTICO
          </h3>
          <p className="text-xs text-amber-700 dark:text-amber-300 flex items-center gap-1.5 mt-0.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{HYPOTHETICAL_DISCLAIMER}</span>
          </p>
        </div>
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold shrink-0">
          Premissas Editáveis
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {fields.map((f) => (
          <label key={f.key} className="space-y-1 block">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              {f.label} {f.suffix ? `(${f.suffix})` : ''}
            </span>
            <input
              type="number"
              min={0}
              step="any"
              value={assumptions[f.key]}
              onChange={(e) => updateField(f.key, e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] font-mono text-slate-900 dark:text-white"
            />
          </label>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-white/[0.02] p-3.5 rounded-xl border border-slate-200/60 dark:border-white/[0.06]">
        <div>
          <span className="text-[10px] text-slate-500 block">Contratos (Hipotético)</span>
          <strong className="text-base font-mono text-slate-900 dark:text-white">
            {computed.dealsClosed}
          </strong>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block">Setup (Hipotético)</span>
          <strong className="text-base font-mono text-slate-900 dark:text-white">
            R$ {computed.upfrontRevenue.toLocaleString('pt-BR')}
          </strong>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block">ARR 12m (Hipotético)</span>
          <strong className="text-base font-mono text-emerald-600 dark:text-emerald-400">
            R$ {computed.firstYearArr.toLocaleString('pt-BR')}
          </strong>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block">Payback (Hipotético)</span>
          <strong className="text-base font-mono text-slate-900 dark:text-white">
            {computed.paybackMonths !== null ? `${computed.paybackMonths} meses` : 'N/A'}
          </strong>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-slate-500">{savedMsg || ''}</span>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 cursor-pointer disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span>Salvar Premissas Hipotéticas</span>
        </button>
      </div>
    </div>
  );
}
