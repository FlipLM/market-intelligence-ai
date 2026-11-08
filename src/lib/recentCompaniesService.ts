import { 
  RecentCompanyLead, 
  RecentCompaniesFilterOptions, 
  RecentCompaniesStats 
} from '@/types/recentCompanies';
import { getGeneratedRecentCompanies } from './data/recentCompaniesData';

export function getRecentCompanies(filters?: RecentCompaniesFilterOptions): RecentCompanyLead[] {
  let companies = getGeneratedRecentCompanies();

  if (!filters) {
    return companies.sort((a, b) => a.diasCriacao - b.diasCriacao);
  }

  // Filtro por tempo máximo em dias (7, 15, 30, 60, 90, 180, 365)
  if (filters.tempoMaximoDias && filters.tempoMaximoDias > 0) {
    companies = companies.filter(c => c.diasCriacao <= filters.tempoMaximoDias!);
  }

  // Filtro por setor
  if (filters.setor && filters.setor !== 'todos') {
    companies = companies.filter(c => c.setor === filters.setor);
  }

  // Filtro por região / bairro
  if (filters.regiao && filters.regiao !== 'todos') {
    const regLower = filters.regiao.toLowerCase();
    companies = companies.filter(c => 
      c.bairroRegiao.toLowerCase().includes(regLower) ||
      c.enderecoCompleto.toLowerCase().includes(regLower)
    );
  }

  // Filtro por busca textual
  if (filters.busca && filters.busca.trim() !== '') {
    const term = filters.busca.toLowerCase().trim();
    companies = companies.filter(c =>
      c.nomeFantasia.toLowerCase().includes(term) ||
      c.razaoSocial.toLowerCase().includes(term) ||
      c.cnpj.includes(term) ||
      c.cnaePrincipal.includes(term) ||
      c.cnaeDescricao.toLowerCase().includes(term) ||
      c.socioPrincipal.nome.toLowerCase().includes(term) ||
      c.bairroRegiao.toLowerCase().includes(term) ||
      c.diagnosticoTecnologico.gargaloUrgente.toLowerCase().includes(term)
    );
  }

  // Filtro por WhatsApp verificado
  if (filters.apenasWhatsappValido) {
    companies = companies.filter(c => c.contato.temWhatsappVerificado);
  }

  // Filtro por Porte
  if (filters.porte && filters.porte !== 'todos') {
    companies = companies.filter(c => c.porte === filters.porte);
  }

  // Ordenação
  const sortMode = filters.ordenarPor || 'mais_recentes';
  if (sortMode === 'mais_recentes') {
    companies.sort((a, b) => a.diasCriacao - b.diasCriacao);
  } else if (sortMode === 'maior_score') {
    companies.sort((a, b) => b.diagnosticoTecnologico.scoreSemSistema - a.diagnosticoTecnologico.scoreSemSistema);
  } else if (sortMode === 'maior_capital') {
    companies.sort((a, b) => b.capitalSocial - a.capitalSocial);
  }

  return companies;
}

export function getRecentCompaniesStats(): RecentCompaniesStats {
  const all = getGeneratedRecentCompanies();
  const total = all.length;

  const criadas7 = all.filter(c => c.diasCriacao <= 7).length;
  const criadas30 = all.filter(c => c.diasCriacao <= 30).length;
  const criadas90 = all.filter(c => c.diasCriacao <= 90).length;
  const criadasAno = all.filter(c => c.diasCriacao <= 365).length;

  const sumScore = all.reduce((acc, c) => acc + c.diagnosticoTecnologico.scoreSemSistema, 0);
  const avgScore = total > 0 ? Math.round(sumScore / total) : 0;

  const sumCapital = all.reduce((acc, c) => acc + c.capitalSocial, 0);
  const avgCapital = total > 0 ? Math.round(sumCapital / total) : 0;

  return {
    totalMapeadas: total,
    criadasUltimos7Dias: criadas7,
    criadasUltimos30Dias: criadas30,
    criadasUltimos90Dias: criadas90,
    criadasUltimoAno: criadasAno,
    setorMaisAtivo: 'Alimentação & Gastronomia (Restaurantes e Lanchonetes)',
    taxaMediaSemSistema: avgScore,
    capitalSocialMedio: avgCapital,
  };
}

export function exportCompaniesToCsv(companies: RecentCompanyLead[]): string {
  const headers = [
    'CNPJ',
    'Nome Fantasia',
    'Razao Social',
    'Dias de Abertura',
    'Data Abertura',
    'Setor',
    'CNAE Principal',
    'Descricao CNAE',
    'Regiao/Bairro',
    'Socio Administrador',
    'Telefone WhatsApp',
    'Email',
    'Capital Social',
    'Score Sem Sistema',
    'Gargalo Operacional',
    'Solucao Recomendada',
    'Setup Sugerido R$',
    'Mensalidade Sugerida R$'
  ];

  const rows = companies.map(c => [
    `"${c.cnpj}"`,
    `"${c.nomeFantasia.replace(/"/g, '""')}"`,
    `"${c.razaoSocial.replace(/"/g, '""')}"`,
    c.diasCriacao,
    c.dataAbertura,
    `"${c.setorRotulo}"`,
    `"${c.cnaePrincipal}"`,
    `"${c.cnaeDescricao.replace(/"/g, '""')}"`,
    `"${c.bairroRegiao}"`,
    `"${c.socioPrincipal.nome}"`,
    `"${c.contato.telefoneFormatado}"`,
    `"${c.contato.email}"`,
    c.capitalSocial,
    `${c.diagnosticoTecnologico.scoreSemSistema}%`,
    `"${c.diagnosticoTecnologico.gargaloUrgente.replace(/"/g, '""')}"`,
    `"${c.diagnosticoTecnologico.solucaoImediataSugerida.replace(/"/g, '""')}"`,
    c.diagnosticoTecnologico.ticketSetupSugerido,
    c.diagnosticoTecnologico.ticketMensalSugerido,
  ]);

  return [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
}

