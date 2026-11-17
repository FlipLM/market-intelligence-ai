'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function PesquisaPage() {
  const router = useRouter();
  const [nicheQuery, setNicheQuery] = useState('');
  const [cnae, setCnae] = useState('');
  const [segment, setSegment] = useState('');
  const [state, setState] = useState('DF');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!nicheQuery.trim()) {
      setError('Informe o nicho ou segmento a ser auditado.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/niches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nicheQuery: nicheQuery.trim(),
          cnae: cnae.trim() || undefined,
          segment: segment.trim() || undefined,
          state: state || undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Falha ao criar auditoria de nicho');
      }

      router.push(`/nicho/${data.data.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Cadastro & Auditoria de Nicho
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Critérios sem fonte oficial ou dados reais coletados serão marcados como Não verificado.
        </p>
      </div>

      <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-6 space-y-4">
        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Nicho ou Atividade Empresarial:
            </label>
            <input
              type="text"
              value={nicheQuery}
              onChange={(e) => setNicheQuery(e.target.value)}
              placeholder="Ex: Clínicas Odontológicas, Oficinas Mecânicas..."
              className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                CNAE (Opcional):
              </label>
              <input
                type="text"
                value={cnae}
                onChange={(e) => setCnae(e.target.value)}
                placeholder="Ex: 8630-5/04"
                className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Setor (Opcional):
              </label>
              <input
                type="text"
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                placeholder="Ex: Saúde, Automotivo..."
                className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Estado / Região:
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                disabled={loading}
              >
                <option value="DF">Distrito Federal (DF)</option>
                <option value="SP">São Paulo (SP)</option>
                <option value="MG">Minas Gerais (MG)</option>
                <option value="RJ">Rio de Janeiro (RJ)</option>
                <option value="GO">Goiás (GO)</option>
                <option value="BR">Nacional (BR)</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Registrando Auditoria...</span>
              </>
            ) : (
              <span>Criar Dossiê de Nicho</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
