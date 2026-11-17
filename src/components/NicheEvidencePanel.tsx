'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, PlusCircle, Loader2 } from 'lucide-react';

interface NicheEvidencePanelProps {
  nicheId: string;
}

export default function NicheEvidencePanel({ nicheId }: NicheEvidencePanelProps) {
  const router = useRouter();
  const [recalculating, setRecalculating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [category, setCategory] = useState<
    'demandScore' | 'marketSaturation' | 'averageCompanyRevenue' | 'averageCpc'
  >('demandScore');
  const [value, setValue] = useState('');
  const [source, setSource] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');

  const handleRecalculate = async () => {
    try {
      setRecalculating(true);
      setFeedback(null);
      const res = await fetch(`/api/niches/${nicheId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recalculateFromBase: true }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback('Agregações recalculadas a partir da base real de CNPJs.');
        router.refresh();
      } else {
        setFeedback(`Erro: ${data.error}`);
      }
    } finally {
      setRecalculating(false);
    }
  };

  const handleAddEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!source.trim() || !value.trim()) {
      setFeedback('Informe valor e fonte citada.');
      return;
    }

    try {
      setSubmitting(true);
      setFeedback(null);
      const res = await fetch(`/api/niches/${nicheId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manualEvidence: {
            category,
            value: value.trim(),
            source: source.trim(),
            sourceUrl: sourceUrl.trim() || undefined,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setValue('');
        setSource('');
        setSourceUrl('');
        setFeedback('Evidência com fonte citada registrada e score recalculado.');
        router.refresh();
      } else {
        setFeedback(`Erro: ${data.error}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-white/[0.06]">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Atualizar Evidências &amp; Agregação Real
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Demanda, concorrência e faturamento só entram no score com fonte citada.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRecalculate}
          disabled={recalculating}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer disabled:opacity-50"
        >
          {recalculating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          <span>Recalcular com CNPJs da Base</span>
        </button>
      </div>

      <form onSubmit={handleAddEvidence} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
        <select
          value={category}
          onChange={(e) =>
            setCategory(
              e.target.value as
                | 'demandScore'
                | 'marketSaturation'
                | 'averageCompanyRevenue'
                | 'averageCpc'
            )
          }
          className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08]"
        >
          <option value="demandScore">Demanda (0-100)</option>
          <option value="marketSaturation">Saturação (subatendido/moderado/saturado/dominado_por_legados)</option>
          <option value="averageCompanyRevenue">Faturamento Médio</option>
          <option value="averageCpc">CPC Médio (R$)</option>
        </select>

        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={
            category === 'demandScore'
              ? 'Ex: 72'
              : category === 'marketSaturation'
              ? 'subatendido | moderado | saturado'
              : 'Valor observado'
          }
          className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08]"
        />

        <input
          type="text"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="Fonte oficial / pesquisa (obrigatório)"
          className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08]"
        />

        <div className="flex gap-2">
          <input
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="URL da fonte (opcional)"
            className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08]"
          />
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlusCircle className="w-3.5 h-3.5" />}
            <span>Salvar</span>
          </button>
        </div>
      </form>

      {feedback && (
        <div className="text-xs text-blue-700 dark:text-blue-300 bg-blue-500/10 border border-blue-500/20 px-3 py-2 rounded-xl">
          {feedback}
        </div>
      )}
    </div>
  );
}
