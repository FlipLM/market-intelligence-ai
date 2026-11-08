"use client";

import React, { useState } from "react";
import { 
  Building2, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  Send, 
  MessageSquare, 
  X,
  Cpu
} from "lucide-react";
import { RecentCompanyLead } from "@/types/recentCompanies";

interface RecentCompanyDetailsModalProps {
  company: RecentCompanyLead | null;
  onClose: () => void;
  onOpenWhatsApp: (company: RecentCompanyLead) => void;
}

export default function RecentCompanyDetailsModal({
  company,
  onClose,
  onOpenWhatsApp,
}: RecentCompanyDetailsModalProps) {
  if (!company) return null;

  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState<string | null>(null);

  const handleExportIndividual = async () => {
    try {
      setExporting(true);
      const res = await fetch("/api/recent-companies/handoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyIds: [company.id] }),
      });
      const data = await res.json();
      if (data.success) {
        setExportResult("Lead exportado com sucesso para G:\\Prospector!");
      } else {
        setExportResult(`Erro: ${data.message}`);
      }
    } catch (err: any) {
      setExportResult(`Erro de rede: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  const score = company.diagnosticoTecnologico.scoreSemSistema;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto glass-panel bg-white dark:bg-[#12141c] border border-slate-200 dark:border-white/[0.1] rounded-2xl shadow-2xl p-6 space-y-5">
        {/* Header do Dossiê */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                {company.setorRotulo}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300">
                CNPJ {company.cnpj}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Aberta há {company.diasCriacao} dias ({company.dataAbertura})
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {company.nomeFantasia}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {company.razaoSocial}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Diagnóstico "Sem Sistema" & Oportunidade Comercial */}
        <div className="glass-panel p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] space-y-3 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-transparent">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Cpu className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Diagnóstico de Maturidade Tecnológica
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Por que este lead tem probabilidade de fechar sistema sob demanda
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 bg-white dark:bg-white/[0.04] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08]">
              <span className="text-[11px] text-slate-500 font-medium">Chance de Estar Sem Sistema:</span>
              <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {score}%
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04]">
              <span className="font-semibold text-rose-600 dark:text-rose-400 block mb-1">
                Gargalo Operacional Imediato ({company.diagnosticoTecnologico.estagioDescricao}):
              </span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {company.diagnosticoTecnologico.gargaloUrgente}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
              <span className="font-semibold text-emerald-700 dark:text-emerald-300 block mb-1">
                Solução de Software Sob Demanda Recomendada:
              </span>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                {company.diagnosticoTecnologico.solucaoImediataSugerida}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
            <div className="bg-white dark:bg-white/[0.03] p-2.5 rounded-lg border border-slate-200/60 dark:border-white/[0.04]">
              <span className="text-[10px] text-slate-400 block">Setup Sugerido:</span>
              <strong className="text-slate-900 dark:text-white font-mono text-sm">
                R$ {company.diagnosticoTecnologico.ticketSetupSugerido.toLocaleString("pt-BR")}
              </strong>
            </div>
            <div className="bg-white dark:bg-white/[0.03] p-2.5 rounded-lg border border-slate-200/60 dark:border-white/[0.04]">
              <span className="text-[10px] text-slate-400 block">Mensalidade (ARR):</span>
              <strong className="text-slate-900 dark:text-white font-mono text-sm">
                R$ {company.diagnosticoTecnologico.ticketMensalSugerido.toLocaleString("pt-BR")}/mês
              </strong>
            </div>
            <div className="bg-white dark:bg-white/[0.03] p-2.5 rounded-lg border border-slate-200/60 dark:border-white/[0.04]">
              <span className="text-[10px] text-slate-400 block">Capital Social:</span>
              <strong className="text-slate-900 dark:text-white font-mono text-sm">
                R$ {company.capitalSocial.toLocaleString("pt-BR")}
              </strong>
            </div>
            <div className="bg-white dark:bg-white/[0.03] p-2.5 rounded-lg border border-slate-200/60 dark:border-white/[0.04]">
              <span className="text-[10px] text-slate-400 block">Porte da Empresa:</span>
              <strong className="text-slate-900 dark:text-white text-sm">
                {company.porte}
              </strong>
            </div>
          </div>
        </div>

        {/* Dados Cadastrais & Sócios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Coluna 1: Localização & Atividade */}
          <div className="glass-panel p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] space-y-2.5">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Localização & CNAE Oficial
            </h4>
            <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
              <div>
                <span className="text-slate-400 text-[11px] block">Endereço no DF:</span>
                <span className="font-medium text-slate-900 dark:text-white">{company.enderecoCompleto}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">CNAE Principal:</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">{company.cnaePrincipal}</span> - {company.cnaeDescricao}
              </div>
              {company.cnaesSecundarios && company.cnaesSecundarios.length > 0 && (
                <div>
                  <span className="text-slate-400 text-[11px] block">CNAEs Secundários:</span>
                  <span className="font-mono text-slate-500">{company.cnaesSecundarios.join(", ")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Coluna 2: Decisor & Contato */}
          <div className="glass-panel p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] space-y-2.5">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Decisor & Canais Diretos
            </h4>
            <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
              <div>
                <span className="text-slate-400 text-[11px] block">Sócio Principal / Decisor:</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{company.socioPrincipal.nome}</span>
                <span className="text-[10px] text-slate-500 block">({company.socioPrincipal.qualificacao})</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-mono font-bold text-slate-900 dark:text-white">{company.contato.telefoneFormatado}</span>
                <span className="text-[10px] text-emerald-600 font-semibold px-1.5 py-0.2 rounded bg-emerald-500/10">WhatsApp Ativo</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono text-slate-700 dark:text-slate-300">{company.contato.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback de Exportação */}
        {exportResult && (
          <div className="p-3 rounded-xl text-xs bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300">
            {exportResult}
          </div>
        )}

        {/* Rodapé com Ações */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200/80 dark:border-white/[0.08]">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition cursor-pointer"
          >
            Fechar Dossiê
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleExportIndividual}
              disabled={exporting}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/[0.08] transition cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{exporting ? "Exportando..." : "Exportar para o Prospector"}</span>
            </button>

            <button
              onClick={() => onOpenWhatsApp(company)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ver Script WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

