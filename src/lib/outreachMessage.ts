import type { RecentCompanyLead } from '@/types/recentCompanies';
import { formatProvenanceText } from '@/types/provenance';

export const STANDARD_OUTREACH_TEMPLATE =
  'Olá, {nome}! Tudo bem? Aqui é o {remetente}, desenvolvedor aqui de Brasília. Encontrei a {empresa} pelo {origem} e gostei do trabalho de vocês. Crio ferramentas simples de gestão (agenda, estoque, orçamentos) para negócios pequenos e estou conversando com donos de {categoria} para entender como organizam a rotina. Posso te fazer 2 perguntas rápidas? Não é pegadinha de venda. Se não for o momento, sem problema, é só me avisar que não volto a escrever.';

export const FORBIDDEN_OUTREACH_PATTERNS: RegExp[] = [
  /muitos empres[aá]rios/i,
  /acompanho/i,
  /gargalo/i,
  /\d+\s*%/,
  /taxa de resposta/i,
  /primeiro m[eê]s de opera[cç][aã]o/i,
  /sweet spot/i,
];

function extractVerifiedFirstName(company: RecentCompanyLead): string | null {
  if (company.contato.tipoContato.valor === 'possivel_contabilidade') {
    return null;
  }

  const holder = company.titularOuSocioPrincipal;
  if (holder.status === 'desconhecido' || !holder.valor?.nome) {
    return null;
  }

  // Só usa nome vindo de QSA verificado ou titular MEI/EI derivado da razão social
  if (holder.status !== 'verificado' && holder.valor.origem !== 'mei_ei_titular') {
    return null;
  }

  // Remove dígitos de CNPJ/CPF frequentemente presentes na razão social do MEI (ex: "58.123.456 JOAO SILVA")
  const cleaned = holder.valor.nome
    .replace(/\d{2}\.?\d{3}\.?\d{3}\/?\d{0,4}-?\d{0,2}/g, ' ')
    .replace(/\d+/g, ' ')
    .trim();

  const firstToken = cleaned.split(/\s+/)[0] || '';
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ]{2,}$/.test(firstToken)) {
    return null;
  }

  // Capitaliza apenas a primeira letra
  return firstToken.charAt(0).toUpperCase() + firstToken.slice(1).toLowerCase();
}

export function resolveOutreachVariables(
  company: RecentCompanyLead,
  remetenteInput = 'Filipe'
): {
  nome: string | null;
  remetente: string;
  empresa: string;
  origem: string;
  categoria: string;
  podeParabenizarAbertura: boolean;
} {
  const nome = extractVerifiedFirstName(company);
  const remetente = remetenteInput.trim() || 'Filipe';

  const empresa =
    company.nomeFantasia.status !== 'desconhecido' && company.nomeFantasia.valor
      ? company.nomeFantasia.valor
      : company.razaoSocial.status !== 'desconhecido' && company.razaoSocial.valor
      ? company.razaoSocial.valor
      : 'sua empresa';

  const origem =
    company.cnpj.status === 'verificado'
      ? 'cadastro público de empresas / Receita Federal'
      : 'cadastro público de empresas';

  const categoria =
    company.setorRotulo.status !== 'desconhecido' &&
    company.setorRotulo.valor &&
    company.setor.valor !== 'outros'
      ? company.setorRotulo.valor.toLowerCase()
      : 'negócios como o seu';

  const podeParabenizarAbertura =
    company.dataAbertura.status === 'verificado' && Boolean(company.dataAbertura.valor);

  return {
    nome,
    remetente,
    empresa,
    origem,
    categoria,
    podeParabenizarAbertura,
  };
}

export function buildStandardWhatsAppMessage(
  company: RecentCompanyLead,
  options?: {
    remetente?: string;
    includeOpeningCongrats?: boolean;
    mode?: 'primeiro_contato' | 'followup';
  }
): string {
  const vars = resolveOutreachVariables(company, options?.remetente);
  const saudacao = vars.nome ? `Olá, ${vars.nome}! Tudo bem?` : 'Olá! Tudo bem?';

  if (options?.mode === 'followup') {
    return `${saudacao} Aqui é o ${vars.remetente} novamente. Passando só uma vez para saber se você chegou a ver minha mensagem anterior sobre conversar rapidamente sobre a rotina da ${vars.empresa}. Se não for o momento, sem problema — é só me avisar que não volto a escrever.`;
  }

  const congratsBlock =
    options?.includeOpeningCongrats && vars.podeParabenizarAbertura
      ? ' Parabéns pela abertura recente!'
      : '';

  return `${saudacao} Aqui é o ${vars.remetente}, desenvolvedor aqui de Brasília. Encontrei a ${vars.empresa} pelo ${vars.origem} e gostei do trabalho de vocês.${congratsBlock} Crio ferramentas simples de gestão (agenda, estoque, orçamentos) para negócios pequenos e estou conversando com donos de ${vars.categoria} para entender como organizam a rotina. Posso te fazer 2 perguntas rápidas? Não é pegadinha de venda. Se não for o momento, sem problema, é só me avisar que não volto a escrever.`;
}

export function evaluateFollowupEligibility(
  company: RecentCompanyLead,
  now: Date = new Date()
): {
  allowed: boolean;
  reason: string;
  daysSinceFirstContact: number | null;
} {
  if (company.abordagem.naoContatar || company.abordagem.statusContato === 'recusou') {
    return {
      allowed: false,
      reason: 'Contato bloqueado na lista "não contatar" (recusou / pediu saída).',
      daysSinceFirstContact: null,
    };
  }

  if (company.abordagem.statusContato === 'respondeu') {
    return {
      allowed: false,
      reason: 'Contato já respondeu; conduzir atendimento diretamente.',
      daysSinceFirstContact: null,
    };
  }

  if (
    company.abordagem.followupEnviadoEm !== null ||
    company.abordagem.statusContato === 'followup_enviado'
  ) {
    return {
      allowed: false,
      reason: 'Limite atingido: máximo de 1 follow-up já foi enviado.',
      daysSinceFirstContact: null,
    };
  }

  if (!company.abordagem.primeiroContatoEm) {
    return {
      allowed: false,
      reason: 'Primeiro contato ainda não foi registrado.',
      daysSinceFirstContact: null,
    };
  }

  const firstDate = new Date(company.abordagem.primeiroContatoEm);
  if (Number.isNaN(firstDate.getTime())) {
    return {
      allowed: false,
      reason: 'Data do primeiro contato inválida.',
      daysSinceFirstContact: null,
    };
  }

  const diffDays = Math.floor((now.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 4) {
    return {
      allowed: false,
      reason: `Aguardar janela de 4 a 5 dias após o 1º contato (passaram ${diffDays} dia(s)).`,
      daysSinceFirstContact: diffDays,
    };
  }

  return {
    allowed: true,
    reason: `Liberado para follow-up único (${diffDays} dia(s) após o 1º contato).`,
    daysSinceFirstContact: diffDays,
  };
}

export function findForbiddenOutreachContent(message: string): string[] {
  const hits: string[] = [];
  for (const pattern of FORBIDDEN_OUTREACH_PATTERNS) {
    const match = message.match(pattern);
    if (match) {
      hits.push(match[0]);
    }
  }
  return hits;
}

export function getDisplayPhoneForWhatsApp(company: RecentCompanyLead): string | null {
  const raw = formatProvenanceText(company.contato.telefone1, '').replace(/\D/g, '');
  if (raw.length >= 10) return raw;
  const raw2 = formatProvenanceText(company.contato.telefone2, '').replace(/\D/g, '');
  return raw2.length >= 10 ? raw2 : null;
}
