'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Copy,
  Check,
  ExternalLink,
  X,
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { RecentCompanyLead } from '@/types/recentCompanies';
import { formatProvenanceText } from '@/types/provenance';
import {
  buildStandardWhatsAppMessage,
  evaluateFollowupEligibility,
  findForbiddenOutreachContent,
  getDisplayPhoneForWhatsApp,
  resolveOutreachVariables,
} from '@/lib/outreachMessage';

interface WhatsAppPitchModalProps {
  company: RecentCompanyLead | null;
  onClose: () => void;
  onCompanyUpdated?: (updated: RecentCompanyLead) => void;
}

export default function WhatsAppPitchModal({
  company,
  onClose,
  onCompanyUpdated,
}: WhatsAppPitchModalProps) {
  const [remetente, setRemetente] = useState('Filipe');
  const [includeCongrats, setIncludeCongrats] = useState(false);
  const [mode, setMode] = useState<'primeiro_contato' | 'followup'>('primeiro_contato');
  const [customText, setCustomText] = useState(() =>
    company
      ? buildStandardWhatsAppMessage(company, {
          remetente: 'Filipe',
          includeOpeningCongrats: false,
          mode: 'primeiro_contato',
        })
      : ''
  );
  const [copied, setCopied] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  if (!company) return null;

  const vars = resolveOutreachVariables(company, remetente);
  const followupEligibility = evaluateFollowupEligibility(company);
  const forbiddenHits = findForbiddenOutreachContent(customText);
  const rawPhone = getDisplayPhoneForWhatsApp(company);
  const isBlocked = company.abordagem.naoContatar || company.abordagem.statusContato === 'recusou';
  const isPossibleAccounting = company.contato.tipoContato.valor === 'possivel_contabilidade';

  const regenerateMessage = (
    nextRemetente: string,
    nextCongrats: boolean,
    nextMode: 'primeiro_contato' | 'followup'
  ) => {
    setCustomText(
      buildStandardWhatsAppMessage(company, {
        remetente: nextRemetente,
        includeOpeningCongrats: nextCongrats,
        mode: nextMode,
      })
    );
  };

  const handleCopy = () => {
    if (isBlocked || forbiddenHits.length > 0) return;
    navigator.clipboard.writeText(customText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePatchApproach = async (payload: Record<string, unknown>, feedbackText: string) => {
    try {
      setSavingStatus(true);
      setStatusFeedback(null);
      const res = await fetch(`/api/recent-companies/${company.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setStatusFeedback(`Erro: ${data.error || 'Falha ao atualizar status'}`);
        return;
      }
      if (data.data && onCompanyUpdated) {
        onCompanyUpdated(data.data);
      }
      setStatusFeedback(feedbackText);
    } catch (err: unknown) {
      setStatusFeedback(`Erro: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSavingStatus(false);
    }
  };

  const whatsappUrl =
    rawPhone && !isBlocked && forbiddenHits.length === 0
      ? `https://wa.me/55${rawPhone}?text=${encodeURIComponent(customText)}`
      : '#';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-panel bg-white dark:bg-[#12141c] border border-slate-200 dark:border-white/[0.1] rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="flex items-start justify-between pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Abordagem Manual WhatsApp (Modelo Único Verificável)
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {formatProvenanceText(company.rotuloEstagio)} •{' '}
              {formatProvenanceText(company.bairroRegiao)} • Status:{' '}
              <strong className="font-mono">{company.abordagem.statusContato}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isBlocked && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <Ban className="w-4 h-4 shrink-0" />
            <span>
              <strong>Envio bloqueado (Lista Não Contatar):</strong> este CNPJ/telefone recusou contato ou solicitou saída.
            </span>
          </div>
        )}

        {isPossibleAccounting && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong>Aviso: possível contato de contabilidade.</strong>{' '}
              {formatProvenanceText(company.contato.motivoTipoContato)} O campo{' '}
              <code>{'{nome}'}</code> foi omitido na saudação para evitar abordar a pessoa errada.
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-50 dark:bg-white/[0.02] p-3 rounded-xl border border-slate-200/60 dark:border-white/[0.04] text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
              Titular / Sócio ({company.titularOuSocioPrincipal.status}):
            </span>
            <strong className="text-slate-900 dark:text-white">
              {company.titularOuSocioPrincipal.valor?.nome || 'Não verificado'}
            </strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
              Telefone no Cadastro:
            </span>
            <strong className="text-slate-900 dark:text-white font-mono">
              {formatProvenanceText(company.contato.telefoneFormatado)}
            </strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
              Origem Declarada:
            </span>
            <span className="text-slate-700 dark:text-slate-300">{vars.origem}</span>
          </div>
        </div>

        {/* Controles do modelo único */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <label className="space-y-1 block">
            <span className="text-slate-600 dark:text-slate-300 font-semibold block">
              Seu nome ({'{remetente}'}):
            </span>
            <input
              type="text"
              value={remetente}
              onChange={(e) => {
                setRemetente(e.target.value);
                regenerateMessage(e.target.value, includeCongrats, mode);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08]"
            />
          </label>

          <div className="space-y-1">
            <span className="text-slate-600 dark:text-slate-300 font-semibold block">
              Etapa de envio manual:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setMode('primeiro_contato');
                  regenerateMessage(remetente, includeCongrats, 'primeiro_contato');
                }}
                className={`flex-1 py-2 px-2.5 rounded-xl font-semibold cursor-pointer ${
                  mode === 'primeiro_contato'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300'
                }`}
              >
                1º Contato
              </button>
              <button
                type="button"
                disabled={!followupEligibility.allowed}
                onClick={() => {
                  setMode('followup');
                  regenerateMessage(remetente, includeCongrats, 'followup');
                }}
                title={followupEligibility.reason}
                className={`flex-1 py-2 px-2.5 rounded-xl font-semibold cursor-pointer disabled:opacity-40 ${
                  mode === 'followup'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300'
                }`}
              >
                Follow-up (1x)
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <label className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              disabled={!vars.podeParabenizarAbertura || mode !== 'primeiro_contato'}
              checked={includeCongrats && vars.podeParabenizarAbertura}
              onChange={(e) => {
                setIncludeCongrats(e.target.checked);
                regenerateMessage(remetente, e.target.checked, mode);
              }}
              className="rounded text-blue-600"
            />
            <span>
              Incluir &quot;Parabéns pela abertura&quot;{' '}
              {!vars.podeParabenizarAbertura && '(indisponível: data não verificada)'}
            </span>
          </label>

          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {followupEligibility.reason}
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Mensagem para Revisão (envio 100% manual no WhatsApp):
            </label>
            <span className="text-[11px] text-slate-400 font-mono">
              {customText.length} caracteres
            </span>
          </div>
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            rows={6}
            disabled={isBlocked}
            className="w-full p-3.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 leading-relaxed font-sans resize-none disabled:opacity-50"
          />
          {forbiddenHits.length > 0 && (
            <div className="text-xs text-rose-600 dark:text-rose-400">
              Texto contém termo proibido ({forbiddenHits.join(', ')}). Remova para liberar o envio.
            </div>
          )}
        </div>

        {/* Registro de status manual e lista Não Contatar */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <button
            type="button"
            disabled={savingStatus || isBlocked}
            onClick={() =>
              handlePatchApproach(
                { registrarPrimeiroContato: true },
                '1º contato registrado com timestamp.'
              )
            }
            className="px-3 py-1.5 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 font-semibold cursor-pointer disabled:opacity-40"
          >
            Marcar 1º Contato Enviado
          </button>

          <button
            type="button"
            disabled={savingStatus || !followupEligibility.allowed}
            onClick={() =>
              handlePatchApproach(
                { registrarFollowup: true },
                'Follow-up único registrado (limite máximo atingido).'
              )
            }
            className="px-3 py-1.5 rounded-lg bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-semibold cursor-pointer disabled:opacity-40"
          >
            Marcar Follow-up Enviado
          </button>

          <button
            type="button"
            disabled={savingStatus || isBlocked}
            onClick={() =>
              handlePatchApproach(
                { statusContato: 'respondeu' },
                'Marcado como Respondeu.'
              )
            }
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 font-semibold cursor-pointer disabled:opacity-40"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Respondeu
          </button>

          <button
            type="button"
            disabled={savingStatus || isBlocked}
            onClick={() =>
              handlePatchApproach(
                {
                  statusContato: 'recusou',
                  naoContatar: true,
                  motivoBloqueio: 'Recusou ou pediu para não escrever novamente.',
                },
                'Adicionado à lista "Não Contatar" (CNPJ e telefone bloqueados).'
              )
            }
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600/10 text-rose-600 dark:text-rose-400 font-semibold cursor-pointer disabled:opacity-40"
          >
            <Ban className="w-3.5 h-3.5" /> Recusou / Não Contatar
          </button>
        </div>

        {statusFeedback && (
          <div className="text-xs px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-200">
            {statusFeedback}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-200/80 dark:border-white/[0.08]">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition cursor-pointer"
          >
            Fechar
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopy}
              disabled={isBlocked || forbiddenHits.length > 0}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/[0.08] transition cursor-pointer disabled:opacity-40"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{copied ? 'Copiado!' : 'Copiar Mensagem'}</span>
            </button>

            {rawPhone && !isBlocked && forbiddenHits.length === 0 && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Abrir no WhatsApp (Manual)</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
