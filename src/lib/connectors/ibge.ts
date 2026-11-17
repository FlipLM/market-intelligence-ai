import { DataEvidence } from '@/types/market';
import { ProvenanceField, desconhecido } from '@/types/provenance';

export interface IbgeSectorData {
  cnaeCode: ProvenanceField<string>;
  sectorName: ProvenanceField<string>;
  totalCompanies: ProvenanceField<number>;
  sourceEvidence: DataEvidence[];
}

export function fetchIbgeSectorData(): IbgeSectorData {
  return {
    cnaeCode: desconhecido<string>('CNAE ainda não consultado no IBGE Concla'),
    sectorName: desconhecido<string>('Setor ainda não consultado no IBGE'),
    totalCompanies: desconhecido<number>('Contagem de empresas não verificada (sem base oficial consultada)'),
    sourceEvidence: [],
  };
}
