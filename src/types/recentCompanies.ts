import { ProvenanceField } from './provenance';

/**
 * Tipos e Contratos com Proveniência para o Radar de Empresas Recém-Abertas
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
  | 'comercio_varejo'
  | 'outros';

export type TipoContato = 'provavel_empresa' | 'possivel_contabilidade' | 'desconhecido';

export type PossuiSistemaStatus = 'sim' | 'nao' | 'desconhecido';

export type AbordagemStatus =
  | 'nao_contatado'
  | 'primeiro_contato_enviado'
  | 'followup_enviado'
  | 'respondeu'
  | 'recusou';

export interface QsaPartner {
  nome: string;
  qualificacao: string;
}

export interface CnaeSecondaryItem {
  codigo: string;
  descricao: string;
}

export interface PrincipalHolder {
  nome: string;
  qualificacao: string;
  origem: 'qsa' | 'mei_ei_titular' | 'desconhecido';
}

export interface RecentCompanyLead {
  id: string;
  recordStatus: 'ativo' | 'descartado_sintetico';
  cnpj: ProvenanceField<string>;
  razaoSocial: ProvenanceField<string>;
  nomeFantasia: ProvenanceField<string>;
  situacaoCadastral: ProvenanceField<string>;
  dataAbertura: ProvenanceField<string>;
  diasCriacao: ProvenanceField<number>;
  faixaTempo: ProvenanceField<Exclude<CompanyTimeWindow, 'todos'>>;
  rotuloEstagio: ProvenanceField<string>;
  setor: ProvenanceField<CompanySector>;
  setorRotulo: ProvenanceField<string>;
  cnaePrincipal: ProvenanceField<string>;
  cnaeDescricao: ProvenanceField<string>;
  cnaesSecundarios: ProvenanceField<CnaeSecondaryItem[]>;
  uf: ProvenanceField<string>;
  municipio: ProvenanceField<string>;
  bairroRegiao: ProvenanceField<string>;
  logradouro: ProvenanceField<string>;
  numero: ProvenanceField<string>;
  complemento: ProvenanceField<string>;
  cep: ProvenanceField<string>;
  enderecoCompleto: ProvenanceField<string>;
  porte: ProvenanceField<string>;
  naturezaJuridica: ProvenanceField<string>;
  capitalSocial: ProvenanceField<number>;
  qsa: ProvenanceField<QsaPartner[]>;
  titularOuSocioPrincipal: ProvenanceField<PrincipalHolder>;
  contato: {
    telefone1: ProvenanceField<string>;
    telefone2: ProvenanceField<string>;
    telefoneFormatado: ProvenanceField<string>;
    email: ProvenanceField<string>;
    tipoContato: ProvenanceField<TipoContato>;
    motivoTipoContato: ProvenanceField<string>;
  };
  diagnostico: {
    possuiSistema: ProvenanceField<PossuiSistemaStatus>;
    observacaoSistema: ProvenanceField<string>;
  };
  abordagem: {
    statusContato: AbordagemStatus;
    naoContatar: boolean;
    primeiroContatoEm: string | null;
    followupEnviadoEm: string | null;
    motivoBloqueio: string | null;
  };
}

export interface RecentCompaniesFilterOptions {
  tempoMaximoDias?: number;
  setor?: CompanySector;
  regiao?: string;
  busca?: string;
  porte?: string;
  tipoContato?: TipoContato | 'todos';
  ocultarNaoContatar?: boolean;
  ordenarPor?: 'mais_recentes' | 'maior_capital' | 'razao_social';
}

export interface RecentCompaniesStats {
  totalMapeadas: number;
  criadasUltimos7Dias: number;
  criadasUltimos30Dias: number;
  criadasUltimos90Dias: number;
  criadasUltimoAno: number;
  setorMaisAtivo: ProvenanceField<string>;
  capitalSocialMedio: ProvenanceField<number>;
  possiveisContabilidades: number;
}
