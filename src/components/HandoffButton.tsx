'use client';

import { useState } from 'react';
import { Send, Check, Copy } from 'lucide-react';

interface HandoffButtonProps {
  nicheId: string;
  nicheName: string;
}

export default function HandoffButton({ nicheId, nicheName }: HandoffButtonProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/niches/${nicheId}/handoff`, {
        method: 'POST',
      });
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({
        success: false,
        message: `Erro: ${err.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const copyScript = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleExport}
        disabled={loading}
        className="inline-flex items-center gap-2 h-9 px-3.5 rounded-md bg-[#ededed] hover:bg-white text-[#0c0d0e] font-medium text-xs transition duration-150 cursor-pointer disabled:opacity-50"
      >
        <Send className="w-3.5 h-3.5" />
        {loading ? 'Transmitindo...' : 'Exportar para o Prospector B2B'}
      </button>

      {result && (
        <div className="p-3 rounded-md bg-[#19191b] border border-white/[0.08] text-xs space-y-2">
          <div className="flex items-center gap-2 text-[#ededed] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{result.message}</span>
          </div>

          {result.data && (
            <div className="bg-[#101113] p-2.5 rounded border border-white/[0.04] space-y-1.5 text-xs text-[#a1a1a6]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#85858b]">Google Maps Query:</span>
                <span className="text-white font-mono">{result.data.googleMapsQuery}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
                <span className="text-[11px] font-mono text-[#85858b]">Pitch Inicial WhatsApp:</span>
                <button
                  onClick={() => copyScript(result.data.suggestedPitchWhatsApp)}
                  className="text-[11px] text-[#ededed] hover:underline cursor-pointer"
                >
                  {copied ? 'Copiado!' : 'Copiar Texto'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
