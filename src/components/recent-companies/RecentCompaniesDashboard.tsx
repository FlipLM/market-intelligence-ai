"use client";

import React, { useState, useMemo } from "react";
import { 
  Building2, 
  Search, 
  Filter, 
  Clock, 
  Send, 
  Download, 
  MessageSquare, 
  Eye, 
  Check, 
  Zap, 
  MapPin, 
  User, 
  Phone, 
  Flame, 
  ChevronRight,
  Sparkles,
  Loader2
} from "lucide-react";
import { 
  RecentCompanyLead, 
  CompanySector, 
  RecentCompaniesStats 
} from "@/types/recentCompanies";
import WhatsAppPitchModal from "./WhatsAppPitchModal";
import RecentCompanyDetailsModal from "./RecentCompanyDetailsModal";
import CnpjLookupModal from "./CnpjLookupModal";

interface RecentCompaniesDashboardProps {
  initialCompanies: RecentCompanyLead[];
  stats: RecentCompaniesStats;
}

export default function RecentCompaniesDashboard({
  initialCompanies,
  stats,
}: RecentCompaniesDashboardProps) {
  // Lista dinâmica de leads (permite adicionar novos CNPJs consultados em tempo real)
  const [companiesList, setCompaniesList] = useState<RecentCompanyLead[]>(initialCompanies);

  // Filtros de estado
  const [selectedDays, setSelectedDays] = useState<number | null>(90); // default: 90 dias (sweet spot)
  const [selectedSector, setSelectedSector] = useState<CompanySector>("todos");
  const [selectedRegion, setSelectedRegion] = useState<string>("todos");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"mais_recentes" | "maior_score" | "maior_capital">("mais_recentes");

  // Seleção de leads para exportação em lote
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  // Modais
  const [activeWhatsAppLead, setActiveWhatsAppLead] = useState<RecentCompanyLead | null>(null);
  const [activeDetailsLead, setActiveDetailsLead] = useState<RecentCompanyLead | null>(null);
  const [isLookupModalOpen, setIsLookupModalOpen] = useState(false);

  // Opções de Janela Temporal
  const timeWindows = [
    { label: "≤ 7 dias", days: 7, badge: "Inauguração" },
    { label: "≤ 15 dias", days: 15, badge: "Abertura" },
    { label: "≤ 30 dias", days: 30, badge: "1º Mês" },
    { label: "≤ 60 dias", days: 60, badge: "2 Meses" },
    { label: "≤ 90 dias", days: 90, badge: "Sweet Spot", popular: true },
    { label: "≤ 180 dias", days: 180, badge: "6 Meses" },
    { label: "≤ 365 dias", days: 365, badge: "1 Ano" },
    { label: "Todos (até 1 ano)", days: null, badge: "Total" },
  ];

  // Opções de Setor
  const sectors: Array<{ id: CompanySector; label: string }> = [
    { id: "todos", label: "Todos os Setores" },
    { id: "alimentacao", label: "Alimentação & Gastronomia" },
    { id: "automotivo", label: "Serviços Automotivos" },
    { id: "saude_estetica", label: "Saúde & Estética" },
    { id: "construcao_obras", label: "Construção & Reformas" },
    { id: "servicos_b2b", label: "Serviços B2B" },
    { id: "comercio_varejo", label: "Comércio Varejista" },
  ];

  // Regiões no DF
  const regions = [
    { id: "todos", label: "Todas as Regiões (DF)" },
    { id: "Águas Claras", label: "Águas Claras" },
    { id: "Asa Sul", label: "Asa Sul" },
    { id: "Asa Norte", label: "Asa Norte" },
    { id: "Taguatinga", label: "Taguatinga" },
    { id: "Ceilândia", label: "Ceilândia" },
    { id: "Sudoeste", label: "Sudoeste" },
    { id: "Guará", label: "Guará" },
    { id: "Vicente Pires", label: "Vicente Pires" },
  ];

  // Adicionar lead pesquisado via API aberta
  const handleAddLead = (newLead: RecentCompanyLead) => {
    setCompaniesList((prev) => {
      if (prev.some((c) => c.cnpj === newLead.cnpj)) {
        return prev;
      }
      return [newLead, ...prev];
    });
    setExportFeedback(`✅ Empresa ${newLead.nomeFantasia} adicionada ao seu radar com sucesso!`);
    setTimeout(() => setExportFeedback(null), 5000);
  };

  // Filtragem dinâmica
  const filteredCompanies = useMemo(() => {
    return companiesList.filter((c) => {
      // Filtro de tempo
      if (selectedDays !== null && c.diasCriacao > selectedDays) {
        return false;
      }

      // Filtro de setor
      if (selectedSector !== "todos" && c.setor !== selectedSector) {
        return false;
      }

      // Filtro de região
      if (selectedRegion !== "todos" && !c.bairroRegiao.toLowerCase().includes(selectedRegion.toLowerCase())) {
        return false;
      }

      // Filtro de busca
      if (search.trim() !== "") {
        const q = search.toLowerCase();
        const matches =
          c.nomeFantasia.toLowerCase().includes(q) ||
          c.razaoSocial.toLowerCase().includes(q) ||
          c.cnpj.includes(q) ||
          c.cnaePrincipal.includes(q) ||
          c.cnaeDescricao.toLowerCase().includes(q) ||
          c.socioPrincipal.nome.toLowerCase().includes(q) ||
          c.bairroRegiao.toLowerCase().includes(q) ||
          c.diagnosticoTecnologico.gargaloUrgente.toLowerCase().includes(q);

        if (!matches) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "mais_recentes") {
        return a.diasCriacao - b.diasCriacao;
      }
      if (sortBy === "maior_score") {
        return b.diagnosticoTecnologico.scoreSemSistema - a.diagnosticoTecnologico.scoreSemSistema;
      }
      if (sortBy === "maior_capital") {
        return b.capitalSocial - a.capitalSocial;
      }
      return 0;
    });
  }, [companiesList, selectedDays, selectedSector, selectedRegion, search, sortBy]);

  // Manipulação de seleção
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredCompanies.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCompanies.map((c) => c.id));
    }
  };

  // Exportar para Prospector
  const handleExportToProspector = async () => {
    try {
      setExporting(true);
      setExportFeedback(null);

      const targetIds = selectedIds.length > 0 ? selectedIds : filteredCompanies.map((c) => c.id);

      const res = await fetch("/api/recent-companies/handoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyIds: targetIds }),
      });

      const data = await res.json();
      if (data.success) {
        setExportFeedback(`✅ ${data.count} empresas exportadas com sucesso para G:\\Prospector!`);
        setTimeout(() => setExportFeedback(null), 5000);
      } else {
        setExportFeedback(`❌ Erro: ${data.message}`);
      }
    } catch (err: any) {
      setExportFeedback(`❌ Erro de comunicação: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  // Download CSV
  const handleDownloadCsv = () => {
    const params = new URLSearchParams();
    if (selectedDays !== null) params.set("tempoMaximoDias", String(selectedDays));
    if (selectedSector !== "todos") params.set("setor", selectedSector);
    if (selectedRegion !== "todos") params.set("regiao", selectedRegion);
    if (search.trim() !== "") params.set("busca", search.trim());
    params.set("format", "csv");

    window.open(`/api/recent-companies?${params.toString()}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Informativo (Tese de Venda para Empresas Novas) */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Radar de Empresas Recém-Abertas (0 a 365 dias)
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-500" /> Distrito Federal
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Comércios & Empresas Recém-Criadas — Leads Sem Sistema Instalado
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
            Identifique empresas abertas nos últimos dias, semanas ou meses. Empresas novas possuem <strong className="text-slate-700 dark:text-slate-200">barreira zero de migração</strong>, não possuem sistemas legados e o contato é direto com o sócio-fundador.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsLookupModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 transition cursor-pointer shadow-xs"
          >
            <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Consultar CNPJ via API Aberta</span>
          </button>

          <button
            onClick={handleExportToProspector}
            disabled={exporting || filteredCompanies.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>
              {selectedIds.length > 0
                ? `Exportar ${selectedIds.length} Selecionadas para Prospector`
                : `Exportar Todas (${filteredCompanies.length}) para Prospector`}
            </span>
          </button>

          <button
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.08] transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Baixar Planilha (CSV)</span>
          </button>
        </div>
      </div>

      {/* Banner de Conexão com API Pública da Receita Federal */}
      <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-emerald-500/10 border border-blue-500/20 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-700 dark:text-slate-300">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span>
            <strong className="text-slate-900 dark:text-white">Conexão Oficial com API de CNPJs Abertos:</strong> consulte qualquer empresa do Brasil em tempo real (dados cadastrais, data exata de abertura, QSA/sócios, CNAE e geração automática de pitch).
          </span>
        </div>
        <button
          onClick={() => setIsLookupModalOpen(true)}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0 text-left sm:text-right cursor-pointer"
        >
          Consultar CNPJ agora &rarr;
        </button>
      </div>

      {/* Feedback de Ações */}
      {exportFeedback && (
        <div className="p-3.5 rounded-xl text-xs font-medium bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 text-blue-800 dark:text-blue-300 animate-in fade-in">
          {exportFeedback}
        </div>
      )}

      {/* Métricas do Radar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="glass-panel p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>≤ 7 Dias (Inauguração)</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Flame className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {stats.criadasUltimos7Dias}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Contato antes de qualquer concorrente
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>≤ 30 Dias (1º Mês)</span>
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {stats.criadasUltimos30Dias}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Fase de caos e planilhas manuais
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>≤ 90 Dias (Sweet Spot)</span>
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {stats.criadasUltimos90Dias}
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            Maior taxa de conversão em software
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Chance Sem Sistema</span>
            <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {stats.taxaMediaSemSistema}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Média de probabilidade do radar
          </div>
        </div>
      </div>

      {/* Painel de Filtros Avançados */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-4">
        {/* Linha 1: Janelas Temporais (O pedido central do usuário: 7d, 15d, 30d, 60d, 90d, 180d, 365d) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Tempo de Criação da Empresa (Idade do CNPJ):
            </span>
            <span className="text-slate-400 text-[11px]">
              Selecione o limite máximo de dias desde a abertura
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {timeWindows.map((tw) => {
              const isSelected = selectedDays === tw.days;
              return (
                <button
                  key={String(tw.days)}
                  onClick={() => setSelectedDays(tw.days)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-sm font-semibold ring-2 ring-blue-500/20"
                      : "bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.06]"
                  }`}
                >
                  <span>{tw.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : tw.popular
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold"
                        : "bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {tw.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Linha 2: Setores & Categorias */}
        <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-white/[0.04]">
          <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            Setor / Ramo de Atividade:
          </span>

          <div className="flex flex-wrap items-center gap-1.5">
            {sectors.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setSelectedSector(sec.id)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  selectedSector === sec.id
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm font-semibold"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.06]"
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>
        </div>

        {/* Linha 3: Barra de Busca, Região do DF e Ordenação */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-200/60 dark:border-white/[0.04]">
          {/* Busca por Texto */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nome, sócio, CNAE ou dor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Filtro de Bairro / Região no DF */}
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {regions.map((reg) => (
                <option key={reg.id} value={reg.id} className="dark:bg-[#12141c]">
                  {reg.label}
                </option>
              ))}
            </select>

            {/* Ordenação */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="mais_recentes" className="dark:bg-[#12141c]">Mais Recentes Primeiro</option>
              <option value="maior_score" className="dark:bg-[#12141c]">Maior Chance Sem Sistema</option>
              <option value="maior_capital" className="dark:bg-[#12141c]">Maior Capital Social</option>
            </select>
          </div>
        </div>
      </div>

      {/* Barra de Ações da Lista */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 px-1">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={filteredCompanies.length > 0 && selectedIds.length === filteredCompanies.length}
              onChange={handleSelectAll}
              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span>Selecionar Todas ({filteredCompanies.length})</span>
          </label>

          {selectedIds.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono font-semibold">
              {selectedIds.length} selecionada(s)
            </span>
          )}
        </div>

        <div className="text-[11px] font-mono">
          Exibindo <strong className="text-slate-900 dark:text-white">{filteredCompanies.length}</strong> empresas qualificadas no DF
        </div>
      </div>

      {/* Grid de Cards dos Leads Recentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCompanies.map((company) => {
          const isSelected = selectedIds.includes(company.id);
          const dias = company.diasCriacao;
          const score = company.diagnosticoTecnologico.scoreSemSistema;

          return (
            <div
              key={company.id}
              className={`glass-panel p-5 rounded-2xl border transition-all duration-150 flex flex-col justify-between space-y-4 shadow-sm hover:border-blue-500/40 ${
                isSelected
                  ? "border-blue-500 dark:border-blue-500 ring-1 ring-blue-500/20 bg-blue-500/[0.02]"
                  : "border-slate-200/80 dark:border-white/[0.08]"
              }`}
            >
              <div className="space-y-3">
                {/* Header do Card com Checkbox, Idade e Score */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(company.id)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 mt-0.5 cursor-pointer"
                    />
                    <span
                      className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        dias <= 7
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                          : dias <= 30
                          ? "bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30"
                          : dias <= 90
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                          : "bg-slate-200 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {dias <= 7 && <Flame className="w-3 h-3 text-emerald-500" />}
                      {dias === 1 ? "Ontem (1 dia)" : `Aberta há ${dias} dias`}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      score >= 90
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : score >= 80
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}
                    title="Probabilidade estimada de NÃO possuir sistema instalado"
                  >
                    {score}% SEM SISTEMA
                  </span>
                </div>

                {/* Título & Setor */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                    {company.nomeFantasia}
                  </h3>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{company.setorRotulo}</span>
                    <span>•</span>
                    <span className="truncate">{company.bairroRegiao}</span>
                  </div>
                </div>

                {/* CNAE e Local */}
                <div className="bg-slate-50 dark:bg-white/[0.02] p-2.5 rounded-xl border border-slate-200/60 dark:border-white/[0.04] text-[11px] space-y-1">
                  <div className="text-slate-700 dark:text-slate-300 line-clamp-1">
                    <strong className="text-slate-900 dark:text-white font-mono">{company.cnaePrincipal}</strong>: {company.cnaeDescricao}
                  </div>
                  <div className="text-slate-500 flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{company.enderecoCompleto}</span>
                  </div>
                </div>

                {/* Decisor Identificado */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 dark:border-white/[0.04]">
                  <div className="flex items-center gap-1.5 truncate">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {company.socioPrincipal.nome}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Phone className="w-3 h-3" />
                    <span>{company.contato.telefoneFormatado}</span>
                  </div>
                </div>

                {/* Dor Crítica da Fase Inicial */}
                <div className="text-xs p-2.5 rounded-xl bg-amber-500/[0.07] border border-amber-500/15 text-slate-700 dark:text-slate-300">
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block mb-0.5">
                    Gargalo Operacional Inicial:
                  </span>
                  <p className="line-clamp-2 leading-relaxed text-[11px]">
                    {company.diagnosticoTecnologico.gargaloUrgente}
                  </p>
                </div>
              </div>

              {/* Botões de Ação do Card */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-white/[0.06] flex items-center justify-between gap-2">
                <button
                  onClick={() => setActiveDetailsLead(company)}
                  className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-semibold py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/[0.06] transition cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Dossiê</span>
                </button>

                <button
                  onClick={() => setActiveWhatsAppLead(company)}
                  className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-semibold py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Script WhatsApp</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="glass-panel p-10 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] text-center space-y-3">
          <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Nenhuma empresa encontrada para os filtros selecionados
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Tente expandir o limite de tempo (ex: ≤ 180 ou ≤ 365 dias) ou selecionar "Todos os Setores".
          </p>
        </div>
      )}

      {/* Modais de Script WhatsApp, Detalhes e Consulta de CNPJ em Tempo Real */}
      <CnpjLookupModal
        isOpen={isLookupModalOpen}
        onClose={() => setIsLookupModalOpen(false)}
        onAddLead={handleAddLead}
        onOpenWhatsApp={(lead) => {
          setIsLookupModalOpen(false);
          setActiveWhatsAppLead(lead);
        }}
      />

      <WhatsAppPitchModal
        company={activeWhatsAppLead}
        onClose={() => setActiveWhatsAppLead(null)}
      />

      <RecentCompanyDetailsModal
        company={activeDetailsLead}
        onClose={() => setActiveDetailsLead(null)}
        onOpenWhatsApp={(company) => {
          setActiveDetailsLead(null);
          setActiveWhatsAppLead(company);
        }}
      />
    </div>
  );
}

