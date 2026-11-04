'use client';

import { useState } from 'react';
import { OutreachCopyBriefing } from '@/types/market';
import { 
  Copy, 
  Check
} from 'lucide-react';

interface OutreachCopySectionProps {
  copyBriefing: OutreachCopyBriefing;
  nicheName: string;
}

export default function OutreachCopySection({ copyBriefing, nicheName }: OutreachCopySectionProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="bg-[#141517] border border-white/[0.08] rounded-lg p-5 space-y-5">
      <div className="pb-3 border-b border-white/[0.06]">
        <h3 className="text-sm font-semibold text-[#ededed]">
          Estratégia de Abordagem & Copywriting B2B
        </h3>
        <p className="text-xs text-[#85858b]">
          Roteiros e cadência de WhatsApp para contato com decisores de {nicheName}
        </p>
      </div>

      {/* Perfil do Decisor */}
      <div className="bg-[#19191b] p-3.5 rounded-md border border-white/[0.04] space-y-2">
        <div className="text-[11px] font-mono text-[#85858b] uppercase">
          Perfil do Decisor: <span className="text-[#ededed] font-sans font-medium">{copyBriefing.targetPersona.role}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#a1a1a6]">
          <div>
            <span className="text-[10px] text-[#6e6e73] uppercase font-mono block mb-1">Dores Recorrentes:</span>
            <ul className="space-y-1">
              {copyBriefing.targetPersona.dailyFrustrations.map((f, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-[#6e6e73]">•</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <span className="text-[10px] text-[#6e6e73] uppercase font-mono block mb-1">Gatilhos de Decisão:</span>
            <ul className="space-y-1">
              {copyBriefing.targetPersona.buyingTriggers.map((t, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-500">•</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Cadência de WhatsApp */}
      <div className="space-y-2.5">
        <span className="text-[11px] text-[#85858b] font-medium uppercase font-mono block">
          Cadência de Mensagens para WhatsApp:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {copyBriefing.whatsAppCadence.map((step, idx) => (
            <div key={idx} className="bg-[#19191b] border border-white/[0.04] rounded-md p-3.5 space-y-2.5 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#ededed]">{step.step}</span>
                  <span className="text-[10px] font-mono text-[#6e6e73]">{step.timing}</span>
                </div>
                <p className="text-xs text-[#a1a1a6] bg-[#101113] p-2.5 rounded border border-white/[0.04] leading-relaxed">
                  "{step.messageText}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
                <span className="text-[10px] text-[#6e6e73] truncate max-w-[200px]">{step.purpose}</span>
                <button
                  onClick={() => copyToClipboard(step.messageText, idx)}
                  className="inline-flex items-center gap-1 text-[11px] text-[#ededed] hover:text-white px-2 py-0.5 rounded bg-[#232428] border border-white/[0.06] transition cursor-pointer"
                >
                  {copiedIdx === idx ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-[#85858b]" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Script Cold Call & Objeções */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="bg-[#19191b] p-3.5 rounded-md border border-white/[0.04] space-y-1.5">
          <span className="text-[10px] text-[#85858b] font-mono uppercase block">Ligação com o Decisor (30s):</span>
          <p className="text-[#a1a1a6] leading-relaxed italic">
            "{copyBriefing.coldCallScript.decisionMakerPitch}"
          </p>
        </div>

        <div className="bg-[#19191b] p-3.5 rounded-md border border-white/[0.04] space-y-1.5">
          <span className="text-[10px] text-[#85858b] font-mono uppercase block">Resposta: "Já tenho sistema"</span>
          <p className="text-[#a1a1a6] leading-relaxed">
            "{copyBriefing.objectionsAndRebuttals[0]?.rebuttal}"
          </p>
        </div>
      </div>
    </div>
  );
}
