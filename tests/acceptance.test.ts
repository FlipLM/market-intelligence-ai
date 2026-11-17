import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { parseBrasilApiResponseToLead } from '../src/lib/connectors/openCnpjApi';
import { classifyContactOrigin } from '../src/lib/connectors/contactClassifier';
import {
  buildStandardWhatsAppMessage,
  evaluateFollowupEligibility,
  findForbiddenOutreachContent,
} from '../src/lib/outreachMessage';
import { calculateNicheScore } from '../src/lib/scoring';
import { generateFinancialScenarios } from '../src/lib/simulator';
import { runDemandIntelligenceAgent } from '../src/lib/agents/demandIntelligenceAgent';
import { runPaidTrafficAgent } from '../src/lib/agents/paidTrafficAgent';
import { runCompetitiveIntelligenceAgent } from '../src/lib/agents/competitiveIntelligenceAgent';
import { runSoftwareOpportunityAgent } from '../src/lib/agents/softwareOpportunityAgent';
import { runCommercialViabilityAgent } from '../src/lib/agents/commercialViabilityAgent';
import { runDecisionAnalystAgent } from '../src/lib/agents/decisionAnalystAgent';
import { runTechAuditorAgent } from '../src/lib/agents/techAuditorAgent';
import { runOutreachCopywriterAgent } from '../src/lib/agents/outreachCopywriterAgent';
import { emptyBaseAggregation } from '../src/lib/agents/orchestrator';
import { DEFAULT_WEIGHTS } from '../src/lib/db';
import { isProvenanceField, desconhecido, inferido, verificado } from '../src/types/provenance';

function collectFilesRecursively(dirPath: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dirPath)) return results;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFilesRecursively(full));
    } else if (/\.(ts|tsx|js|mjs)$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

function assertAllProvenanceFieldsValid(obj: unknown, pathLabel: string) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    obj.forEach((item, idx) => assertAllProvenanceFieldsValid(item, `${pathLabel}[${idx}]`));
    return;
  }

  const record = obj as Record<string, unknown>;
  if ('valor' in record || 'status' in record) {
    if ('valor' in record && 'status' in record && 'fonte' in record && 'consultado_em' in record) {
      assert.equal(
        isProvenanceField(record),
        true,
        `Campo de proveniência inválido em ${pathLabel}: ${JSON.stringify(record)}`
      );
      return;
    }
  }

  for (const [k, v] of Object.entries(record)) {
    assertAllProvenanceFieldsValid(v, `${pathLabel}.${k}`);
  }
}

test('(a) Todos os campos de empresa possuem status/fonte e sem fallbacks inventados', () => {
  const minimalApiPayload = {
    cnpj: '67535568000188',
    razao_social: '67.535.568 DAVI DE ALMEIDA ALBANO VILELA',
    nome_fantasia: '',
    descricao_situacao_cadastral: 'ATIVA',
    data_inicio_atividade: '2026-06-17',
    cnae_fiscal: 4789099,
    cnae_fiscal_descricao: 'Comércio varejista de outros produtos não especificados anteriormente',
    uf: 'DF',
    municipio: 'BRASILIA',
    ddd_telefone_1: '',
    email: null,
    opcao_pelo_mei: true,
    natureza_juridica: 'Empresário (Individual)',
    qsa: [],
  };

  const lead = parseBrasilApiResponseToLead(minimalApiPayload, {
    fonte: 'Receita Federal via MinhaReceita',
    url_ou_api: 'https://minhareceita.org/67535568000188',
    consultado_em: '2026-11-17T14:00:00.000Z',
  });

  // Verifica que todos os campos com wrapper de proveniência possuem status, fonte e consultado_em
  assertAllProvenanceFieldsValid(lead, 'lead');

  // Campos ausentes DEVEM virar desconhecido, nunca fallback inventado
  assert.equal(lead.contato.telefone1.status, 'desconhecido');
  assert.equal(lead.contato.telefone1.valor, null);
  assert.equal(lead.contato.email.status, 'desconhecido');
  assert.equal(lead.contato.email.valor, null);
  assert.equal(lead.capitalSocial.status, 'desconhecido');
  assert.equal(lead.capitalSocial.valor, null);
  assert.equal(lead.diagnostico.possuiSistema.status, 'desconhecido');
  assert.equal(lead.diagnostico.possuiSistema.valor, null);

  // MEI sem QSA -> titular inferido da razão social
  assert.equal(lead.titularOuSocioPrincipal.status, 'inferido');
  assert.equal(lead.titularOuSocioPrincipal.valor?.origem, 'mei_ei_titular');
});

test('(a) Todos os campos de nicho possuem status/fonte e critérios sem evidência recebem null', () => {
  const demand = runDemandIntelligenceAgent();
  const paidTraffic = runPaidTrafficAgent();
  const competition = runCompetitiveIntelligenceAgent();
  const opportunities = runSoftwareOpportunityAgent();
  const commercialViability = runCommercialViabilityAgent();
  const scoring = calculateNicheScore(
    { demand, paidTraffic, competition, viability: commercialViability, opportunities },
    DEFAULT_WEIGHTS
  );
  const financialScenarios = generateFinancialScenarios();
  const basicInfo = {
    id: 'teste_nicho',
    name: inferido({ valor: 'Teste Nicho', fonte: 'Entrada do usuário', regra: 'Manual' }),
    segment: desconhecido<string>('Não informado'),
    subsegment: desconhecido<string>('Não informado'),
    cnaes: desconhecido<string[]>('Não informado'),
    cnaeDescricao: desconhecido<string>('Não informado'),
    description: desconhecido<string>('Não informado'),
    geographicScope: {
      country: verificado({ valor: 'Brasil', fonte: 'Padrão' }),
      state: inferido({ valor: 'DF', fonte: 'Entrada do usuário', regra: 'Manual' }),
      city: desconhecido<string>('Não informado'),
    },
  };
  const decision = runDecisionAnalystAgent({ basicInfo, viability: commercialViability, scoring });
  const techAudit = runTechAuditorAgent();
  const outreachCopy = runOutreachCopywriterAgent();

  const report = {
    id: basicInfo.id,
    recordStatus: 'ativo' as const,
    createdAt: '2026-11-17T14:00:00.000Z',
    updatedAt: '2026-11-17T14:00:00.000Z',
    basicInfo,
    baseAggregation: emptyBaseAggregation(),
    demand,
    paidTraffic,
    competition,
    opportunities,
    commercialViability,
    scoring,
    financialScenarios,
    whyEnterArguments: decision.whyEnterArguments,
    whyNotEnterRisks: decision.whyNotEnterRisks,
    decisionRecommendation: decision.decisionRecommendation,
    recommendedAction: decision.recommendedAction,
    dataSufficiency: decision.dataSufficiency,
    techAudit,
    outreachCopy,
  };

  assertAllProvenanceFieldsValid(report, 'nicheReport');
  assert.equal(scoring.finalScore, null);
  assert.equal(scoring.confidenceLevel, 'baixa');
  assert.equal(scoring.evidencedCriteriaCount, 0);
  for (const item of scoring.items) {
    assert.equal(item.rawScore, null);
    assert.equal(item.status, 'desconhecido');
    assert.ok(item.fonte.trim().length > 0);
  }
  assert.equal(financialScenarios[0].isHypotheticalScenario, true);
  assert.equal(financialScenarios[0].dealsClosed, 0);
});

test('(b) Proibido Math.random, gerador sintético ou import de __fixtures__ no caminho de produção', () => {
  const srcFiles = collectFilesRecursively(path.resolve(process.cwd(), 'src'));
  const scriptFiles = collectFilesRecursively(path.resolve(process.cwd(), 'scripts'));
  const files = [...srcFiles, ...scriptFiles];

  const forbiddenPatterns = [
    /\bMath\.random\b/,
    /\bcreatePrng\b/,
    /\bgetMasterRecentCompanies\b/,
    /\bTOP_50_NICHES_CATALOG\b/,
    /\binitializeDatabaseSeed\b/,
    /\bscoreSemSistema\b/,
    /__fixtures__/,
  ];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    for (const pattern of forbiddenPatterns) {
      assert.equal(
        pattern.test(content),
        false,
        `Padrão proibido ${pattern} encontrado em ${path.relative(process.cwd(), file)}`
      );
    }
  }

  const marketDb = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), 'data', 'market_intelligence.json'), 'utf-8')
  );
  assert.equal(marketDb.niches.length, 0, 'Base ativa de nichos não deve conter registros sintéticos');
  assert.ok(
    Array.isArray(marketDb.discardedSynthetic) &&
      marketDb.discardedSynthetic.every((d: { recordStatus: string }) => d.recordStatus === 'descartado_sintetico')
  );
});

test('(c) Mensagem de abordagem respeita modelo padrão, proibições, contabilidade, follow-up e não contatar', () => {
  // Caso 1: MEI com CNPJ na razão social e sem QSA
  const meiLead = parseBrasilApiResponseToLead(
    {
      cnpj: '67535568000188',
      razao_social: '67.535.568 DAVI DE ALMEIDA ALBANO VILELA',
      data_inicio_atividade: '2026-06-17',
      cnae_fiscal: 4789099,
      cnae_fiscal_descricao: 'Comércio varejista',
      opcao_pelo_mei: true,
      natureza_juridica: 'Empresário (Individual)',
      ddd_telefone_1: '61999990001',
      qsa: [],
    },
    { fonte: 'Receita Federal via MinhaReceita', url_ou_api: 'https://minhareceita.org/67535568000188' }
  );

  const msgMei = buildStandardWhatsAppMessage(meiLead, {
    remetente: 'Filipe',
    includeOpeningCongrats: true,
  });
  assert.ok(msgMei.startsWith('Olá, Davi! Tudo bem?'), `Saudação incorreta: ${msgMei}`);
  assert.ok(msgMei.includes('Parabéns pela abertura recente!'));
  assert.equal(findForbiddenOutreachContent(msgMei).length, 0);

  // Caso 2: Contato classificado como possível contabilidade NÃO deve usar {nome}
  const contabLead = parseBrasilApiResponseToLead(
    {
      cnpj: '66768550000163',
      razao_social: 'MARIANA MENDES RIBEIRO LTDA',
      nome_fantasia: 'MARIANA MENDES ARQUITETURA',
      data_inicio_atividade: '2026-05-13',
      cnae_fiscal: 7111100,
      email: 'contato@contabilidadesilva.com.br',
      ddd_telefone_1: '6133334444',
      qsa: [{ nome_socio: 'MARIANA MENDES RIBEIRO', qualificacao_socio: 'Sócia-Administradora' }],
    },
    { fonte: 'Receita Federal via MinhaReceita', url_ou_api: 'https://minhareceita.org/66768550000163' }
  );
  assert.equal(contabLead.contato.tipoContato.valor, 'possivel_contabilidade');
  assert.equal(contabLead.contato.tipoContato.status, 'inferido');

  const msgContab = buildStandardWhatsAppMessage(contabLead, { remetente: 'Filipe' });
  assert.ok(msgContab.startsWith('Olá! Tudo bem?'), `Deveria omitir nome para contabilidade: ${msgContab}`);
  assert.equal(findForbiddenOutreachContent(msgContab).length, 0);

  // Caso 3: Data de abertura desconhecida NÃO pode incluir Parabéns pela abertura
  const noDateLead = parseBrasilApiResponseToLead(
    {
      cnpj: '67695381000141',
      razao_social: 'TRANSBORDO LICITACOES E CONSTRUCOES LTDA',
      cnae_fiscal: 4330499,
      qsa: [],
    },
    { fonte: 'Receita Federal via MinhaReceita', url_ou_api: 'https://minhareceita.org/67695381000141' }
  );
  const msgNoDate = buildStandardWhatsAppMessage(noDateLead, { includeOpeningCongrats: true });
  assert.equal(msgNoDate.includes('Parabéns pela abertura'), false);
  assert.ok(msgNoDate.startsWith('Olá! Tudo bem?'));

  // Caso 4: Regra de follow-up (4-5 dias e máximo 1) e lista Não Contatar
  const day0 = new Date('2026-11-10T10:00:00.000Z');
  noDateLead.abordagem.primeiroContatoEm = day0.toISOString();
  noDateLead.abordagem.statusContato = 'primeiro_contato_enviado';

  assert.equal(
    evaluateFollowupEligibility(noDateLead, new Date('2026-11-12T10:00:00.000Z')).allowed,
    false
  );
  assert.equal(
    evaluateFollowupEligibility(noDateLead, new Date('2026-11-14T10:00:00.000Z')).allowed,
    true
  );

  noDateLead.abordagem.followupEnviadoEm = '2026-11-14T10:00:00.000Z';
  noDateLead.abordagem.statusContato = 'followup_enviado';
  assert.equal(
    evaluateFollowupEligibility(noDateLead, new Date('2026-11-20T10:00:00.000Z')).allowed,
    false
  );
});

test('(d) Heurística detecta telefone repetido em múltiplos CNPJs como possivel_contabilidade', () => {
  const leadA = parseBrasilApiResponseToLead(
    {
      cnpj: '11111111000191',
      razao_social: 'EMPRESA ALFA LTDA',
      ddd_telefone_1: '6133221100',
      qsa: [{ nome_socio: 'CARLOS ALBERTO', qualificacao_socio: 'Sócio' }],
    },
    { fonte: 'MinhaReceita', url_ou_api: 'https://minhareceita.org/11111111000191' }
  );

  const leadB = parseBrasilApiResponseToLead(
    {
      cnpj: '22222222000191',
      razao_social: 'EMPRESA BETA LTDA',
      ddd_telefone_1: '6133221100',
      qsa: [{ nome_socio: 'MARIA SOUZA', qualificacao_socio: 'Sócia' }],
    },
    { fonte: 'MinhaReceita', url_ou_api: 'https://minhareceita.org/22222222000191' },
    undefined,
    [leadA]
  );

  const classification = classifyContactOrigin(leadB, [leadA, leadB]);
  assert.equal(classification.tipoContato.valor, 'possivel_contabilidade');
  assert.equal(classification.tipoContato.status, 'inferido');
});
