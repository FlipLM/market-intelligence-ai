import {
  RecentCompanyLead,
  CompanySector,
  CompanyTimeWindow,
  CnaeSecondaryItem,
  QsaPartner,
  PrincipalHolder,
  TipoContato,
} from '@/types/recentCompanies';
import { verificado, inferido, desconhecido, ProvenanceField } from '@/types/provenance';

export interface BrasilApiCnpjResponse {
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  situacao_cadastral?: number;
  descricao_situacao_cadastral?: string;
  data_inicio_atividade?: string;
  cnae_fiscal?: number | string;
  cnae_fiscal_descricao?: string;
  cnaes_secundarios?: Array<{ codigo: number | string; descricao: string }>;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
  ddd_telefone_1?: string;
  ddd_telefone_2?: string;
  email?: string | null;
  capital_social?: number;
  porte?: string;
  descricao_porte?: string;
  natureza_juridica?: string;
  codigo_natureza_juridica?: number;
  qsa?: Array<{
    nome_socio: string;
    qualificacao_socio: string;
  }>;
}

export function formatCnpj(raw: string): string {
  const digits = raw.replace(/\D/g, '').padStart(14, '0');
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

export function formatCnae(code: number | string): string {
  const digits = String(code).replace(/\D/g, '').padStart(7, '0');
  return `${digits.slice(0, 4)}-${digits.slice(4, 5)}/${digits.slice(5, 7)}`;
}

export function formatPhoneBr(raw?: string | null): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 10) return null;
  const ddd = digits.slice(0, 2);
  const num = digits.slice(2);
  if (num.length === 9) {
    return `(${ddd}) ${num.slice(0, 5)}-${num.slice(5)}`;
  }
  return `(${ddd}) ${num.slice(0, 4)}-${num.slice(4)}`;
}

export function inferSectorFromCnae(
  cnae: string,
  text = ''
): { sector: CompanySector; label: string } {
  const normalized = `${cnae} ${text}`.toLowerCase();

  if (
    cnae.startsWith('56') ||
    normalized.includes('restaurante') ||
    normalized.includes('lanchonete') ||
    normalized.includes('alimento') ||
    normalized.includes('padaria') ||
    normalized.includes('bebida')
  ) {
    return { sector: 'alimentacao', label: 'Alimentação & Gastronomia' };
  }

  if (
    cnae.startsWith('45') ||
    normalized.includes('oficina') ||
    normalized.includes('mecanic') ||
    normalized.includes('veiculo')
  ) {
    return { sector: 'automotivo', label: 'Serviços Automotivos' };
  }

  if (
    cnae.startsWith('86') ||
    cnae.startsWith('75') ||
    cnae.startsWith('9602') ||
    normalized.includes('odonto') ||
    normalized.includes('medico') ||
    normalized.includes('estetica') ||
    normalized.includes('veterin')
  ) {
    return { sector: 'saude_estetica', label: 'Saúde & Estética' };
  }

  if (
    cnae.startsWith('41') ||
    cnae.startsWith('42') ||
    cnae.startsWith('43') ||
    normalized.includes('construc') ||
    normalized.includes('obra') ||
    normalized.includes('reforma')
  ) {
    return { sector: 'construcao_obras', label: 'Construção Civil & Reformas' };
  }

  if (
    cnae.startsWith('69') ||
    cnae.startsWith('70') ||
    cnae.startsWith('71') ||
    cnae.startsWith('74') ||
    cnae.startsWith('81') ||
    normalized.includes('advoc') ||
    normalized.includes('contab') ||
    normalized.includes('consult')
  ) {
    return { sector: 'servicos_b2b', label: 'Serviços Profissionais & B2B' };
  }

  if (cnae.startsWith('47')) {
    return { sector: 'comercio_varejo', label: 'Comércio Varejista' };
  }

  return { sector: 'outros', label: 'Outros Setores' };
}

export function parseBrasilApiResponseToLead(
  apiData: BrasilApiCnpjResponse,
  apiMeta: { fonte: string; url_ou_api: string; consultado_em?: string }
): RecentCompanyLead {
  const consultadoEm = apiMeta.consultado_em ?? new Date().toISOString();
  const fonte = apiMeta.fonte;
  const urlApi = apiMeta.url_ou_api;

  const cleanCnpj = formatCnpj(apiData.cnpj);
  const cnpjDigits = cleanCnpj.replace(/\D/g, '');

  const strField = (val?: string | null): ProvenanceField<string> =>
    val && val.trim() !== ''
      ? verificado({ valor: val.trim(), fonte, url_ou_api: urlApi, consultado_em: consultadoEm })
      : desconhecido<string>(`Campo ausente em ${fonte}`, consultadoEm);

  const dataAberturaField = strField(apiData.data_inicio_atividade);

  let diasCriacaoField: ProvenanceField<number>;
  let faixaTempoField: ProvenanceField<Exclude<CompanyTimeWindow, 'todos'>>;
  let rotuloEstagioField: ProvenanceField<string>;

  if (dataAberturaField.status === 'verificado' && dataAberturaField.valor) {
    const openingDate = new Date(`${dataAberturaField.valor}T00:00:00Z`);
    const today = new Date();
    const diffMs = today.getTime() - openingDate.getTime();
    const dias = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

    diasCriacaoField = inferido({
      valor: dias,
      fonte,
      url_ou_api: urlApi,
      consultado_em: consultadoEm,
      regra: 'diasCriacao = floor((data_consulta - data_inicio_atividade) / 86400000ms)',
    });

    let faixa: Exclude<CompanyTimeWindow, 'todos'> = '365_dias';
    if (dias <= 7) faixa = '7_dias';
    else if (dias <= 15) faixa = '15_dias';
    else if (dias <= 30) faixa = '30_dias';
    else if (dias <= 60) faixa = '60_dias';
    else if (dias <= 90) faixa = '90_dias';
    else if (dias <= 180) faixa = '180_dias';

    faixaTempoField = inferido({
      valor: faixa,
      fonte,
      url_ou_api: urlApi,
      consultado_em: consultadoEm,
      regra: 'Classificação determinística por janela de dias de atividade',
    });

    rotuloEstagioField = inferido({
      valor: dias === 1 ? 'Aberta há 1 dia' : `Aberta há ${dias} dias`,
      fonte,
      url_ou_api: urlApi,
      consultado_em: consultadoEm,
      regra: 'Rótulo descritivo derivado diretamente de diasCriacao',
    });
  } else {
    diasCriacaoField = desconhecido<number>(`data_inicio_atividade ausente em ${fonte}`, consultadoEm);
    faixaTempoField = desconhecido<Exclude<CompanyTimeWindow, 'todos'>>(
      `data_inicio_atividade ausente em ${fonte}`,
      consultadoEm
    );
    rotuloEstagioField = desconhecido<string>(`data_inicio_atividade ausente em ${fonte}`, consultadoEm);
  }

  const cnaeCode = apiData.cnae_fiscal ? formatCnae(apiData.cnae_fiscal) : null;
  const cnaePrincipalField = cnaeCode
    ? verificado({ valor: cnaeCode, fonte, url_ou_api: urlApi, consultado_em: consultadoEm })
    : desconhecido<string>(`cnae_fiscal ausente em ${fonte}`, consultadoEm);

  const cnaeDescField = strField(apiData.cnae_fiscal_descricao);

  const cnaesSecField: ProvenanceField<CnaeSecondaryItem[]> = Array.isArray(apiData.cnaes_secundarios)
    ? verificado({
        valor: apiData.cnaes_secundarios
          .filter((c) => c && c.codigo)
          .map((c) => ({ codigo: formatCnae(c.codigo), descricao: c.descricao || '' })),
        fonte,
        url_ou_api: urlApi,
        consultado_em: consultadoEm,
      })
    : desconhecido<CnaeSecondaryItem[]>(`cnaes_secundarios ausente em ${fonte}`, consultadoEm);

  let setorField: ProvenanceField<CompanySector>;
  let setorRotuloField: ProvenanceField<string>;
  if (cnaeCode) {
    const inferred = inferSectorFromCnae(cnaeCode, apiData.cnae_fiscal_descricao || '');
    setorField = inferido({
      valor: inferred.sector,
      fonte,
      url_ou_api: urlApi,
      consultado_em: consultadoEm,
      regra: `Agrupamento determinístico a partir do CNAE ${cnaeCode}`,
    });
    setorRotuloField = inferido({
      valor: inferred.label,
      fonte,
      url_ou_api: urlApi,
      consultado_em: consultadoEm,
      regra: `Rótulo de categoria derivado do CNAE ${cnaeCode}`,
    });
  } else {
    setorField = desconhecido<CompanySector>('CNAE principal não verificado', consultadoEm);
    setorRotuloField = desconhecido<string>('CNAE principal não verificado', consultadoEm);
  }

  const razaoSocialField = strField(apiData.razao_social);
  const nomeFantasiaField =
    apiData.nome_fantasia && apiData.nome_fantasia.trim() !== ''
      ? verificado({
          valor: apiData.nome_fantasia.trim(),
          fonte,
          url_ou_api: urlApi,
          consultado_em: consultadoEm,
        })
      : razaoSocialField.status === 'verificado' && razaoSocialField.valor
      ? inferido({
          valor: razaoSocialField.valor,
          fonte,
          url_ou_api: urlApi,
          consultado_em: consultadoEm,
          regra: 'nome_fantasia não informado; exibindo razao_social verificada',
        })
      : desconhecido<string>(`nome_fantasia ausente em ${fonte}`, consultadoEm);

  const situacaoField = strField(apiData.descricao_situacao_cadastral);
  const porteField = strField(apiData.porte || apiData.descricao_porte);
  const naturezaField = strField(apiData.natureza_juridica);

  const capitalField: ProvenanceField<number> =
    typeof apiData.capital_social === 'number' && !Number.isNaN(apiData.capital_social)
      ? verificado({
          valor: apiData.capital_social,
          fonte,
          url_ou_api: urlApi,
          consultado_em: consultadoEm,
        })
      : desconhecido<number>(`capital_social ausente em ${fonte}`, consultadoEm);

  const ufField = strField(apiData.uf);
  const municipioField = strField(apiData.municipio);
  const bairroField = strField(apiData.bairro);
  const logradouroField = strField(apiData.logradouro);
  const numeroField = strField(apiData.numero);
  const complementoField = strField(apiData.complemento);
  const cepField = strField(apiData.cep);

  const addressParts = [
    logradouroField.valor,
    numeroField.valor,
    complementoField.valor,
    bairroField.valor,
    municipioField.valor && ufField.valor
      ? `${municipioField.valor} - ${ufField.valor}`
      : municipioField.valor || ufField.valor,
    cepField.valor ? `CEP ${cepField.valor}` : null,
  ].filter(Boolean);

  const enderecoCompletoField: ProvenanceField<string> =
    addressParts.length > 0
      ? inferido({
          valor: addressParts.join(', '),
          fonte,
          url_ou_api: urlApi,
          consultado_em: consultadoEm,
          regra: 'Concatenação determinística dos campos de endereço verificados',
        })
      : desconhecido<string>(`Endereço ausente em ${fonte}`, consultadoEm);

  const qsaList: QsaPartner[] = Array.isArray(apiData.qsa)
    ? apiData.qsa
        .filter((q) => q && q.nome_socio)
        .map((q) => ({
          nome: q.nome_socio.trim(),
          qualificacao: (q.qualificacao_socio || 'Sócio').trim(),
        }))
    : [];

  const qsaField: ProvenanceField<QsaPartner[]> = Array.isArray(apiData.qsa)
    ? verificado({ valor: qsaList, fonte, url_ou_api: urlApi, consultado_em: consultadoEm })
    : desconhecido<QsaPartner[]>(`QSA ausente em ${fonte}`, consultadoEm);

  let titularField: ProvenanceField<PrincipalHolder>;
  if (qsaList.length > 0) {
    titularField = verificado({
      valor: {
        nome: qsaList[0].nome,
        qualificacao: qsaList[0].qualificacao,
        origem: 'qsa',
      },
      fonte,
      url_ou_api: urlApi,
      consultado_em: consultadoEm,
    });
  } else {
    titularField = desconhecido<PrincipalHolder>(
      `Sem QSA em ${fonte} (comum em MEI/EI; verificar titularidade na abordagem)`,
      consultadoEm
    );
  }

  const tel1Fmt = formatPhoneBr(apiData.ddd_telefone_1);
  const tel2Fmt = formatPhoneBr(apiData.ddd_telefone_2);
  const tel1Field = apiData.ddd_telefone_1?.trim()
    ? verificado({
        valor: apiData.ddd_telefone_1.replace(/\D/g, ''),
        fonte: `${fonte} (consta no cadastro público)`,
        url_ou_api: urlApi,
        consultado_em: consultadoEm,
      })
    : desconhecido<string>(`ddd_telefone_1 ausente em ${fonte}`, consultadoEm);

  const tel2Field = apiData.ddd_telefone_2?.trim()
    ? verificado({
        valor: apiData.ddd_telefone_2.replace(/\D/g, ''),
        fonte: `${fonte} (consta no cadastro público)`,
        url_ou_api: urlApi,
        consultado_em: consultadoEm,
      })
    : desconhecido<string>(`ddd_telefone_2 ausente em ${fonte}`, consultadoEm);

  const telefoneFormatadoField = tel1Fmt
    ? inferido({
        valor: tel1Fmt,
        fonte: `${fonte} (consta no cadastro público)`,
        url_ou_api: urlApi,
        consultado_em: consultadoEm,
        regra: 'Formatação DDD + número a partir de ddd_telefone_1 verificado',
      })
    : tel2Fmt
    ? inferido({
        valor: tel2Fmt,
        fonte: `${fonte} (consta no cadastro público)`,
        url_ou_api: urlApi,
        consultado_em: consultadoEm,
        regra: 'Formatação DDD + número a partir de ddd_telefone_2 verificado',
      })
    : desconhecido<string>(`Telefone ausente em ${fonte}`, consultadoEm);

  const emailField = strField(apiData.email || undefined);

  const tipoContatoField: ProvenanceField<TipoContato> =
    tel1Field.status === 'verificado' || emailField.status === 'verificado'
      ? desconhecido<TipoContato>('Classificação de contato empresa vs. contabilidade pendente de heurística', consultadoEm)
      : desconhecido<TipoContato>('Sem telefone ou e-mail no cadastro', consultadoEm);

  return {
    id: `cnpj-${cnpjDigits}`,
    recordStatus: 'ativo',
    cnpj: verificado({
      valor: cleanCnpj,
      fonte,
      url_ou_api: urlApi,
      consultado_em: consultadoEm,
    }),
    razaoSocial: razaoSocialField,
    nomeFantasia: nomeFantasiaField,
    situacaoCadastral: situacaoField,
    dataAbertura: dataAberturaField,
    diasCriacao: diasCriacaoField,
    faixaTempo: faixaTempoField,
    rotuloEstagio: rotuloEstagioField,
    setor: setorField,
    setorRotulo: setorRotuloField,
    cnaePrincipal: cnaePrincipalField,
    cnaeDescricao: cnaeDescField,
    cnaesSecundarios: cnaesSecField,
    uf: ufField,
    municipio: municipioField,
    bairroRegiao: bairroField,
    logradouro: logradouroField,
    numero: numeroField,
    complemento: complementoField,
    cep: cepField,
    enderecoCompleto: enderecoCompletoField,
    porte: porteField,
    naturezaJuridica: naturezaField,
    capitalSocial: capitalField,
    qsa: qsaField,
    titularOuSocioPrincipal: titularField,
    contato: {
      telefone1: tel1Field,
      telefone2: tel2Field,
      telefoneFormatado: telefoneFormatadoField,
      email: emailField,
      tipoContato: tipoContatoField,
      motivoTipoContato: desconhecido<string>('Classificação de contato pendente', consultadoEm),
    },
    diagnostico: {
      possuiSistema: desconhecido<'sim' | 'nao' | 'desconhecido'>(
        'Não verificado — confirmar em abordagem comercial',
        null
      ),
      observacaoSistema: desconhecido<string>('Sem diagnóstico confirmado', null),
    },
    abordagem: {
      statusContato: 'nao_contatado',
      naoContatar: false,
      primeiroContatoEm: null,
      followupEnviadoEm: null,
      motivoBloqueio: null,
    },
  };
}

/**
 * Consulta um CNPJ real na API aberta (BrasilAPI com fallback para MinhaReceita)
 */
export async function fetchCnpjFromOpenApi(cnpj: string): Promise<RecentCompanyLead | null> {
  const clean = cnpj.replace(/\D/g, '');
  if (clean.length !== 14) {
    throw new Error('CNPJ inválido. Forneça exatamente 14 dígitos numéricos.');
  }

  // Provedor 1: BrasilAPI
  try {
    const url = `https://brasilapi.com.br/api/cnpj/v1/${clean}`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (res.ok) {
      const data: BrasilApiCnpjResponse = await res.json();
      return parseBrasilApiResponseToLead(data, {
        fonte: 'Receita Federal via BrasilAPI',
        url_ou_api: url,
      });
    }
  } catch (err) {
    console.warn(`[OpenCnpjApi] BrasilAPI falhou para ${clean}, tentando MinhaReceita...`, err);
  }

  // Provedor 2: MinhaReceita (fallback)
  try {
    const url = `https://minhareceita.org/${clean}`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (res.ok) {
      const data: BrasilApiCnpjResponse = await res.json();
      return parseBrasilApiResponseToLead(data, {
        fonte: 'Receita Federal via MinhaReceita',
        url_ou_api: url,
      });
    }
  } catch (err) {
    console.error(`[OpenCnpjApi] MinhaReceita também falhou para ${clean}:`, err);
  }

  return null;
}
