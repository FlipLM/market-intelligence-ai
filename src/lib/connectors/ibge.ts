import type { DataEvidence } from '@/types/market';
import { type ProvenanceField, desconhecido, verificado } from '@/types/provenance';
import { fetchJsonWithRetryAndCache } from './httpClient';

export interface IbgeCnaeSubclasseResponse {
  id: string;
  descricao: string;
}

export interface IbgeMunicipioResponse {
  id: number;
  nome: string;
}

export interface IbgeSectorData {
  cnaeCode: ProvenanceField<string>;
  sectorName: ProvenanceField<string>;
  totalCompanies: ProvenanceField<number>;
  sourceEvidence: DataEvidence[];
}

const IBGE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export async function fetchIbgeCnaeDescription(
  cnaeRaw: string | number
): Promise<ProvenanceField<string>> {
  const digits = String(cnaeRaw).replace(/\D/g, '').padStart(7, '0');
  if (digits.length !== 7) {
    return desconhecido<string>('Código CNAE inválido para consulta no IBGE');
  }

  const url = `https://servicodados.ibge.gov.br/api/v2/cnae/subclasses/${digits}`;
  const res = await fetchJsonWithRetryAndCache<IbgeCnaeSubclasseResponse | IbgeCnaeSubclasseResponse[]>(
    url,
    { ttlMs: IBGE_TTL_MS }
  );

  if (!res.ok || !res.data) {
    return desconhecido<string>(
      `Falha ao consultar CNAE no IBGE (${res.error || 'sem resposta'})`,
      res.fetchedAt
    );
  }

  const record = Array.isArray(res.data) ? res.data[0] : res.data;
  if (!record || !record.descricao) {
    return desconhecido<string>('CNAE não localizado na API IBGE Concla', res.fetchedAt);
  }

  return verificado({
    valor: record.descricao.trim(),
    fonte: 'IBGE Concla API v2',
    url_ou_api: url,
    consultado_em: res.fetchedAt,
  });
}

export async function fetchIbgeMunicipioInfo(
  uf?: string | null,
  municipioName?: string | null
): Promise<{
  codigoIbge: ProvenanceField<number>;
  municipioOficial: ProvenanceField<string>;
}> {
  if (!uf || !municipioName || uf.trim().length !== 2) {
    return {
      codigoIbge: desconhecido<number>('UF ou município ausente para consulta no IBGE'),
      municipioOficial: desconhecido<string>('UF ou município ausente para consulta no IBGE'),
    };
  }

  const ufClean = uf.trim().toUpperCase();
  const url = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${ufClean}/municipios`;
  const res = await fetchJsonWithRetryAndCache<IbgeMunicipioResponse[]>(url, {
    ttlMs: IBGE_TTL_MS,
  });

  if (!res.ok || !Array.isArray(res.data)) {
    return {
      codigoIbge: desconhecido<number>(
        `Falha ao consultar municípios no IBGE (${res.error || 'sem resposta'})`,
        res.fetchedAt
      ),
      municipioOficial: desconhecido<string>(
        `Falha ao consultar municípios no IBGE (${res.error || 'sem resposta'})`,
        res.fetchedAt
      ),
    };
  }

  const target = normalizeText(municipioName);
  const match = res.data.find((m) => normalizeText(m.nome) === target);

  if (!match) {
    return {
      codigoIbge: desconhecido<number>(
        `Município "${municipioName}" não correspondido na lista IBGE de ${ufClean}`,
        res.fetchedAt
      ),
      municipioOficial: desconhecido<string>(
        `Município "${municipioName}" não correspondido na lista IBGE de ${ufClean}`,
        res.fetchedAt
      ),
    };
  }

  return {
    codigoIbge: verificado({
      valor: match.id,
      fonte: 'IBGE Localidades API v1',
      url_ou_api: url,
      consultado_em: res.fetchedAt,
    }),
    municipioOficial: verificado({
      valor: match.nome,
      fonte: 'IBGE Localidades API v1',
      url_ou_api: url,
      consultado_em: res.fetchedAt,
    }),
  };
}

export function fetchIbgeSectorData(): IbgeSectorData {
  return {
    cnaeCode: desconhecido<string>('CNAE ainda não consultado no IBGE Concla'),
    sectorName: desconhecido<string>('Setor ainda não consultado no IBGE'),
    totalCompanies: desconhecido<number>('Contagem de empresas não verificada (sem base oficial consultada)'),
    sourceEvidence: [],
  };
}
