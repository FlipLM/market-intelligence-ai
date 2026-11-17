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
  AlertTriangle,
} from 'lucide-react';
import { RecentCompanyLead, PossuiSistemaStatus } from '@/types/recentCompanies';
import { formatProvenanceText } from '@/types/provenance';
import { FieldProvenanceBadge } from '@/components/ProvenanceBadge';

interface RecentCompanyDetailsModalProps {
  company: RecentCompanyLead | null;
  onClose: () => void;
  onOpenWhatsApp: (company: RecentCompanyLead) => void;
  onCompanyUpdated?: (updated: RecentCompanyLead) => void;
}

export default function RecentCompanyDetailsModal({
  company,
  onClose,
  onOpenWhatsApp,
  onCompanyUpdated,
}: RecentCompanyDetailsModalProps) {
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState<string | null>(null);
  const [savingSystem, setSavingSystem] = useState(false);

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

  const handleUpdatePossuiSistema = async (status: PossuiSistemaStatus) => {
    try {
      setSavingSystem(true);
      const res = await fetch(`/api/recent-companies/${company.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ possuiSistema: status }),
      });
      const data = await res.json();
      if (data.success && data.data && onCompanyUpdated) {
        onCompanyUpdated(data.data);
      }
    } finally {
      setSavingSystem(false);
    }
  };

  const currentSystemValue: PossuiSistemaStatus =
    company.diagnostico.possuiSistema.valor || 'desconhecido';
  const isPossibleAccounting = company.contato.tipoContato.valor === 'possivel_contabilidade';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto glass-panel bg-white dark:bg-[#12141c] border border-slate-200 dark:border-white/[0.1] rounded-2xl shadow-2xl p-6 space-y-5">
        <div className="flex items-start justify-between pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                {formatProvenanceText(company.setorRotulo)}
                <FieldProvenanceBadge field={company.setorRotulo} />
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300">
                CNPJ {formatProvenanceText(company.cnpj)}
                <FieldProvenanceBadge field={company.cnpj} />
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                {formatProvenanceText(company.rotuloEstagio)} ({formatProvenanceText(company.dataAbertura)})
                <FieldProvenanceBadge field={company.dataAbertura} />
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {formatProvenanceText(company.nomeFantasia)}
              </h2>
              <FieldProvenanceBadge field={company.nomeFantasia} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatProvenanceText(company.razaoSocial)}
              </p>
              <FieldProvenanceBadge field={company.razaoSocial} />
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Cpu className="w-4 h-4" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Possui Sistema Instalado?
                  </h3>
                  <FieldProvenanceBadge field={company.diagnostico.possuiSistema} />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {company.diagnostico.possuiSistema.fonte}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {(['desconhecido', 'nao', 'sim'] as PossuiSistemaStatus[]).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  disabled={savingSystem}
                  onClick={() => handleUpdatePossuiSistema(opt)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition ${
                    currentSystemValue === opt
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {opt === 'desconhecido'
                    ? 'Não verificado'
                    : opt === 'nao'
                    ? 'Não possui'
                    : 'Sim, possui'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
            <div className="bg-slate-50 dark:bg-white/[0.03] p-2.5 rounded-lg border border-slate-200/60 dark:border-white/[0.04] space-y-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] text-slate-400">Situação Cadastral:</span>
                <FieldProvenanceBadge field={company.situacaoCadastral} />
              </div>
              <strong className="text-slate-900 dark:text-white block">
                {formatProvenanceText(company.situacaoCadastral)}
              </strong>
            </div>
            <div className="bg-slate-50 dark:bg-white/[0.03] p-2.5 rounded-lg border border-slate-200/60 dark:border-white/[0.04] space-y-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] text-slate-400">Natureza Jurídica:</span>
                <FieldProvenanceBadge field={company.naturezaJuridica} />
              </div>
              <strong className="text-slate-900 dark:text-white block">
                {formatProvenanceText(company.naturezaJuridica)}
              </strong>
            </div>
            <div className="bg-slate-50 dark:bg-white/[0.03] p-2.5 rounded-lg border border-slate-200/60 dark:border-white/[0.04] space-y-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] text-slate-400">Capital Social:</span>
                <FieldProvenanceBadge field={company.capitalSocial} />
              </div>
              <strong className="text-slate-900 dark:text-white font-mono block">
                {company.capitalSocial.valor !== null
                  ? `R$ ${company.capitalSocial.valor.toLocaleString('pt-BR')}`
                  : 'Não verificado'}
              </strong>
            </div>
            <div className="bg-slate-50 dark:bg-white/[0.03] p-2.5 rounded-lg border border-slate-200/60 dark:border-white/[0.04] space-y-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] text-slate-400">Porte:</span>
                <FieldProvenanceBadge field={company.porte} />
              </div>
              <strong className="text-slate-900 dark:text-white block">
                {formatProvenanceText(company.porte)}
              </strong>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="glass-panel p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] space-y-2.5">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Localização &amp; CNAE (Receita + IBGE)
            </h4>
            <div className="space-y-2 text-slate-600 dark:text-slate-300">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px]">Endereço:</span>
                  <FieldProvenanceBadge field={company.enderecoCompleto} />
                </div>
                <span className="font-medium text-slate-900 dark:text-white block mt-0.5">
                  {formatProvenanceText(company.enderecoCompleto)}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px]">Município / Código IBGE:</span>
                  <FieldProvenanceBadge field={company.codigoIbgeMunicipio} />
                </div>
                <span className="font-mono text-slate-900 dark:text-white block mt-0.5">
                  {formatProvenanceText(company.municipio)} - {formatProvenanceText(company.uf)} (IBGE:{' '}
                  {formatProvenanceText(company.codigoIbgeMunicipio)})
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px]">CNAE Principal:</span>
                  <FieldProvenanceBadge field={company.cnaeDescricao} />
                </div>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">
                  {formatProvenanceText(company.cnaePrincipal)}
                </span>{' '}
                - {formatProvenanceText(company.cnaeDescricao)}
              </div>
              {company.cnaesSecundarios.valor && company.cnaesSecundarios.valor.length > 0 && (
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">CNAEs Secundários:</span>
                    <FieldProvenanceBadge field={company.cnaesSecundarios} />
                  </div>
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
              QSA / Titular &amp; Contatos do Cadastro
            </h4>
            <div className="space-y-2 text-slate-600 dark:text-slate-300">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px]">Titular / Sócio Principal:</span>
                  <FieldProvenanceBadge field={company.titularOuSocioPrincipal} />
                </div>
                <span className="font-bold text-slate-900 dark:text-white text-sm block mt-0.5">
                  {company.titularOuSocioPrincipal.valor?.nome || 'Não verificado'}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {company.titularOuSocioPrincipal.valor?.qualificacao ||
                    company.titularOuSocioPrincipal.fonte}
                </span>
              </div>

              {company.qsa.valor && company.qsa.valor.length > 1 && (
                <div>
                  <span className="text-slate-400 text-[11px] block">Demais Sócios (QSA):</span>
                  <ul className="text-[11px] space-y-0.5">
                    {company.qsa.valor.slice(1).map((s, i) => (
                      <li key={i}>
                        {s.nome} ({s.qualificacao})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatProvenanceText(company.contato.telefoneFormatado)}
                </span>
                <FieldProvenanceBadge field={company.contato.telefone1} />
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded inline-flex items-center gap-1 ${
                    isPossibleAccounting
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      : 'bg-slate-100 dark:bg-white/[0.06] text-slate-500'
                  }`}
                >
                  {formatProvenanceText(company.contato.tipoContato)}
                  <FieldProvenanceBadge field={company.contato.tipoContato} />
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {formatProvenanceText(company.contato.email)}
                </span>
                <FieldProvenanceBadge field={company.contato.email} />
              </div>
              {isPossibleAccounting && (
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300 flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{formatProvenanceText(company.contato.motivoTipoContato)}</span>
                </div>
              )}
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
