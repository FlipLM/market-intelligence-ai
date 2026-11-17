import {
  RecentCompanyLead,
  RecentCompaniesFilterOptions,
  RecentCompaniesStats,
} from '@/types/recentCompanies';
import { getRealRecentCompanies } from './data/recentCompaniesData';
import { inferido, desconhecido, formatProvenanceText } from '@/types/provenance';

export function getRecentCompanies(filters?: RecentCompaniesFilterOptions): RecentCompanyLead[] {
  let companies = getRealRecentCompanies();

  if (!filters) {
    return companies.sort(
      (a, b) => (a.diasCriacao.valor ?? Number.MAX_SAFE_INTEGER) - (b.diasCriacao.valor ?? Number.MAX_SAFE_INTEGER)
    );
  }

  if (filters.ocultarNaoContatar) {
    companies = companies.filter((c) => !c.abordagem.naoContatar && c.abordagem.statusContato !== 'recusou');
  }

  if (filters.tempoMaximoDias && filters.tempoMaximoDias > 0) {
    companies = companies.filter(
      (c) => c.diasCriacao.valor !== null && c.diasCriacao.valor <= filters.tempoMaximoDias!
    );
  }

  if (filters.setor && filters.setor !== 'todos') {
    companies = companies.filter((c) => c.setor.valor === filters.setor);
  }

  if (filters.regiao && filters.regiao !== 'todos') {
    const regLower = filters.regiao.toLowerCase();
    companies = companies.filter(
      (c) =>
        (c.bairroRegiao.valor || '').toLowerCase().includes(regLower) ||
        (c.municipio.valor || '').toLowerCase().includes(regLower) ||
        (c.enderecoCompleto.valor || '').toLowerCase().includes(regLower)
    );
  }

  if (filters.tipoContato && filters.tipoContato !== 'todos') {
    companies = companies.filter((c) => c.contato.tipoContato.valor === filters.tipoContato);
  }

  if (filters.busca && filters.busca.trim() !== '') {
    const term = filters.busca.toLowerCase().trim();
    companies = companies.filter(
      (c) =>
        (c.nomeFantasia.valor || '').toLowerCase().includes(term) ||
        (c.razaoSocial.valor || '').toLowerCase().includes(term) ||
        (c.cnpj.valor || '').includes(term) ||
        (c.cnaePrincipal.valor || '').includes(term) ||
        (c.cnaeDescricao.valor || '').toLowerCase().includes(term) ||
        (c.titularOuSocioPrincipal.valor?.nome || '').toLowerCase().includes(term) ||
        (c.bairroRegiao.valor || '').toLowerCase().includes(term)
    );
  }

  if (filters.porte && filters.porte !== 'todos') {
    companies = companies.filter((c) => c.porte.valor === filters.porte);
  }

  const sortMode = filters.ordenarPor || 'mais_recentes';
  if (sortMode === 'mais_recentes') {
    companies.sort(
      (a, b) => (a.diasCriacao.valor ?? Number.MAX_SAFE_INTEGER) - (b.diasCriacao.valor ?? Number.MAX_SAFE_INTEGER)
    );
  } else if (sortMode === 'maior_capital') {
    companies.sort((a, b) => (b.capitalSocial.valor ?? -1) - (a.capitalSocial.valor ?? -1));
  } else if (sortMode === 'razao_social') {
    companies.sort((a, b) => (a.razaoSocial.valor || '').localeCompare(b.razaoSocial.valor || ''));
  }

  return companies;
}

export function getRecentCompaniesStats(): RecentCompaniesStats {
  const all = getRealRecentCompanies();
  const total = all.length;
  const now = new Date().toISOString();

  const criadas7 = all.filter((c) => c.diasCriacao.valor !== null && c.diasCriacao.valor <= 7).length;
  const criadas30 = all.filter((c) => c.diasCriacao.valor !== null && c.diasCriacao.valor <= 30).length;
  const criadas90 = all.filter((c) => c.diasCriacao.valor !== null && c.diasCriacao.valor <= 90).length;
  const criadasAno = all.filter((c) => c.diasCriacao.valor !== null && c.diasCriacao.valor <= 365).length;
  const possiveisContabilidades = all.filter(
    (c) => c.contato.tipoContato.valor === 'possivel_contabilidade'
  ).length;

  // Setor mais ativo por contagem real da base
  const sectorCounts = new Map<string, number>();
  for (const c of all) {
    if (c.setorRotulo.valor) {
      sectorCounts.set(c.setorRotulo.valor, (sectorCounts.get(c.setorRotulo.valor) || 0) + 1);
    }
  }

  let topSector: string | null = null;
  let topCount = 0;
  for (const [sector, count] of sectorCounts.entries()) {
    if (count > topCount) {
      topSector = sector;
      topCount = count;
    }
  }

  const setorMaisAtivo = topSector
    ? inferido({
        valor: `${topSector} (${topCount})`,
        fonte: 'Contagem real da base local (data/recent_companies.json)',
        regra: 'Moda do campo setorRotulo entre empresas coletadas',
        consultado_em: now,
      })
    : desconhecido<string>('Sem empresas reais cadastradas na base', now);

  const capitals = all
    .filter((c) => c.capitalSocial.status === 'verificado' && c.capitalSocial.valor !== null)
    .map((c) => c.capitalSocial.valor!);

  const capitalSocialMedio =
    capitals.length > 0
      ? inferido({
          valor: Math.round(capitals.reduce((a, b) => a + b, 0) / capitals.length),
          fonte: 'Contagem real da base local (data/recent_companies.json)',
          regra: `Média aritmética de capitalSocial verificado (${capitals.length} empresas)`,
          consultado_em: now,
        })
      : desconhecido<number>('Sem dados verificados de capital social na base', now);

  return {
    totalMapeadas: total,
    criadasUltimos7Dias: criadas7,
    criadasUltimos30Dias: criadas30,
    criadasUltimos90Dias: criadas90,
    criadasUltimoAno: criadasAno,
    setorMaisAtivo,
    capitalSocialMedio,
    possiveisContabilidades,
  };
}

export function exportCompaniesToCsv(companies: RecentCompanyLead[]): string {
  const headers = [
    'CNPJ',
    'Nome Fantasia',
    'Razao Social',
    'Situacao Cadastral',
    'Data Abertura',
    'Dias de Abertura',
    'Setor',
    'CNAE Principal',
    'Descricao CNAE',
    'Bairro/Regiao',
    'Municipio',
    'UF',
    'Porte',
    'Natureza Juridica',
    'Capital Social',
    'Titular ou Socio Principal',
    'Telefone Cadastro',
    'Email Cadastro',
    'Tipo Contato',
    'Possui Sistema',
    'Status Abordagem',
  ];

  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;

  const rows = companies.map((c) => [
    esc(formatProvenanceText(c.cnpj)),
    esc(formatProvenanceText(c.nomeFantasia)),
    esc(formatProvenanceText(c.razaoSocial)),
    esc(formatProvenanceText(c.situacaoCadastral)),
    esc(formatProvenanceText(c.dataAbertura)),
    esc(formatProvenanceText(c.diasCriacao)),
    esc(formatProvenanceText(c.setorRotulo)),
    esc(formatProvenanceText(c.cnaePrincipal)),
    esc(formatProvenanceText(c.cnaeDescricao)),
    esc(formatProvenanceText(c.bairroRegiao)),
    esc(formatProvenanceText(c.municipio)),
    esc(formatProvenanceText(c.uf)),
    esc(formatProvenanceText(c.porte)),
    esc(formatProvenanceText(c.naturezaJuridica)),
    esc(formatProvenanceText(c.capitalSocial)),
    esc(c.titularOuSocioPrincipal.valor?.nome || 'Não verificado'),
    esc(formatProvenanceText(c.contato.telefoneFormatado)),
    esc(formatProvenanceText(c.contato.email)),
    esc(formatProvenanceText(c.contato.tipoContato)),
    esc(formatProvenanceText(c.diagnostico.possuiSistema)),
    esc(c.abordagem.statusContato),
  ]);

  return [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
}
