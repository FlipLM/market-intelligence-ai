import { NicheBasicInfo } from '@/types/market';
import { desconhecido, inferido, verificado } from '@/types/provenance';
import { fetchIbgeCnaeDescription } from '../connectors/ibge';
import { formatCnae } from '../connectors/openCnpjApi';

export interface DiscoveryInput {
  nicheQuery: string;
  segment?: string;
  state?: string;
  city?: string;
  cnae?: string;
}

export async function runNicheDiscoveryAgent(input: DiscoveryInput): Promise<NicheBasicInfo> {
  const now = new Date().toISOString();
  const id = input.nicheQuery
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_');

  const cleanCnaeDigits = (input.cnae || '').replace(/\D/g, '');
  let cnaesField = desconhecido<string[]>('CNAE não informado pelo usuário', now);
  let cnaeDescField = desconhecido<string>('Descrição oficial do CNAE não consultada', now);

  if (cleanCnaeDigits.length === 7) {
    const formattedCnae = formatCnae(cleanCnaeDigits);
    const ibgeDesc = await fetchIbgeCnaeDescription(cleanCnaeDigits);
    if (ibgeDesc.status === 'verificado' && ibgeDesc.valor) {
      cnaesField = verificado({
        valor: [formattedCnae],
        fonte: ibgeDesc.fonte,
        url_ou_api: ibgeDesc.url_ou_api,
        consultado_em: ibgeDesc.consultado_em || now,
      });
      cnaeDescField = ibgeDesc;
    } else {
      cnaesField = inferido({
        valor: [formattedCnae],
        fonte: 'Entrada do usuário (não confirmado no IBGE)',
        regra: 'Formatação CNAE informada pelo operador',
        consultado_em: now,
      });
      cnaeDescField = ibgeDesc;
    }
  }

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
      : desconhecido<string>('Segmento não verificado', now),
    subsegment: desconhecido<string>('Subsegmento não verificado', now),
    cnaes: cnaesField,
    cnaeDescricao: cnaeDescField,
    description:
      cnaeDescField.status === 'verificado' && cnaeDescField.valor
        ? verificado({
            valor: `Atividade oficial IBGE: ${cnaeDescField.valor}`,
            fonte: cnaeDescField.fonte,
            url_ou_api: cnaeDescField.url_ou_api,
            consultado_em: cnaeDescField.consultado_em || now,
          })
        : desconhecido<string>('Descrição do nicho aguardando coleta de evidências', now),
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
