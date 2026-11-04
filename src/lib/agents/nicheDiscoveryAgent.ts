import { NicheBasicInfo } from '@/types/market';
import { fetchIbgeSectorData } from '../connectors/ibge';

export interface DiscoveryInput {
  nicheQuery: string;
  segment?: string;
  state?: string;
  city?: string;
}

export function runNicheDiscoveryAgent(input: DiscoveryInput): NicheBasicInfo {
  const ibge = fetchIbgeSectorData(input.nicheQuery, input.state);

  const id = input.nicheQuery
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, '_');

  const segmentTitle = input.segment || ibge.sectorName;

  return {
    id,
    name: input.nicheQuery.trim(),
    segment: segmentTitle,
    subsegment: `Especialistas em ${input.nicheQuery} de Médio Porte`,
    cnaes: [ibge.cnaeCode],
    description: `Segmento empresarial focado em ${input.nicheQuery} (${segmentTitle}). Negócios com rotinas de atendimento, orçamentos, vendas e operações que se beneficiam fortemente de digitalização e automação sob demanda.`,
    geographicScope: {
      country: 'Brasil',
      state: input.state,
      city: input.city
    }
  };
}

