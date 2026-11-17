import { NicheBasicInfo } from '@/types/market';
import { desconhecido, inferido, verificado } from '@/types/provenance';

export interface DiscoveryInput {
  nicheQuery: string;
  segment?: string;
  state?: string;
  city?: string;
  cnae?: string;
}

export function runNicheDiscoveryAgent(input: DiscoveryInput): NicheBasicInfo {
  const now = new Date().toISOString();
  const id = input.nicheQuery
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_');

  return {
    id,
    name: inferido({
      valor: input.nicheQuery.trim(),
      fonte: 'Entrada do usuário',
      regra: 'Termo pesquisado pelo operador',
      consultado_em: now,
    }),
    segment: input.segment
      ? inferido({
          valor: input.segment,
          fonte: 'Entrada do usuário',
          regra: 'Segmento informado pelo operador',
          consultado_em: now,
        })
      : desconhecido<string>('Segmento não informado nem verificado via IBGE', now),
    subsegment: desconhecido<string>('Subsegmento não verificado', now),
    cnaes: input.cnae
      ? verificado({
          valor: [input.cnae],
          fonte: 'CNAE informado para consulta',
          consultado_em: now,
        })
      : desconhecido<string[]>('CNAE ainda não consultado no IBGE Concla', now),
    cnaeDescricao: desconhecido<string>('Descrição oficial do CNAE ainda não consultada', now),
    description: desconhecido<string>('Descrição do nicho aguardando coleta de evidências', now),
    geographicScope: {
      country: verificado({ valor: 'Brasil', fonte: 'Escopo padrão nacional', consultado_em: now }),
      state: input.state
        ? inferido({
            valor: input.state.toUpperCase(),
            fonte: 'Entrada do usuário',
            regra: 'UF selecionada pelo operador',
            consultado_em: now,
          })
        : desconhecido<string>('UF não especificada', now),
      city: input.city
        ? inferido({
            valor: input.city,
            fonte: 'Entrada do usuário',
            regra: 'Município selecionado pelo operador',
            consultado_em: now,
          })
        : desconhecido<string>('Município não especificado', now),
    },
  };
}
