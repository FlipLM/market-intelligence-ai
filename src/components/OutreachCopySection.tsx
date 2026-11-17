'use client';

import { useState } from 'react';
import { OutreachCopyBriefing } from '@/types/market';
import { Copy, Check } from 'lucide-react';

interface OutreachCopySectionProps {
  copyBriefing: OutreachCopyBriefing;
  nicheName: string;
}

export default function OutreachCopySection({
  copyBriefing,
  nicheName,
}: OutreachCopySectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(copyBriefing.templatePadrao);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-5 space-y-3">
      <div className="pb-2 border-b border-slate-200/60 dark:border-white/[0.06]">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Modelo Padrão de Abordagem ({nicheName})
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">{copyBriefing.disclaimer}</p>
      </div>

      <div className="bg-slate-50 dark:bg-white/[0.03] p-3.5 rounded-xl border border-slate-200/60 dark:border-white/[0.06] space-y-2">
        <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
          {copyBriefing.templatePadrao}
        </p>
        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-white/[0.06]">
          <span className="text-[11px] text-slate-500">{copyBriefing.regraFollowup}</span>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-white/[0.08] text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado' : 'Copiar Modelo'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
