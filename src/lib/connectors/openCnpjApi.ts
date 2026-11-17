import {
  RecentCompanyLead,
  CompanySector,
  CompanyTimeWindow,
  CnaeSecondaryItem,
  QsaPartner,
  PrincipalHolder,
} from '@/types/recentCompanies';
import { verificado, inferido, desconhecido, ProvenanceField } from '@/types/provenance';
import { fetchJsonWithRetryAndCache } from './httpClient';
import { fetchIbgeCnaeDescription, fetchIbgeMunicipioInfo } from './ibge';
import { classifyContactOrigin } from './contactClassifier';

export interface BrasilApiCnpjResponse {
  cnpj: string;
  razao_social?: string;
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
  opcao_pelo_mei?: boolean | null;
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

function isMeiOrIndividualEntrepreneur(apiData: BrasilApiCnpjResponse): boolean {
  if (apiData.opcao_pelo_mei === true) return true;
  if (apiData.codigo_natureza_juridica === 2135) return true;
  const nat = (apiData.natureza_juridica || '').toLowerCase();
  return (
    nat.includes('empresário (individual)') ||
    nat.includes('empresario (individual)') ||
    nat.includes('213-5') ||
    nat.includes('microempreendedor individual')
  );
}

export function parseBrasilApiResponseToLead(
  apiData: BrasilApiCnpjResponse,
  apiMeta: { fonte: string; url_ou_api: string; consultado_em?: string },
  ibgeEnrichment?: {
    cnaeDescricaoIbge?: ProvenanceField<string>;
    municipioIbge?: ProvenanceField<string>;
    codigoIbgeMunicipio?: ProvenanceField<number>;
  },
  existingLeadsInBase: RecentCompanyLead[] = []
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
    if (!Number.isNaN(openingDate.getTime())) {
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
        regra: 'Rótulo descritivo derivado diretamente de diasCriacao (sem percentuais)',
      });
    } else {
      diasCriacaoField = desconhecido<number>(`data_inicio_atividade inválida em ${fonte}`, consultadoEm);
      faixaTempoField = desconhecido<Exclude<CompanyTimeWindow, 'todos'>>(
        `data_inicio_atividade inválida em ${fonte}`,
        consultadoEm
      );
      rotuloEstagioField = desconhecido<string>(`data_inicio_atividade inválida em ${fonte}`, consultadoEm);
    }
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

  const cnaeDescFromReceita = strField(apiData.cnae_fiscal_descricao);
  const cnaeDescField =
    ibgeEnrichment?.cnaeDescricaoIbge?.status === 'verificado'
      ? ibgeEnrichment.cnaeDescricaoIbge
      : cnaeDescFromReceita;

  const cnaesSecField: ProvenanceField<CnaeSecondaryItem[]> = Array.isArray(apiData.cnaes_secundarios)
    ? verificado({
        valor: apiData.cnaes_secundarios
          .filter((c) => c && c.codigo && Number(c.codigo) !== 0)
          .map((c) => ({ codigo: formatCnae(c.codigo), descricao: (c.descricao || '').trim() })),
        fonte,
        url_ou_api: urlApi,
        consultado_em: consultadoEm,
      })
    : desconhecido<CnaeSecondaryItem[]>(`cnaes_secundarios ausente em ${fonte}`, consultadoEm);

  let setorField: ProvenanceField<CompanySector>;
  let setorRotuloField: ProvenanceField<string>;
  if (cnaeCode) {
    const inferred = inferSectorFromCnae(cnaeCode, cnaeDescField.valor || '');
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
          regra: 'nome_fantasia não informado no cadastro; exibindo razao_social verificada',
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
  const municipioReceitaField = strField(apiData.municipio);
  const municipioField =
    ibgeEnrichment?.municipioIbge?.status === 'verificado'
      ? ibgeEnrichment.municipioIbge
      : municipioReceitaField;

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
  } else if (isMeiOrIndividualEntrepreneur(apiData) && razaoSocialField.valor) {
    titularField = inferido({
      valor: {
        nome: razaoSocialField.valor,
        qualificacao: 'Titular (MEI / Empresário Individual)',
        origem: 'mei_ei_titular',
      },
      fonte,
      url_ou_api: urlApi,
      consultado_em: consultadoEm,
      regra: 'MEI/EI sem QSA: titular é a própria empresa (razão social)',
    });
  } else {
    titularField = desconhecido<PrincipalHolder>(
      `QSA ausente em ${fonte} e natureza jurídica não confirmada como MEI/EI`,
      consultadoEm
    );
  }

  const tel1Digits = apiData.ddd_telefone_1?.replace(/\D/g, '') || '';
  const tel2Digits = apiData.ddd_telefone_2?.replace(/\D/g, '') || '';

  const tel1Field = tel1Digits.length >= 10
    ? verificado({
        valor: tel1Digits,
        fonte: `${fonte} (consta no cadastro público; não confirmado se é do sócio)`,
        url_ou_api: urlApi,
        consultado_em: consultadoEm,
      })
    : desconhecido<string>(`ddd_telefone_1 ausente em ${fonte}`, consultadoEm);

  const tel2Field = tel2Digits.length >= 10
    ? verificado({
        valor: tel2Digits,
        fonte: `${fonte} (consta no cadastro público; não confirmado se é do sócio)`,
        url_ou_api: urlApi,
        consultado_em: consultadoEm,
      })
    : desconhecido<string>(`ddd_telefone_2 ausente em ${fonte}`, consultadoEm);

  const tel1Fmt = formatPhoneBr(apiData.ddd_telefone_1);
  const tel2Fmt = formatPhoneBr(apiData.ddd_telefone_2);
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

  const emailField =
    apiData.email && apiData.email.trim() !== ''
      ? verificado({
          valor: apiData.email.trim(),
          fonte: `${fonte} (consta no cadastro público; não confirmado se é do sócio)`,
          url_ou_api: urlApi,
          consultado_em: consultadoEm,
        })
      : desconhecido<string>(`email ausente em ${fonte}`, consultadoEm);

  const baseLead: RecentCompanyLead = {
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
    codigoIbgeMunicipio:
      ibgeEnrichment?.codigoIbgeMunicipio ??
      desconhecido<number>('Código IBGE do município não consultado', consultadoEm),
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
      tipoContato: desconhecido<never>('Classificação pendente', consultadoEm),
      motivoTipoContato: desconhecido<string>('Classificação pendente', consultadoEm),
    },
    diagnostico: {
      possuiSistema: desconhecido<'sim' | 'nao' | 'desconhecido'>(
        'Não verificado — confirmar na conversa comercial',
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

  const contactClassification = classifyContactOrigin(baseLead, existingLeadsInBase);
  baseLead.contato.tipoContato = contactClassification.tipoContato;
  baseLead.contato.motivoTipoContato = contactClassification.motivoTipoContato;

  return baseLead;
}

/**
 * Consulta um CNPJ real na API aberta (BrasilAPI com fallback para MinhaReceita + enriquecimento IBGE)
 * Respeita rate limit, cache e retry com backoff. Nunca inventa fallback em erro.
 */
export async function fetchCnpjFromOpenApi(
  cnpj: string,
  existingLeadsInBase: RecentCompanyLead[] = []
): Promise<RecentCompanyLead | null> {
  const clean = cnpj.replace(/\D/g, '');
  if (clean.length !== 14) {
    throw new Error('CNPJ inválido. Forneça exatamente 14 dígitos numéricos.');
  }

  let rawData: BrasilApiCnpjResponse | null = null;
  let apiMeta: { fonte: string; url_ou_api: string; consultado_em: string } | null = null;

  // Provedor 1: BrasilAPI
  const brasilApiUrl = `https://brasilapi.com.br/api/cnpj/v1/${clean}`;
  const brasilRes = await fetchJsonWithRetryAndCache<BrasilApiCnpjResponse>(brasilApiUrl, {
    ttlMs: 24 * 60 * 60 * 1000,
    maxRetries: 3,
  });

  if (brasilRes.ok && brasilRes.data) {
    rawData = brasilRes.data;
    apiMeta = {
      fonte: 'Receita Federal via BrasilAPI',
      url_ou_api: brasilApiUrl,
      consultado_em: brasilRes.fetchedAt,
    };
  } else {
    // Provedor 2: MinhaReceita (fallback oficial)
    const minhaReceitaUrl = `https://minhareceita.org/${clean}`;
    const mrRes = await fetchJsonWithRetryAndCache<BrasilApiCnpjResponse>(minhaReceitaUrl, {
      ttlMs: 24 * 60 * 60 * 1000,
      maxRetries: 3,
    });

    if (mrRes.ok && mrRes.data) {
      rawData = mrRes.data;
      apiMeta = {
        fonte: 'Receita Federal via MinhaReceita',
        url_ou_api: minhaReceitaUrl,
        consultado_em: mrRes.fetchedAt,
      };
    }
  }

  if (!rawData || !apiMeta) {
    return null;
  }

  // Enriquecimento opcional via IBGE (CNAE oficial e município) - falha silenciosa para 'desconhecido'
  const [cnaeDescricaoIbge, municipioInfo] = await Promise.all([
    rawData.cnae_fiscal
      ? fetchIbgeCnaeDescription(rawData.cnae_fiscal)
      : Promise.resolve(desconhecido<string>('cnae_fiscal ausente na Receita')),
    fetchIbgeMunicipioInfo(rawData.uf, rawData.municipio),
  ]);

  return parseBrasilApiResponseToLead(
    rawData,
    apiMeta,
    {
      cnaeDescricaoIbge,
      municipioIbge: municipioInfo.municipioOficial,
      codigoIbgeMunicipio: municipioInfo.codigoIbge,
    },
    existingLeadsInBase
  );
}

export async function fetchCnpjsBatchFromOpenApi(
  cnpjs: string[],
  existingLeadsInBase: RecentCompanyLead[] = []
): Promise<{
  imported: RecentCompanyLead[];
  failed: Array<{ cnpj: string; reason: string }>;
}> {
  const uniqueClean = Array.from(
    new Set(cnpjs.map((c) => c.replace(/\D/g, '')).filter((c) => c.length > 0))
  );

  const imported: RecentCompanyLead[] = [];
  const failed: Array<{ cnpj: string; reason: string }> = [];
  const combinedContext = [...existingLeadsInBase];

  for (const clean of uniqueClean) {
    if (clean.length !== 14) {
      failed.push({ cnpj: clean, reason: 'CNPJ não possui 14 dígitos numéricos.' });
      continue;
    }

    try {
      const lead = await fetchCnpjFromOpenApi(clean, combinedContext);
      if (!lead) {
        failed.push({
          cnpj: clean,
          reason: 'Não localizado na BrasilAPI/MinhaReceita ou indisponível após retries.',
        });
        continue;
      }
      imported.push(lead);
      combinedContext.push(lead);
    } catch (err: unknown) {
      failed.push({
        cnpj: clean,
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { imported, failed };
}
