'use client';

import React, { useState } from 'react';
import {
  MapPin,
  User,
  Phone,
  Mail,
  Send,
  MessageSquare,
  X,
  Cpu,
} from 'lucide-react';
import { RecentCompanyLead } from '@/types/recentCompanies';
import { formatProvenanceText } from '@/types/provenance';

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
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState<string | null>(null);

  if (!company) return null;

  const handleExportIndividual = async () => {
    try {
      setExporting(true);
      const res = await fetch('/api/recent-companies/handoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyIds: [company.id] }),
      });
      const data = await res.json();
      setExportResult(data.success ? data.message : `Erro: ${data.message}`);
    } catch (err: unknown) {
      setExportResult(`Erro de rede: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto glass-panel bg-white dark:bg-[#12141c] border border-slate-200 dark:border-white/[0.1] rounded-2xl shadow-2xl p-6 space-y-5">
        <div className="flex items-start justify-between pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                {formatProvenanceText(company.setorRotulo)}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300">
                CNPJ {formatProvenanceText(company.cnpj)}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                {formatProvenanceText(company.rotuloEstagio)} ({formatProvenanceText(company.dataAbertura)})
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {formatProvenanceText(company.nomeFantasia)}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {formatProvenanceText(company.razaoSocial)}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Cpu className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Uso de Sistema Atual
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {company.diagnostico.possuiSistema.fonte}
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-200">
              {company.diagnostico.possuiSistema.status === 'desconhecido'
                ? 'Não verificado'
                : formatProvenanceText(company.diagnostico.possuiSistema)}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
            <div className="bg-slate-50 dark:bg-white/[0.03] p-2.5 rounded-lg border border-slate-200/60 dark:border-white/[0.04]">
              <span className="text-[10px] text-slate-400 block">Situação Cadastral:</span>
              <strong className="text-slate-900 dark:text-white">
                {formatProvenanceText(company.situacaoCadastral)}
              </strong>
            </div>
            <div className="bg-slate-50 dark:bg-white/[0.03] p-2.5 rounded-lg border border-slate-200/60 dark:border-white/[0.04]">
              <span className="text-[10px] text-slate-400 block">Natureza Jurídica:</span>
              <strong className="text-slate-900 dark:text-white">
                {formatProvenanceText(company.naturezaJuridica)}
              </strong>
            </div>
            <div className="bg-slate-50 dark:bg-white/[0.03] p-2.5 rounded-lg border border-slate-200/60 dark:border-white/[0.04]">
              <span className="text-[10px] text-slate-400 block">Capital Social:</span>
              <strong className="text-slate-900 dark:text-white font-mono">
                {company.capitalSocial.valor !== null
                  ? `R$ ${company.capitalSocial.valor.toLocaleString('pt-BR')}`
                  : 'Não verificado'}
              </strong>
            </div>
            <div className="bg-slate-50 dark:bg-white/[0.03] p-2.5 rounded-lg border border-slate-200/60 dark:border-white/[0.04]">
              <span className="text-[10px] text-slate-400 block">Porte:</span>
              <strong className="text-slate-900 dark:text-white">
                {formatProvenanceText(company.porte)}
              </strong>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="glass-panel p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] space-y-2.5">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Localização &amp; CNAE
            </h4>
            <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
              <div>
                <span className="text-slate-400 text-[11px] block">Endereço:</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {formatProvenanceText(company.enderecoCompleto)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">CNAE Principal:</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">
                  {formatProvenanceText(company.cnaePrincipal)}
                </span>{' '}
                - {formatProvenanceText(company.cnaeDescricao)}
              </div>
              {company.cnaesSecundarios.valor && company.cnaesSecundarios.valor.length > 0 && (
                <div>
                  <span className="text-slate-400 text-[11px] block">CNAEs Secundários:</span>
                  <span className="font-mono text-slate-500">
                    {company.cnaesSecundarios.valor.map((c) => c.codigo).join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] space-y-2.5">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              QSA / Titular &amp; Cadastro de Contato
            </h4>
            <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
              <div>
                <span className="text-slate-400 text-[11px] block">Titular / Sócio Principal:</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {company.titularOuSocioPrincipal.valor?.nome || 'Não verificado'}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {company.titularOuSocioPrincipal.valor?.qualificacao ||
                    company.titularOuSocioPrincipal.fonte}
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatProvenanceText(company.contato.telefoneFormatado)}
                </span>
                <span className="text-[10px] text-slate-500 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06]">
                  {formatProvenanceText(company.contato.tipoContato)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {formatProvenanceText(company.contato.email)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {exportResult && (
          <div className="p-3 rounded-xl text-xs bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300">
            {exportResult}
          </div>
        )}

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
              disabled={exporting || company.abordagem.naoContatar}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/[0.08] transition cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{exporting ? 'Exportando...' : 'Exportar para Prospector'}</span>
            </button>

            <button
              onClick={() => onOpenWhatsApp(company)}
              disabled={company.abordagem.naoContatar}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Abordagem WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
