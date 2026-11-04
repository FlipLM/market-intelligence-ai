"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronRight, Filter, ArrowUpDown } from "lucide-react";
import { NicheReport } from "@/types/market";
import DownloadPdfButton from "@/components/DownloadPdfButton";

interface NichesCatalogTableProps {
  niches: NicheReport[];
}

export function NichesCatalogTable({ niches }: NichesCatalogTableProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [sortBy, setSortBy] = useState<"score" | "setup" | "monthly">("score");

  const categories = [
    { id: "todos", label: "Todos os Nichos" },
    { id: "saude", label: "Saúde & Estética" },
    { id: "automotivo", label: "Automotivo & Frotas" },
    { id: "construcao", label: "Construção & Obras" },
    { id: "juridico", label: "Jurídico & Gestão B2B" },
    { id: "distribuicao", label: "Atacado & Distribuição" },
    { id: "facilities", label: "Engenharia & Facilities" },
  ];

  const filteredNiches = useMemo(() => {
    return niches.filter((n) => {
      const matchesSearch =
        search.trim() === "" ||
        n.basicInfo.name.toLowerCase().includes(search.toLowerCase()) ||
        n.basicInfo.segment.toLowerCase().includes(search.toLowerCase()) ||
        n.opportunities.some(
          (o) =>
            o.title.toLowerCase().includes(search.toLowerCase()) ||
            o.operationalProblem.toLowerCase().includes(search.toLowerCase())
        );

      if (!matchesSearch) return false;

      if (selectedCategory === "todos") return true;

      const seg = (n.basicInfo.segment + " " + n.basicInfo.name).toLowerCase();
      if (selectedCategory === "saude") {
        return (
          seg.includes("saúde") ||
          seg.includes("estética") ||
          seg.includes("clínica") ||
          seg.includes("médic") ||
          seg.includes("odonto") ||
          seg.includes("pet") ||
          seg.includes("laborat")
        );
      }
      if (selectedCategory === "automotivo") {
        return (
          seg.includes("oficin") ||
          seg.includes("auto") ||
          seg.includes("mecân") ||
          seg.includes("frota") ||
          seg.includes("guincho") ||
          seg.includes("pneu")
        );
      }
      if (selectedCategory === "construcao") {
        return (
          seg.includes("constr") ||
          seg.includes("obra") ||
          seg.includes("engenh") ||
          seg.includes("reform") ||
          seg.includes("arquitet") ||
          seg.includes("impermeabil")
        );
      }
      if (selectedCategory === "juridico") {
        return (
          seg.includes("advoc") ||
          seg.includes("juríd") ||
          seg.includes("contab") ||
          seg.includes("consult") ||
          seg.includes("fiscal") ||
          seg.includes("rh")
        );
      }
      if (selectedCategory === "distribuicao") {
        return (
          seg.includes("distrib") ||
          seg.includes("atacad") ||
          seg.includes("aliment") ||
          seg.includes("bebida") ||
          seg.includes("hortifruti")
        );
      }
      if (selectedCategory === "facilities") {
        return (
          seg.includes("facil") ||
          seg.includes("seguran") ||
          seg.includes("limpeza") ||
          seg.includes("solar") ||
          seg.includes("poço") ||
          seg.includes("climatiz") ||
          seg.includes("combate a inc")
        );
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "score") {
        return b.scoring.finalScore - a.scoring.finalScore;
      }
      if (sortBy === "setup") {
        return (
          b.commercialViability.recommendedPricing.implementationSetupMax -
          a.commercialViability.recommendedPricing.implementationSetupMax
        );
      }
      if (sortBy === "monthly") {
        return (
          b.commercialViability.recommendedPricing.monthlyFeeMax -
          a.commercialViability.recommendedPricing.monthlyFeeMax
        );
      }
      return 0;
    });
  }, [niches, search, selectedCategory, sortBy]);

  return (
    <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] overflow-hidden shadow-sm">
      {/* Header com Busca e Filtros */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-white/[0.08] space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Catálogo Top 50 Nichos Qualificados (Distrito Federal & Brasil)
              </h2>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                {filteredNiches.length} exibidos
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Setores analisados com dores operacionais reais, métricas do IBGE e estimativas de ticket
            </p>
          </div>

          {/* Campo de Busca Rápida */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filtrar por nicho ou dor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Pílulas de Categoria & Ordenação */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.06]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-medium mr-1">Ordenar:</span>
            <button
              onClick={() => setSortBy("score")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                sortBy === "score"
                  ? "bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white font-bold"
                  : "hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              Score Geral
            </button>
            <span>•</span>
            <button
              onClick={() => setSortBy("setup")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                sortBy === "setup"
                  ? "bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white font-bold"
                  : "hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              Maior Setup
            </button>
            <span>•</span>
            <button
              onClick={() => setSortBy("monthly")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                sortBy === "monthly"
                  ? "bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white font-bold"
                  : "hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              Maior Recorrência
            </button>
          </div>
        </div>
      </div>

      {/* Tabela Responsiva */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-50/90 dark:bg-white/[0.02] uppercase text-[10px] font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-white/[0.08] tracking-wider">
            <tr>
              <th className="py-3 px-4">#</th>
              <th className="py-3 px-4">Nicho & Categoria</th>
              <th className="py-3 px-3 text-center">Região</th>
              <th className="py-3 px-3 text-center">Score Geral</th>
              <th className="py-3 px-4">Dor Operacional Identificada</th>
              <th className="py-3 px-4">Setup Recomendado</th>
              <th className="py-3 px-4">Recorrência Estimada</th>
              <th className="py-3 px-3 text-center">Ação</th>
              <th className="py-3 px-4 text-right">Dossiê</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60 dark:divide-white/[0.04]">
            {filteredNiches.map((niche, idx) => {
              const regState = niche.basicInfo.geographicScope.state || "DF";
              const primaryOpp = niche.opportunities[0];
              const score = niche.scoring.finalScore;

              return (
                <tr
                  key={niche.id}
                  className="hover:bg-slate-100/50 dark:hover:bg-white/[0.02] transition"
                >
                  <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                    #{idx + 1}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {niche.basicInfo.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {niche.basicInfo.segment}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      {regState}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`font-mono font-bold text-sm px-2 py-0.5 rounded ${
                        score >= 85
                          ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                          : score >= 75
                          ? "text-blue-600 dark:text-blue-400 bg-blue-500/10"
                          : "text-amber-600 dark:text-amber-400 bg-amber-500/10"
                      }`}
                    >
                      {score}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs text-slate-600 dark:text-slate-400 truncate">
                    {primaryOpp?.operationalProblem || "Processos manuais e ausência de automação"}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    R$ {niche.commercialViability.recommendedPricing.implementationSetupMin.toLocaleString("pt-BR")} - {niche.commercialViability.recommendedPricing.implementationSetupMax.toLocaleString("pt-BR")}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    R$ {niche.commercialViability.recommendedPricing.monthlyFeeMin.toLocaleString("pt-BR")}/mês
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold whitespace-nowrap ${
                        niche.recommendedAction === "avancar_imediatamente"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {niche.recommendedAction === "avancar_imediatamente" ? "Avançar" : "Piloto"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <DownloadPdfButton niche={niche} variant="compact" />
                      <Link
                        href={`/nicho/${niche.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-blue-600/10 dark:bg-blue-600/15 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-400 border border-blue-500/20 transition cursor-pointer"
                      >
                        Dossiê <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

