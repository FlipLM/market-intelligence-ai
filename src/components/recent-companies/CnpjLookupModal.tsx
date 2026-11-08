"use client";

import React, { useState } from "react";
import { 
  Search, 
  Building2, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  MessageSquare, 
  Check, 
  Loader2, 
  ExternalLink, 
  AlertCircle,
  X,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { RecentCompanyLead } from "@/types/recentCompanies";

interface CnpjLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLead: (lead: RecentCompanyLead) => void;
  onOpenWhatsApp: (lead: RecentCompanyLead) => void;
}

export default function CnpjLookupModal({
  isOpen,
  onClose,
  onAddLead,
  onOpenWhatsApp,
}: CnpjLookupModalProps) {
  if (!isOpen) return null;

  const [cnpjInput, setCnpjInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leadResult, setLeadResult] = useState<RecentCompanyLead | null>(null);
  const [added, setAdded] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLeadResult(null);
    setAdded(false);

    const cleanCnpj = cnpjInput.replace(/\D/g, "");
    if (cleanCnpj.length !== 14) {
      setError("O CNPJ deve conter exatamente 14 dígitos.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/recent-companies/lookup?cnpj=${cleanCnpj}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Não foi possível consultar este CNPJ na Receita Federal.");
      }

      setLeadResult(data.data);
    } catch (err: any) {
      setError(err.message || "Erro de conexão com a API de CNPJ Aberto.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAndClose = () => {
    if (leadResult) {
      onAddLead(leadResult);
      setAdded(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-panel bg-white dark:bg-[#12141c] border border-slate-200 dark:border-white/[0.1] rounded-2xl shadow-2xl p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Search className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Consulta em Tempo Real via API de CNPJ Aberto
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Conexão direta com a base pública da <strong className="text-slate-700 dark:text-slate-300">Receita Federal do Brasil</strong> (via BrasilAPI / MinhaReceita)
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário de Busca */}
        <form onSubmit={handleLookup} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Digite o CNPJ da Empresa:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Ex: 58.391.402/0001-18 ou apenas números"
                  value={cnpjInput}
                  onChange={(e) => setCnpjInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
              <button
                type="submit"
                disabled={loading || cnpjInput.trim() === ""}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>{loading ? "Consultando..." : "Consultar API"}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Mensagem de Erro */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Resultado Retornado da Receita Federal */}
        {leadResult && (
          <div className="glass-panel p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] space-y-4 animate-in fade-in">
            {/* Status Oficial */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-white/[0.06] text-xs">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" /> CNPJ Verificado na Receita Federal
              </span>
              <span className="font-mono text-slate-500 text-[11px]">
                Abertura: {leadResult.dataAbertura} ({leadResult.diasCriacao} dias)
              </span>
            </div>

            {/* Cabeçalho do Lead */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-600/10 text-blue-600 dark:text-blue-400">
                  {leadResult.setorRotulo}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300">
                  {leadResult.cnpj}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  {leadResult.diagnosticoTecnologico.scoreSemSistema}% Chance Sem Sistema
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {leadResult.nomeFantasia}
              </h4>
              <p className="text-xs text-slate-500">{leadResult.razaoSocial}</p>
            </div>

            {/* Dados Cadastrais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-white/[0.02] p-3 rounded-xl border border-slate-200/60 dark:border-white/[0.04]">
              <div>
                <span className="text-slate-400 text-[10px] block">CNAE Principal:</span>
                <strong className="text-slate-900 dark:text-white font-mono">{leadResult.cnaePrincipal}</strong> - {leadResult.cnaeDescricao}
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Localização:</span>
                <span className="text-slate-700 dark:text-slate-300">{leadResult.enderecoCompleto}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Sócio / Decisor:</span>
                <strong className="text-slate-900 dark:text-white">{leadResult.socioPrincipal.nome}</strong> ({leadResult.socioPrincipal.qualificacao})
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Contato:</span>
                <span className="font-mono text-emerald-600 font-semibold">{leadResult.contato.telefoneFormatado}</span>
              </div>
            </div>

            {/* Diagnóstico de Oportunidade */}
            <div className="p-3 rounded-xl bg-amber-500/[0.08] border border-amber-500/20 text-xs space-y-1">
              <span className="font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block text-[10px]">
                Diagnóstico de Entrada Comercial:
              </span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {leadResult.diagnosticoTecnologico.gargaloUrgente}
              </p>
            </div>

            {/* Ações */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2">
              <button
                onClick={() => onOpenWhatsApp(leadResult)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ver Script WhatsApp</span>
              </button>

              <button
                onClick={handleAddAndClose}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer"
              >
                {added ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>{added ? "Adicionado ao Radar!" : "Adicionar ao Radar de Leads"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

