/**
 * Tipos e Contratos para o Radar de Empresas e Comércios Recém-Abertos
 */

export type CompanyTimeWindow = 
  | '7_dias' 
  | '15_dias' 
  | '30_dias' 
  | '60_dias' 
  | '90_dias' 
  | '180_dias' 
  | '365_dias'
  | 'todos';

export type CompanySector = 
  | 'todos'
  | 'alimentacao'
  | 'automotivo'
  | 'saude_estetica'
  | 'construcao_obras'
  | 'servicos_b2b'
  | 'comercio_varejo';

export interface RecentCompanyLead {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  dataAbertura: string; // ISO Date "YYYY-MM-DD"
  diasCriacao: number; // Ex: 14
  faixaTempo: '7_dias' | '15_dias' | '30_dias' | '60_dias' | '90_dias' | '180_dias' | '365_dias';
  setor: CompanySector;
  setorRotulo: string; // "Alimentação & Gastronomia"
  cnaePrincipal: string; // "5611-2/01"
  cnaeDescricao: string; // "Restaurantes e similares"
  cnaesSecundarios?: string[];
  uf: string; // "DF"
  municipio: string; // "Brasília"
  bairroRegiao: string; // "Águas Claras", "Asa Sul", etc.
  enderecoCompleto: string;
  cep: string;
  porte: 'ME' | 'EPP' | 'LTDA';
  capitalSocial: number;
  socioPrincipal: {
    nome: string;
    qualificacao: string; // "Sócio-Administrador"
  };
  contato: {
    telefoneWhatsapp: string;
    telefoneFormatado: string;
    email: string;
    temWhatsappVerificado: boolean;
  };
  diagnosticoTecnologico: {
    scoreSemSistema: number; // 0 a 100 (probabilidade de NÃO ter sistema instalado)
    estagioOperacional: 'abertura_montagem' | 'primeiro_mes_caos' | 'ajuste_caixa' | 'expansao_recente';
    estagioDescricao: string;
    gargaloUrgente: string;
    solucaoImediataSugerida: string;
    ticketSetupSugerido: number;
    ticketMensalSugerido: number;
  };
  pitchAbordagemSugerido: {
    ganchoAbertura: string;
    mensagemWhatsapp: string;
    gatilhoPsicologico: string;
  };
}

export interface RecentCompaniesFilterOptions {
  tempoMaximoDias?: number; // 7, 15, 30, 60, 90, 180, 365
  setor?: CompanySector;
  regiao?: string; // "DF" ou bairro específico
  busca?: string; // texto livre
  apenasWhatsappValido?: boolean;
  porte?: string;
  ordenarPor?: 'mais_recentes' | 'maior_score' | 'maior_capital';
}

export interface RecentCompaniesStats {
  totalMapeadas: number;
  criadasUltimos7Dias: number;
  criadasUltimos30Dias: number;
  criadasUltimos90Dias: number;
  criadasUltimoAno: number;
  setorMaisAtivo: string;
  taxaMediaSemSistema: number;
  capitalSocialMedio: number;
}
