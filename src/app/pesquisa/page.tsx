"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Sparkles, MapPin, Zap } from "lucide-react";

export default function PesquisaPage() {
  const router = useRouter();
  const [nicheQuery, setNicheQuery] = useState("");
  const [segment, setSegment] = useState("");
  const [state, setState] = useState("DF");
  const [loading, setLoading] = useState(false);
  const [autoDiscovering, setAutoDiscovering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<string | null>(null);

  const predefinedNiches = [
    "Sociedades de Advocacia & Consultorias Tributárias",
    "Clínicas Odontológicas e Estéticas de Alto Padrão",
    "Pequenas Construtoras e Reformas Comerciais no DF",
    "Distribuidoras Atacadistas do SIA e Ceasa-DF",
    "Oficinas Mecânicas de Frotas e Centros Automotivos no DF",
    "Laboratórios de Análises Clínicas e Diagnóstico",
  ];

  const handleAutoDiscovery = async (targetState = "DF") => {
    setAutoDiscovering(true);
    setLoading(true);
    setError(null);
    setActiveStep(`Executando varredura setorial para ${targetState}...`);

    try {
      setTimeout(() => setActiveStep("Mapeando CNAEs e densidade empresarial no IBGE..."), 1000);
      setTimeout(() => setActiveStep("Analisando leilões de busca e concorrência no Google Ads..."), 2000);
      setTimeout(() => setActiveStep("Auditoria técnica de TI e briefings de abordagem..."), 3000);

      const res = await fetch("/api/niches/discover-region", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: targetState }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Falha ao processar pesquisa regional");
      }

      router.push("/");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      setAutoDiscovering(false);
      setActiveStep(null);
    }
  };

  const handleSearch = async (queryToUse?: string) => {
    const q = queryToUse || nicheQuery;
    if (!q.trim()) {
      setError("Informe o nicho ou segmento a ser investigado.");
      return;
    }

    setLoading(true);
    setError(null);
    setActiveStep("Coletando indicadores de mercado e demanda...");

    try {
      const res = await fetch("/api/niches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nicheQuery: q,
          segment: segment || undefined,
          state: state || undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Falha ao processar nicho");
      }

      router.push(`/nicho/${data.data.id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      setActiveStep(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Pesquisa & Qualificação de Nicho
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Audite qualquer segmento empresarial antes de iniciar a prospecção de software
        </p>
      </div>

      {/* Auto-Discovery DF */}
      <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
            <Zap className="w-4 h-4" />
            <span>Descoberta Automática de Nichos (Distrito Federal)</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed">
            Avalia simultaneamente os 5 setores com maior poder de investimento e carência de tecnologia em Brasília e entorno.
          </p>
        </div>

        <button
          onClick={() => handleAutoDiscovery("DF")}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-sm transition cursor-pointer disabled:opacity-50 shrink-0"
        >
          {autoDiscovering ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Analisando DF...</span>
            </>
          ) : (
            <span>Executar Varredura DF</span>
          )}
        </button>
      </div>

      {autoDiscovering && activeStep && (
        <div className="glass-panel p-3.5 rounded-xl border border-slate-200/80 dark:border-white/[0.06] text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2.5">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
          <span>{activeStep}</span>
        </div>
      )}

      {/* Formulário de Busca Específica */}
      <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-6 space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Investigação de Nicho Personalizado
        </div>

        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Nicho ou Atividade Empresarial:
            </label>
            <input
              type="text"
              value={nicheQuery}
              onChange={(e) => setNicheQuery(e.target.value)}
              placeholder="Ex: Clínicas de Fisioterapia, Oficinas Mecânicas de Frotas, Restaurantes..."
              className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Setor (Opcional):
              </label>
              <input
                type="text"
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                placeholder="Ex: Saúde, Jurídico, Logística..."
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
                <option value="PR">Paraná (PR)</option>
                <option value="RS">Rio Grande do Sul (RS)</option>
                <option value="SC">Santa Catarina (SC)</option>
                <option value="GO">Goiás (GO)</option>
                <option value="BR">Nacional (Brasil)</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading && !autoDiscovering ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Auditorando Mercado...</span>
              </>
            ) : (
              <span>Auditar Nicho</span>
            )}
          </button>
        </div>
      </div>

      {/* Sugestões de Segmentos */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
          Setores com Forte Demanda por Automação:
        </span>
        <div className="flex flex-wrap gap-2">
          {predefinedNiches.map((n, i) => (
            <button
              key={i}
              onClick={() => {
                setNicheQuery(n);
                handleSearch(n);
              }}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-lg glass-panel hover:border-blue-500/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
