'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Building2,
  Search,
  Filter,
  Clock,
  Send,
  Download,
  MessageSquare,
  Eye,
  MapPin,
  User,
  Phone,
  Flame,
  Loader2,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import {
  RecentCompanyLead,
  CompanySector,
  RecentCompaniesStats,
  TipoContato,
} from '@/types/recentCompanies';
import { formatProvenanceText } from '@/types/provenance';
import { FieldProvenanceBadge } from '@/components/ProvenanceBadge';
import WhatsAppPitchModal from './WhatsAppPitchModal';
import RecentCompanyDetailsModal from './RecentCompanyDetailsModal';
import CnpjLookupModal from './CnpjLookupModal';

interface RecentCompaniesDashboardProps {
  initialCompanies: RecentCompanyLead[];
  stats: RecentCompaniesStats;
}

export default function RecentCompaniesDashboard({
  initialCompanies,
}: RecentCompaniesDashboardProps) {
  const [companiesList, setCompaniesList] = useState<RecentCompanyLead[]>(initialCompanies);

  const [selectedDays, setSelectedDays] = useState<number | null>(null);
  const [selectedSector, setSelectedSector] = useState<CompanySector>('todos');
  const [selectedRegion, setSelectedRegion] = useState<string>('todos');
  const [selectedContactType, setSelectedContactType] = useState<TipoContato | 'todos'>('todos');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'mais_recentes' | 'maior_capital' | 'razao_social'>('mais_recentes');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(30);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  const [activeWhatsAppLead, setActiveWhatsAppLead] = useState<RecentCompanyLead | null>(null);
  const [activeDetailsLead, setActiveDetailsLead] = useState<RecentCompanyLead | null>(null);
  const [isLookupModalOpen, setIsLookupModalOpen] = useState(false);

  const dynamicStats = useMemo(() => {
    const total = companiesList.length;
    const c7 = companiesList.filter((c) => c.diasCriacao.valor !== null && c.diasCriacao.valor <= 7).length;
    const c30 = companiesList.filter((c) => c.diasCriacao.valor !== null && c.diasCriacao.valor <= 30).length;
    const possiveisContabilidades = companiesList.filter(
      (c) => c.contato.tipoContato.valor === 'possivel_contabilidade'
    ).length;
    return {
      total,
      criadasUltimos7Dias: c7,
      criadasUltimos30Dias: c30,
      possiveisContabilidades,
    };
  }, [companiesList]);

  const timeWindows = [
    { label: '≤ 7 dias', days: 7 },
    { label: '≤ 15 dias', days: 15 },
    { label: '≤ 30 dias', days: 30 },
    { label: '≤ 60 dias', days: 60 },
    { label: '≤ 90 dias', days: 90 },
    { label: '≤ 180 dias', days: 180 },
    { label: '≤ 365 dias', days: 365 },
    { label: 'Todos', days: null },
  ];

  const sectors: Array<{ id: CompanySector; label: string }> = [
    { id: 'todos', label: 'Todos os Setores' },
    { id: 'alimentacao', label: 'Alimentação & Gastronomia' },
    { id: 'automotivo', label: 'Serviços Automotivos' },
    { id: 'saude_estetica', label: 'Saúde & Estética' },
    { id: 'construcao_obras', label: 'Construção & Reformas' },
    { id: 'servicos_b2b', label: 'Serviços B2B' },
    { id: 'comercio_varejo', label: 'Comércio Varejista' },
    { id: 'outros', label: 'Outros Setores' },
  ];

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDays, selectedSector, selectedRegion, selectedContactType, search, sortBy]);

  const refreshFromServer = async () => {
    try {
      const res = await fetch('/api/recent-companies');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCompaniesList(data.data);
      }
    } catch {
      // mantém lista atual em memória caso falhe
    }
  };

  const handleAddLead = (newLead: RecentCompanyLead) => {
    setCompaniesList((prev) => {
      const filtered = prev.filter((c) => c.id !== newLead.id);
      return [newLead, ...filtered];
    });
    setExportFeedback(`Empresa ${formatProvenanceText(newLead.nomeFantasia)} salva no radar.`);
    setTimeout(() => setExportFeedback(null), 5000);
    void refreshFromServer();
  };

  const handleBatchImported = (leads: RecentCompanyLead[]) => {
    setExportFeedback(`${leads.length} empresa(s) importada(s) e classificada(s).`);
    setTimeout(() => setExportFeedback(null), 6000);
    void refreshFromServer();
  };

  const handleCompanyUpdated = (updated: RecentCompanyLead) => {
    setCompaniesList((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    if (activeDetailsLead?.id === updated.id) {
      setActiveDetailsLead(updated);
    }
    if (activeWhatsAppLead?.id === updated.id) {
      setActiveWhatsAppLead(updated);
    }
  };

  const filteredCompanies = useMemo(() => {
    return companiesList
      .filter((c) => {
        if (selectedDays !== null) {
          if (c.diasCriacao.valor === null || c.diasCriacao.valor > selectedDays) {
            return false;
          }
        }
        if (selectedSector !== 'todos' && c.setor.valor !== selectedSector) {
          return false;
        }
        if (selectedContactType !== 'todos') {
          const val = c.contato.tipoContato.valor || 'desconhecido';
          if (val !== selectedContactType) return false;
        }
        if (selectedRegion !== 'todos') {
          const regionStr = `${formatProvenanceText(c.bairroRegiao, '')} ${formatProvenanceText(c.municipio, '')}`.toLowerCase();
          if (!regionStr.includes(selectedRegion.toLowerCase())) {
            return false;
          }
        }
        if (search.trim() !== '') {
          const q = search.toLowerCase();
          const matches =
            formatProvenanceText(c.nomeFantasia, '').toLowerCase().includes(q) ||
            formatProvenanceText(c.razaoSocial, '').toLowerCase().includes(q) ||
            formatProvenanceText(c.cnpj, '').includes(q) ||
            formatProvenanceText(c.cnaePrincipal, '').includes(q) ||
            formatProvenanceText(c.cnaeDescricao, '').toLowerCase().includes(q) ||
            (c.titularOuSocioPrincipal.valor?.nome || '').toLowerCase().includes(q) ||
            formatProvenanceText(c.bairroRegiao, '').toLowerCase().includes(q);
          if (!matches) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'mais_recentes') {
          return (
            (a.diasCriacao.valor ?? Number.MAX_SAFE_INTEGER) -
            (b.diasCriacao.valor ?? Number.MAX_SAFE_INTEGER)
          );
        }
        if (sortBy === 'maior_capital') {
          return (b.capitalSocial.valor ?? -1) - (a.capitalSocial.valor ?? -1);
        }
        return formatProvenanceText(a.razaoSocial, '').localeCompare(
          formatProvenanceText(b.razaoSocial, '')
        );
      });
  }, [companiesList, selectedDays, selectedSector, selectedRegion, selectedContactType, search, sortBy]);

  const totalPages = Math.ceil(filteredCompanies.length / pageSize) || 1;
  const paginatedCompanies = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCompanies.slice(start, start + pageSize);
  }, [filteredCompanies, currentPage, pageSize]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleExportToProspector = async () => {
    try {
      setExporting(true);
      setExportFeedback(null);
      const targetIds = selectedIds.length > 0 ? selectedIds : filteredCompanies.map((c) => c.id);
      const res = await fetch('/api/recent-companies/handoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyIds: targetIds }),
      });
      const data = await res.json();
      setExportFeedback(data.success ? data.message : `Erro: ${data.message}`);
    } catch (err: unknown) {
      setExportFeedback(`Erro: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadCsv = () => {
    const params = new URLSearchParams();
    if (selectedDays !== null) params.set('tempoMaximoDias', String(selectedDays));
    if (selectedSector !== 'todos') params.set('setor', selectedSector);
    if (selectedRegion !== 'todos') params.set('regiao', selectedRegion);
    if (search.trim() !== '') params.set('busca', search.trim());
    params.set('format', 'csv');
    window.open(`/api/recent-companies?${params.toString()}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Radar de Empresas com Proveniência
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-500" /> BrasilAPI / MinhaReceita + IBGE
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Empresas Consultadas em Fontes Públicas
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
            Exibe apenas CNPJs consultados em APIs oficiais. Uso de sistema é &quot;Não verificado&quot; até confirmação comercial.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsLookupModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition cursor-pointer shadow-xs"
          >
            <Search className="w-4 h-4" />
            <span>Consultar / Importar CNPJs</span>
          </button>

          <button
            onClick={handleExportToProspector}
            disabled={exporting || filteredCompanies.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] transition cursor-pointer disabled:opacity-50"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Exportar para Prospector</span>
          </button>

          <button
            onClick={handleDownloadCsv}
            disabled={filteredCompanies.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] transition cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Baixar CSV</span>
          </button>
        </div>
      </div>

      {exportFeedback && (
        <div className="p-3.5 rounded-xl text-xs font-medium bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 text-blue-800 dark:text-blue-300">
          {exportFeedback}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="glass-panel p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] space-y-1">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-medium">Total Real na Base</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {dynamicStats.total}
          </div>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] space-y-1">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-medium">≤ 7 Dias</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {dynamicStats.criadasUltimos7Dias}
          </div>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] space-y-1">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-medium">≤ 30 Dias</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {dynamicStats.criadasUltimos30Dias}
          </div>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] space-y-1">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-medium">Possível Contabilidade</div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {dynamicStats.possiveisContabilidades}
          </div>
        </div>
      </div>

      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-4">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <Clock className="w-3.5 h-3.5 text-blue-600 mr-1" />
          {timeWindows.map((tw) => {
            const isSelected = selectedDays === tw.days;
            return (
              <button
                key={String(tw.days)}
                onClick={() => setSelectedDays(tw.days)}
                className={`text-xs px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300'
                }`}
              >
                {tw.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/60 dark:border-white/[0.04]">
          <Filter className="w-3.5 h-3.5 text-slate-500 mr-1" />
          {sectors.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setSelectedSector(sec.id)}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                selectedSector === sec.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-200/60 dark:border-white/[0.04]">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nome, CNPJ, sócio ou CNAE..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedContactType}
              onChange={(e) => setSelectedContactType(e.target.value as TipoContato | 'todos')}
              className="text-xs px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300"
            >
              <option value="todos">Todos os Contatos</option>
              <option value="provavel_empresa">Provável Empresa</option>
              <option value="possivel_contabilidade">Possível Contabilidade</option>
              <option value="desconhecido">Tipo Desconhecido</option>
            </select>

            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300"
            >
              <option value="todos">Todas as Regiões</option>
              <option value="Brasília">Brasília</option>
              <option value="Águas Claras">Águas Claras</option>
              <option value="Taguatinga">Taguatinga</option>
              <option value="Ceilândia">Ceilândia</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'mais_recentes' | 'maior_capital' | 'razao_social')}
              className="text-xs px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300"
            >
              <option value="mais_recentes">Mais Recentes Primeiro</option>
              <option value="maior_capital">Maior Capital Social</option>
              <option value="razao_social">Razão Social (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedCompanies.map((company) => {
          const isSelected = selectedIds.includes(company.id);
          const dias = company.diasCriacao.valor;
          const isAccounting = company.contato.tipoContato.valor === 'possivel_contabilidade';

          return (
            <div
              key={company.id}
              className={`glass-panel p-5 rounded-2xl border transition-all duration-150 flex flex-col justify-between space-y-4 shadow-sm ${
                isSelected
                  ? 'border-blue-500 ring-1 ring-blue-500/20'
                  : 'border-slate-200/80 dark:border-white/[0.08]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(company.id)}
                      className="rounded text-blue-600 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 flex items-center gap-1">
                      {dias !== null && dias <= 7 && <Flame className="w-3 h-3 text-emerald-500" />}
                      {formatProvenanceText(company.rotuloEstagio)}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300">
                    {company.abordagem.naoContatar ? (
                      'Não Contatar'
                    ) : (
                      <>
                        <span>
                          Sistema:{' '}
                          {company.diagnostico.possuiSistema.status === 'desconhecido'
                            ? 'Não verificado'
                            : formatProvenanceText(company.diagnostico.possuiSistema)}
                        </span>
                        <FieldProvenanceBadge field={company.diagnostico.possuiSistema} />
                      </>
                    )}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                    {formatProvenanceText(company.nomeFantasia)}
                  </h3>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {formatProvenanceText(company.setorRotulo)}
                    </span>
                    <span>•</span>
                    <span className="truncate">{formatProvenanceText(company.bairroRegiao)}</span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-white/[0.02] p-2.5 rounded-xl border border-slate-200/60 dark:border-white/[0.04] text-[11px] space-y-1">
                  <div className="text-slate-700 dark:text-slate-300 line-clamp-1">
                    <strong className="font-mono">{formatProvenanceText(company.cnaePrincipal)}</strong>:{' '}
                    {formatProvenanceText(company.cnaeDescricao)}
                  </div>
                  <div className="text-slate-500 flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{formatProvenanceText(company.enderecoCompleto)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 dark:border-white/[0.04] gap-2">
                  <div className="flex items-center gap-1.5 truncate">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {company.titularOuSocioPrincipal.valor?.nome || 'Não verificado'}
                    </span>
                    <FieldProvenanceBadge field={company.titularOuSocioPrincipal} />
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-slate-700 dark:text-slate-300 shrink-0">
                    {isAccounting && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                    <Phone className="w-3 h-3" />
                    <span>{formatProvenanceText(company.contato.telefoneFormatado)}</span>
                    <FieldProvenanceBadge field={company.contato.tipoContato} />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-white/[0.06] flex items-center justify-between gap-2">
                <button
                  onClick={() => setActiveDetailsLead(company)}
                  className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-semibold py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] text-slate-700 dark:text-slate-200 transition cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Dossiê</span>
                </button>

                <button
                  onClick={() => setActiveWhatsAppLead(company)}
                  disabled={company.abordagem.naoContatar}
                  className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-semibold py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
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
            Nenhuma empresa real cadastrada ainda
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Use &quot;Consultar / Importar CNPJs&quot; para consultar CNPJs reais via BrasilAPI / MinhaReceita e IBGE.
          </p>
        </div>
      )}

      {filteredCompanies.length > pageSize && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-white/[0.04] disabled:opacity-40"
          >
            ‹ Anterior
          </button>
          <span className="text-xs font-mono">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-white/[0.04] disabled:opacity-40"
          >
            Próxima ›
          </button>
        </div>
      )}

      <CnpjLookupModal
        isOpen={isLookupModalOpen}
        onClose={() => setIsLookupModalOpen(false)}
        onAddLead={handleAddLead}
        onBatchImported={handleBatchImported}
        onOpenWhatsApp={(lead) => {
          setIsLookupModalOpen(false);
          setActiveWhatsAppLead(lead);
        }}
      />

      <WhatsAppPitchModal
        key={activeWhatsAppLead?.id ?? 'closed'}
        company={activeWhatsAppLead}
        onClose={() => setActiveWhatsAppLead(null)}
        onCompanyUpdated={handleCompanyUpdated}
      />

      <RecentCompanyDetailsModal
        company={activeDetailsLead}
        onClose={() => setActiveDetailsLead(null)}
        onCompanyUpdated={handleCompanyUpdated}
        onOpenWhatsApp={(company) => {
          setActiveDetailsLead(null);
          setActiveWhatsAppLead(company);
        }}
      />
    </div>
  );
}
