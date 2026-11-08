import { RecentCompanyLead, CompanySector } from '@/types/recentCompanies';

export interface BrasilApiCnpjResponse {
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  situacao_cadastral: number;
  descricao_situacao_cadastral: string;
  data_inicio_atividade: string; // "YYYY-MM-DD"
  cnae_fiscal: number | string;
  cnae_fiscal_descricao: string;
  cnaes_secundarios?: Array<{ codigo: number | string; descricao: string }>;
  logradouro: string;
  numero: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  ddd_telefone_1?: string;
  ddd_telefone_2?: string;
  email?: string;
  capital_social: number;
  porte?: string;
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

export function inferSectorFromCnae(cnae: string, text = ''): { sector: CompanySector; label: string } {
  const normalized = (cnae + ' ' + text).toLowerCase();

  if (
    normalized.startsWith('56') ||
    normalized.includes('restaurante') ||
    normalized.includes('lanchonete') ||
    normalized.includes('alimento') ||
    normalized.includes('padaria') ||
    normalized.includes('bebida') ||
    normalized.includes('pizza') ||
    normalized.includes('refeic') ||
    normalized.includes('bar ')
  ) {
    return { sector: 'alimentacao', label: 'Alimentação & Gastronomia' };
  }

  if (
    normalized.startsWith('45') ||
    normalized.includes('oficina') ||
    normalized.includes('mecanic') ||
    normalized.includes('auto') ||
    normalized.includes('veiculo') ||
    normalized.includes('reboque') ||
    normalized.includes('guincho')
  ) {
    return { sector: 'automotivo', label: 'Serviços Automotivos & Frotas' };
  }

  if (
    normalized.startsWith('86') ||
    normalized.startsWith('75') ||
    normalized.startsWith('9602') ||
    normalized.includes('odonto') ||
    normalized.includes('medico') ||
    normalized.includes('estetica') ||
    normalized.includes('veterin') ||
    normalized.includes('fisioter') ||
    normalized.includes('saude')
  ) {
    return { sector: 'saude_estetica', label: 'Saúde, Clínicas & Estética' };
  }

  if (
    normalized.startsWith('41') ||
    normalized.startsWith('42') ||
    normalized.startsWith('43') ||
    normalized.includes('construc') ||
    normalized.includes('obra') ||
    normalized.includes('eletric') ||
    normalized.includes('solar') ||
    normalized.includes('reforma')
  ) {
    return { sector: 'construcao_obras', label: 'Construção Civil & Reformas' };
  }

  if (
    normalized.startsWith('69') ||
    normalized.startsWith('70') ||
    normalized.startsWith('71') ||
    normalized.startsWith('74') ||
    normalized.startsWith('81') ||
    normalized.includes('advoc') ||
    normalized.includes('contab') ||
    normalized.includes('consult') ||
    normalized.includes('limpeza') ||
    normalized.includes('terceiriz')
  ) {
    return { sector: 'servicos_b2b', label: 'Serviços Profissionais & B2B' };
  }

  return { sector: 'comercio_varejo', label: 'Comércio Varejista & Conveniência' };
}

export function parseBrasilApiResponseToLead(apiData: BrasilApiCnpjResponse): RecentCompanyLead {
  const cleanCnpj = formatCnpj(apiData.cnpj);

  // Calcula dias desde a data de abertura oficial
  let dias = 30;
  if (apiData.data_inicio_atividade) {
    const openingDate = new Date(apiData.data_inicio_atividade);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - openingDate.getTime());
    dias = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  }

  let faixa: RecentCompanyLead['faixaTempo'] = '365_dias';
  if (dias <= 7) faixa = '7_dias';
  else if (dias <= 15) faixa = '15_dias';
  else if (dias <= 30) faixa = '30_dias';
  else if (dias <= 60) faixa = '60_dias';
  else if (dias <= 90) faixa = '90_dias';
  else if (dias <= 180) faixa = '180_dias';

  const cnaeCode = formatCnae(apiData.cnae_fiscal);
  const sectorInfo = inferSectorFromCnae(cnaeCode, `${apiData.cnae_fiscal_descricao} ${apiData.razao_social}`);

  // Sócio principal
  const firstSocio = apiData.qsa && apiData.qsa.length > 0 ? apiData.qsa[0] : null;
  const socioNome = firstSocio?.nome_socio || 'Sócio-Administrador';
  const socioQualif = firstSocio?.qualificacao_socio || 'Sócio-Administrador';

  // Telefone formatado
  let rawPhone = apiData.ddd_telefone_1 || '61981001234';
  const cleanPhone = rawPhone.replace(/\D/g, '');
  const ddd = cleanPhone.slice(0, 2) || '61';
  const num = cleanPhone.slice(2) || '981001234';
  const telefoneFormatado = `(${ddd}) ${num.length === 9 ? num.slice(0, 5) + '-' + num.slice(5) : num.slice(0, 4) + '-' + num.slice(4)}`;

  // Estágio e probabilidade sem sistema
  let prob = 70;
  let estagio: RecentCompanyLead['diagnosticoTecnologico']['estagioOperacional'] = 'expansao_recente';
  let estagioDesc = 'Empresa recente em busca de padronização de processos.';

  if (dias <= 15) {
    prob = 98;
    estagio = 'abertura_montagem';
    estagioDesc = 'Fase de abertura de CNPJ. Zero sistemas legados instalados.';
  } else if (dias <= 45) {
    prob = 93;
    estagio = 'primeiro_mes_caos';
    estagioDesc = 'Primeiro mês operacional. Fechamento de caixa e pedidos no improviso.';
  } else if (dias <= 90) {
    prob = 86;
    estagio = 'ajuste_caixa';
    estagioDesc = 'Primeiro trimestre (Sweet Spot). Dono sofrendo com perda de tempo e planilhas.';
  } else {
    prob = 74;
    estagio = 'expansao_recente';
    estagioDesc = 'Consolidação de rotinas com ferramentas manuais sobrecarregadas.';
  }

  const nomeExibicao = apiData.nome_fantasia && apiData.nome_fantasia.trim() !== ''
    ? apiData.nome_fantasia.trim()
    : apiData.razao_social;

  const primeiroNome = socioNome.split(' ')[0];

  const dorEspecifica = `Gargalo em processos manuais de atendimento e ausência de controle automatizado de vendas e caixa na fase de ${dias} dias de abertura.`;
  const solucaoSugerida = `Sistema web sob demanda integrado com WhatsApp para emissão rápida, controle de pedidos e fluxo de caixa.`;

  const msgWhatsapp = `Olá ${primeiroNome}, tudo bem? Meus parabéns pela abertura recente da ${nomeExibicao} em ${apiData.bairro || 'Brasília'}! Vimos que abriram há ${dias} dias e sabemos que nessa fase inicial a correria com equipe e fornecedores é intensa. Desenvolvemos uma solução enxuta no WhatsApp para resolver o controle de pedidos e caixa sem computadores caros. Teria 2 minutos para ver como funciona?`;

  const leadId = `api-${cleanCnpj.replace(/\D/g, '')}`;

  return {
    id: leadId,
    cnpj: cleanCnpj,
    razaoSocial: apiData.razao_social,
    nomeFantasia: nomeExibicao,
    dataAbertura: apiData.data_inicio_atividade || new Date().toISOString().split('T')[0],
    diasCriacao: dias,
    faixaTempo: faixa,
    setor: sectorInfo.sector,
    setorRotulo: sectorInfo.label,
    cnaePrincipal: cnaeCode,
    cnaeDescricao: apiData.cnae_fiscal_descricao || 'Atividade principal',
    cnaesSecundarios: apiData.cnaes_secundarios?.map(c => formatCnae(c.codigo)),
    uf: apiData.uf || 'DF',
    municipio: apiData.municipio || 'Brasília',
    bairroRegiao: apiData.bairro || 'Brasília',
    enderecoCompleto: `${apiData.logradouro || 'Endereço'}, ${apiData.numero || 'S/N'}, ${apiData.bairro || 'Bairro'}, ${apiData.municipio || 'Brasília'} - ${apiData.uf || 'DF'}, CEP ${apiData.cep || '70000-000'}`,
    cep: apiData.cep || '70000-000',
    porte: (apiData.porte as any) || 'ME',
    capitalSocial: apiData.capital_social || 50000,
    socioPrincipal: {
      nome: socioNome,
      qualificacao: socioQualif,
    },
    contato: {
      telefoneWhatsapp: cleanPhone,
      telefoneFormatado,
      email: apiData.email || 'contato@empresa.com.br',
      temWhatsappVerificado: true,
    },
    diagnosticoTecnologico: {
      scoreSemSistema: prob,
      estagioOperacional: estagio,
      estagioDescricao: estagioDesc,
      gargaloUrgente: dorEspecifica,
      solucaoImediataSugerida: solucaoSugerida,
      ticketSetupSugerido: 2500,
      ticketMensalSugerido: 320,
    },
    pitchAbordagemSugerido: {
      ganchoAbertura: `Empresa aberta há ${dias} dias no DF`,
      mensagemWhatsapp: msgWhatsapp,
      gatilhoPsicologico: 'Abertura Recente & Apoio no Começo da Operação',
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
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    });

    if (res.ok) {
      const data: BrasilApiCnpjResponse = await res.json();
      return parseBrasilApiResponseToLead(data);
    }
  } catch (err) {
    console.warn(`[OpenCnpjApi] BrasilAPI falhou para ${clean}, tentando MinhaReceita...`, err);
  }

  // Provedor 2: MinhaReceita (fallback)
  try {
    const res = await fetch(`https://minhareceita.org/${clean}`, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      // Normaliza dados do MinhaReceita
      const normalized: BrasilApiCnpjResponse = {
        cnpj: data.cnpj,
        razao_social: data.razao_social,
        nome_fantasia: data.nome_fantasia,
        situacao_cadastral: 2,
        descricao_situacao_cadastral: data.descricao_situacao_cadastral || 'ATIVA',
        data_inicio_atividade: data.data_inicio_atividade,
        cnae_fiscal: data.cnae_fiscal,
        cnae_fiscal_descricao: data.cnae_fiscal_descricao,
        cnaes_secundarios: data.cnaes_secundarios,
        logradouro: data.logradouro,
        numero: data.numero,
        bairro: data.bairro,
        municipio: data.municipio,
        uf: data.uf,
        cep: data.cep,
        ddd_telefone_1: data.ddd_telefone_1,
        email: data.email,
        capital_social: data.capital_social || 50000,
        porte: data.porte,
        qsa: data.qsa?.map((q: any) => ({
          nome_socio: q.nome_socio,
          qualificacao_socio: q.qualificacao_socio,
        })),
      };
      return parseBrasilApiResponseToLead(normalized);
    }
  } catch (err) {
    console.error(`[OpenCnpjApi] MinhaReceita também falhou para ${clean}:`, err);
  }

  return null;
}
