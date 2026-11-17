'use client';

import React, { useState } from 'react';
import { MessageSquare, Copy, Check, ExternalLink, X, AlertTriangle } from 'lucide-react';
import { RecentCompanyLead } from '@/types/recentCompanies';
import { formatProvenanceText } from '@/types/provenance';

interface WhatsAppPitchModalProps {
  company: RecentCompanyLead | null;
  onClose: () => void;
}

function buildDefaultMessage(company: RecentCompanyLead): string {
  const nome =
    company.contato.tipoContato.valor !== 'possivel_contabilidade' &&
    company.titularOuSocioPrincipal.status === 'verificado' &&
    company.titularOuSocioPrincipal.valor?.nome
      ? company.titularOuSocioPrincipal.valor.nome.split(' ')[0]
      : null;

  const saudacao = nome ? `Olá, ${nome}! Tudo bem?` : 'Olá! Tudo bem?';
  const empresa = formatProvenanceText(company.nomeFantasia, 'sua empresa');
  const origem = company.cnpj.fonte || 'cadastro público de empresas / Receita Federal';
  const categoria =
    company.setorRotulo.status !== 'desconhecido' && company.setorRotulo.valor
      ? company.setorRotulo.valor
      : 'negócios como o seu';

  return `${saudacao} Aqui é o Filipe, desenvolvedor aqui de Brasília. Encontrei a ${empresa} pelo ${origem} e gostei do trabalho de vocês. Crio ferramentas simples de gestão (agenda, estoque, orçamentos) para negócios pequenos e estou conversando com donos de ${categoria} para entender como organizam a rotina. Posso te fazer 2 perguntas rápidas? Não é pegadinha de venda. Se não for o momento, sem problema, é só me avisar que não volto a escrever.`;
}

export default function WhatsAppPitchModal({ company, onClose }: WhatsAppPitchModalProps) {
  const [copied, setCopied] = useState(false);
  const [customText, setCustomText] = useState(company ? buildDefaultMessage(company) : '');

  if (!company) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(customText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const rawPhone = (company.contato.telefone1.valor || '').replace(/[^0-9]/g, '');
  const whatsappUrl = rawPhone
    ? `https://wa.me/55${rawPhone}?text=${encodeURIComponent(customText)}`
    : '#';

  const isPossibleAccounting = company.contato.tipoContato.valor === 'possivel_contabilidade';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl glass-panel bg-white dark:bg-[#12141c] border border-slate-200 dark:border-white/[0.1] rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="flex items-start justify-between pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Mensagem de Abordagem Manual — WhatsApp
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {formatProvenanceText(company.rotuloEstagio)} •{' '}
              {formatProvenanceText(company.bairroRegiao)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isPossibleAccounting && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              Atenção: este contato pode pertencer à contabilidade ({formatProvenanceText(company.contato.motivoTipoContato)}).
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50 dark:bg-white/[0.02] p-3 rounded-xl border border-slate-200/60 dark:border-white/[0.04] text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
              Titular / Sócio:
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
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Mensagem para Revisão e Envio Manual:
            </label>
            <span className="text-[11px] text-slate-400 font-mono">
              {customText.length} caracteres
            </span>
          </div>
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            rows={6}
            className="w-full p-3.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 leading-relaxed font-sans resize-none"
          />
        </div>

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
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/[0.08] transition cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{copied ? 'Copiado!' : 'Copiar Mensagem'}</span>
            </button>

            {rawPhone && !company.abordagem.naoContatar && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Abrir no WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
