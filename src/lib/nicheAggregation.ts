import type { NicheBaseAggregation } from '@/types/market';
import type { RecentCompanyLead } from '@/types/recentCompanies';
import { getRealRecentCompanies } from '@/lib/data/recentCompaniesData';
import { desconhecido, inferido } from '@/types/provenance';

function normalizeCnaeDigits(raw?: string | null): string {
  return (raw || '').replace(/\D/g, '');
}

function normalizeLocation(raw?: string | null): string {
  return (raw || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function filterCompaniesForNiche(
  companies: RecentCompanyLead[],
  params: { cnae?: string | null; state?: string | null; city?: string | null }
): RecentCompanyLead[] {
  const targetCnae = normalizeCnaeDigits(params.cnae);
  const targetState = normalizeLocation(params.state);
  const targetCity = normalizeLocation(params.city);

  return companies.filter((c) => {
    if (targetCnae) {
      const mainCnae = normalizeCnaeDigits(c.cnaePrincipal.valor);
      const secCnaes = (c.cnaesSecundarios.valor || []).map((s) =>
        normalizeCnaeDigits(s.codigo)
      );
      const cnaeMatches =
        mainCnae === targetCnae ||
        mainCnae.startsWith(targetCnae) ||
        secCnaes.some((sc) => sc === targetCnae || sc.startsWith(targetCnae));
      if (!cnaeMatches) return false;
    }

    if (targetState && targetState !== 'br' && targetState !== 'brasil') {
      if (normalizeLocation(c.uf.valor) !== targetState) return false;
    }

    if (targetCity) {
      if (normalizeLocation(c.municipio.valor) !== targetCity) return false;
    }

    return true;
  });
}

export function aggregateNicheFromCollectedCnpjs(params: {
  cnae?: string | null;
  state?: string | null;
  city?: string | null;
  companies?: RecentCompanyLead[];
}): {
  aggregation: NicheBaseAggregation;
  matchedCount: number;
  probableDirectContactsCount: number;
} {
  const allCompanies = params.companies ?? getRealRecentCompanies();
  const matched = filterCompaniesForNiche(allCompanies, params);
  const now = new Date().toISOString();
  const fonteBase = 'Contagem real sobre CNPJs coletados (data/recent_companies.json)';

  if (matched.length === 0) {
    const emptyMsg = params.cnae
      ? `Nenhuma empresa coletada na base local para CNAE ${params.cnae}`
      : 'Sem CNAE informado ou nenhuma empresa coletada na base local';
    return {
      aggregation: {
        totalEmpresasColetadas: inferido({
          valor: 0,
          fonte: fonteBase,
          regra: 'Contagem direta de registros reais compatíveis na base local',
          consultado_em: now,
        }),
        abertasUltimos30Dias: desconhecido(emptyMsg, now),
        abertasUltimos90Dias: desconhecido(emptyMsg, now),
        abertasUltimos365Dias: desconhecido(emptyMsg, now),
        taxaAberturaMensal: desconhecido(emptyMsg, now),
        concentracaoPorBairro: desconhecido(emptyMsg, now),
        distribuicaoPorPorte: desconhecido(emptyMsg, now),
      },
      matchedCount: 0,
      probableDirectContactsCount: 0,
    };
  }

  const c30 = matched.filter(
    (c) => c.diasCriacao.valor !== null && c.diasCriacao.valor <= 30
  ).length;
  const c90 = matched.filter(
    (c) => c.diasCriacao.valor !== null && c.diasCriacao.valor <= 90
  ).length;
  const c365 = matched.filter(
    (c) => c.diasCriacao.valor !== null && c.diasCriacao.valor <= 365
  ).length;
  const taxaMensal = Number((c365 / 12).toFixed(2));

  const bairroCounts = new Map<string, number>();
  const porteCounts = new Map<string, number>();

  for (const c of matched) {
    const bairro = c.bairroRegiao.valor || 'Não informado';
    bairroCounts.set(bairro, (bairroCounts.get(bairro) || 0) + 1);

    const porte = c.porte.valor || 'Não informado';
    porteCounts.set(porte, (porteCounts.get(porte) || 0) + 1);
  }

  const concentracaoPorBairro = Array.from(bairroCounts.entries())
    .map(([bairro, quantidade]) => ({ bairro, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade);

  const distribuicaoPorPorte = Array.from(porteCounts.entries())
    .map(([porte, quantidade]) => ({ porte, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade);

  const probableDirectContactsCount = matched.filter(
    (c) => c.contato.tipoContato.valor === 'provavel_empresa'
  ).length;

  return {
    aggregation: {
      totalEmpresasColetadas: inferido({
        valor: matched.length,
        fonte: fonteBase,
        regra: 'Contagem direta de CNPJs reais na base local filtrados por CNAE/UF/município',
        consultado_em: now,
      }),
      abertasUltimos30Dias: inferido({
        valor: c30,
        fonte: fonteBase,
        regra: 'Contagem de CNPJs coletados com diasCriacao <= 30',
        consultado_em: now,
      }),
      abertasUltimos90Dias: inferido({
        valor: c90,
        fonte: fonteBase,
        regra: 'Contagem de CNPJs coletados com diasCriacao <= 90',
        consultado_em: now,
      }),
      abertasUltimos365Dias: inferido({
        valor: c365,
        fonte: fonteBase,
        regra: 'Contagem de CNPJs coletados com diasCriacao <= 365',
        consultado_em: now,
      }),
      taxaAberturaMensal: inferido({
        valor: taxaMensal,
        fonte: fonteBase,
        regra: 'abertasUltimos365Dias / 12 meses na base coletada',
        consultado_em: now,
      }),
      concentracaoPorBairro: inferido({
        valor: concentracaoPorBairro,
        fonte: fonteBase,
        regra: 'Agrupamento por bairroRegiao ordenado por contagem descendente',
        consultado_em: now,
      }),
      distribuicaoPorPorte: inferido({
        valor: distribuicaoPorPorte,
        fonte: fonteBase,
        regra: 'Agrupamento por porte ordenado por contagem descendente',
        consultado_em: now,
      }),
    },
    matchedCount: matched.length,
    probableDirectContactsCount,
  };
}
