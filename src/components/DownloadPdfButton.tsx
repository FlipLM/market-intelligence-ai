"use client";

import React, { useState } from "react";
import { FileDown, Printer, Check, Loader2, ChevronDown } from "lucide-react";
import { NicheReport } from "@/types/market";
import { generateNichePdf } from "@/lib/pdfGenerator";

interface DownloadPdfButtonProps {
  niche: NicheReport;
  variant?: "primary" | "secondary" | "compact";
}

export default function DownloadPdfButton({
  niche,
  variant = "primary",
}: DownloadPdfButtonProps) {
  const [loading, setLoading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const handleDownloadDirectPdf = async () => {
    try {
      setLoading(true);
      setShowOptions(false);
      // Pequeno timeout para permitir renderização de estado
      await new Promise((r) => setTimeout(r, 150));
      generateNichePdf(niche);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      // Fallback para impressão se o jsPDF falhar
      window.print();
    } finally {
      setLoading(false);
    }
  };

  const handlePrintPdf = () => {
    setShowOptions(false);
    window.print();
  };

  if (variant === "compact") {
    return (
      <button
        onClick={handleDownloadDirectPdf}
        disabled={loading}
        title="Baixar Relatório em PDF"
        className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/[0.08] transition cursor-pointer"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
        ) : downloaded ? (
          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <FileDown className="w-3.5 h-3.5 text-slate-500" />
        )}
        <span>PDF</span>
      </button>
    );
  }

  return (
    <div className="relative inline-block no-print">
      <div className="inline-flex rounded-xl shadow-sm">
        <button
          onClick={handleDownloadDirectPdf}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-l-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : downloaded ? (
            <Check className="w-4 h-4 text-emerald-200" />
          ) : (
            <FileDown className="w-4 h-4" />
          )}
          <span>{downloaded ? "PDF Baixado!" : loading ? "Gerando PDF..." : "Baixar Relatório em PDF"}</span>
        </button>

        <button
          onClick={() => setShowOptions(!showOptions)}
          className="px-2.5 py-2 rounded-r-xl bg-blue-700 hover:bg-blue-800 text-white border-l border-blue-500/40 transition cursor-pointer"
          title="Opções de Exportação"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {showOptions && (
        <div className="absolute right-0 mt-1.5 w-56 rounded-xl glass-panel bg-white dark:bg-[#12141c] border border-slate-200 dark:border-white/[0.1] shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
          <button
            onClick={handleDownloadDirectPdf}
            className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] flex items-center gap-2 cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <div>
              <div className="font-semibold">Download Direto (.pdf)</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Documento A4 executivo pronto</div>
            </div>
          </button>

          <button
            onClick={handlePrintPdf}
            className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] flex items-center gap-2 cursor-pointer border-t border-slate-100 dark:border-white/[0.04]"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <div>
              <div className="font-semibold">Imprimir / Salvar PDF</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Via diálogo nativo do navegador</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

