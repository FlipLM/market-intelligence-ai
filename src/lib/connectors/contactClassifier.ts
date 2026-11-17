import type { RecentCompanyLead, TipoContato } from '@/types/recentCompanies';
import { type ProvenanceField, desconhecido, inferido } from '@/types/provenance';

const FREE_WEBMAIL_DOMAINS = new Set([
  'gmail.com',
  'hotmail.com',
  'outlook.com',
  'yahoo.com',
  'yahoo.com.br',
  'icloud.com',
  'live.com',
  'msn.com',
  'uol.com.br',
  'bol.com.br',
  'terra.com.br',
  'ig.com.br',
  'globo.com',
  'proton.me',
  'protonmail.com',
]);

const ACCOUNTING_KEYWORDS = [
  'contabil',
  'contabilidade',
  'contador',
  'contadora',
  'escritorio',
  'assessoria',
  'fiscal',
  'tribut',
  'crc',
  'bpo',
  'auditoria',
  'audit',
];

function normalizeTokens(text?: string | null): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 4 && !['ltda', 'eireli', 'comercio', 'servicos', 'brasil', 'brasilia'].includes(t));
}

function getDigits(value?: string | null): string {
  return (value || '').replace(/\D/g, '');
}

export function classifyContactOrigin(
  lead: RecentCompanyLead,
  allLeadsInBase: RecentCompanyLead[] = []
): {
  tipoContato: ProvenanceField<TipoContato>;
  motivoTipoContato: ProvenanceField<string>;
} {
  const now = new Date().toISOString();
  const cnpjSelf = getDigits(lead.cnpj.valor);
  const tel1 = getDigits(lead.contato.telefone1.valor);
  const tel2 = getDigits(lead.contato.telefone2.valor);
  const email = (lead.contato.email.valor || '').trim().toLowerCase();

  if (!tel1 && !tel2 && !email) {
    return {
      tipoContato: desconhecido<TipoContato>('Sem telefone ou e-mail no cadastro público', now),
      motivoTipoContato: desconhecido<string>('Nenhum canal de contato presente na Receita Federal', now),
    };
  }

  const cnaeCode = lead.cnaePrincipal.valor || '';
  const isSelfAccountingFirm = cnaeCode.startsWith('6920');

  // 1. Verifica repetição do mesmo telefone em outros CNPJs distintos na base
  const phonesToCheck = [tel1, tel2].filter((p) => p.length >= 10);
  const repeatedPhoneMatches = new Set<string>();
  for (const other of allLeadsInBase) {
    const otherCnpj = getDigits(other.cnpj.valor);
    if (!otherCnpj || otherCnpj === cnpjSelf) continue;
    const otherPhones = [
      getDigits(other.contato.telefone1.valor),
      getDigits(other.contato.telefone2.valor),
    ];
    if (phonesToCheck.some((p) => otherPhones.includes(p))) {
      repeatedPhoneMatches.add(otherCnpj);
    }
  }

  if (repeatedPhoneMatches.size >= 1) {
    const totalOccurrences = repeatedPhoneMatches.size + 1;
    const motivo = `Mesmo telefone consta em ${totalOccurrences} CNPJs distintos na base local (indício de escritório contábil/despachante).`;
    return {
      tipoContato: inferido({
        valor: 'possivel_contabilidade',
        fonte: 'Heurística determinística sobre base local de CNPJs',
        regra: 'Telefone repetido em >= 2 CNPJs distintos -> possivel_contabilidade',
        consultado_em: now,
      }),
      motivoTipoContato: inferido({
        valor: motivo,
        fonte: 'Heurística determinística sobre base local de CNPJs',
        regra: 'Contagem de CNPJs distintos com o mesmo telefone',
        consultado_em: now,
      }),
    };
  }

  // 2. Verifica repetição do mesmo e-mail em outros CNPJs distintos
  if (email) {
    let repeatedEmailCount = 0;
    for (const other of allLeadsInBase) {
      const otherCnpj = getDigits(other.cnpj.valor);
      if (!otherCnpj || otherCnpj === cnpjSelf) continue;
      if ((other.contato.email.valor || '').trim().toLowerCase() === email) {
        repeatedEmailCount++;
      }
    }
    if (repeatedEmailCount >= 1) {
      return {
        tipoContato: inferido({
          valor: 'possivel_contabilidade',
          fonte: 'Heurística determinística sobre base local de CNPJs',
          regra: 'E-mail repetido em >= 2 CNPJs distintos -> possivel_contabilidade',
          consultado_em: now,
        }),
        motivoTipoContato: inferido({
          valor: `Mesmo e-mail (${email}) consta em ${repeatedEmailCount + 1} CNPJs distintos na base local.`,
          fonte: 'Heurística determinística sobre base local de CNPJs',
          regra: 'Contagem de CNPJs distintos com o mesmo e-mail',
          consultado_em: now,
        }),
      };
    }
  }

  // 3. Verifica palavras-chave de contabilidade no domínio ou usuário do e-mail (exceto se a própria empresa for contabilidade)
  if (email && !isSelfAccountingFirm) {
    const [localPart = '', domain = ''] = email.split('@');
    const isFreeMail = FREE_WEBMAIL_DOMAINS.has(domain);
    const domainHit = !isFreeMail && ACCOUNTING_KEYWORDS.find((kw) => domain.includes(kw));
    const localHit = ACCOUNTING_KEYWORDS.find((kw) => localPart.includes(kw));

    if (domainHit || localHit) {
      const matched = domainHit || localHit;
      return {
        tipoContato: inferido({
          valor: 'possivel_contabilidade',
          fonte: 'Heurística determinística sobre e-mail cadastral',
          regra: `E-mail contém termo contábil ("${matched}") -> possivel_contabilidade`,
          consultado_em: now,
        }),
        motivoTipoContato: inferido({
          valor: `E-mail cadastral (${email}) contém indicativo de contabilidade ("${matched}").`,
          fonte: 'Heurística determinística sobre e-mail cadastral',
          regra: 'Detecção de domínio ou prefixo contábil no e-mail da Receita',
          consultado_em: now,
        }),
      };
    }

    // 4. Verifica compatibilidade do e-mail com nome da empresa ou titular/sócio
    const companyTokens = [
      ...normalizeTokens(lead.nomeFantasia.valor),
      ...normalizeTokens(lead.razaoSocial.valor),
      ...normalizeTokens(lead.titularOuSocioPrincipal.valor?.nome),
    ];

    const emailNormalized = `${localPart} ${domain.split('.')[0] || ''}`;
    const matchingToken = companyTokens.find((tok) => emailNormalized.includes(tok));

    if (matchingToken) {
      return {
        tipoContato: inferido({
          valor: 'provavel_empresa',
          fonte: 'Heurística determinística sobre e-mail e razão social/titular',
          regra: 'E-mail compatível com nome da empresa/titular e sem repetição em outros CNPJs',
          consultado_em: now,
        }),
        motivoTipoContato: inferido({
          valor: `E-mail (${email}) compatível com "${matchingToken}" e sem sinais de contabilidade.`,
          fonte: 'Heurística determinística sobre e-mail e razão social/titular',
          regra: 'Correspondência de token entre e-mail e empresa/titular',
          consultado_em: now,
        }),
      };
    }
  }

  // 5. Sem indício positivo nem negativo conclusivo -> desconhecido
  return {
    tipoContato: desconhecido<TipoContato>(
      'Contato consta no cadastro público, sem evidência suficiente se pertence à empresa ou à contabilidade',
      now
    ),
    motivoTipoContato: inferido({
      valor: 'Sem domínio corporativo identificável e sem repetição detectada na base atual.',
      fonte: 'Heurística determinística de classificação de contato',
      regra: 'Sem correspondência nominal nem indício contábil -> desconhecido',
      consultado_em: now,
    }),
  };
}

export function reclassifyAllContacts(leads: RecentCompanyLead[]): RecentCompanyLead[] {
  return leads.map((lead) => {
    const classification = classifyContactOrigin(lead, leads);
    return {
      ...lead,
      contato: {
        ...lead.contato,
        tipoContato: classification.tipoContato,
        motivoTipoContato: classification.motivoTipoContato,
      },
    };
  });
}
