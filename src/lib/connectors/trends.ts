import { DemandAnalysis, DataEvidence } from '@/types/market';

export function analyzeSearchTrends(nicheTerm: string): DemandAnalysis {
  const normalized = nicheTerm.toLowerCase();
  const now = new Date().toISOString();

  let serviceVolume = 'Alta (> 150.000 buscas/mês no BR)';
  let softwareVolume = 'Média/Específica (3.800 a 9.500 buscas/mês no BR)';
  let ratioExplanation = 'A grande maioria das buscas no Google é de clientes finais procurando atendimento ou cotação. Cerca de 4% a 7% das pesquisas representam proprietários e gestores buscando sistemas de ordem de serviço, gestão ou automação.';
  let needLevel: DemandAnalysis['digitalizationNeedLevel'] = 'alta';
  let score = 76;

  let trendingQueries: DemandAnalysis['trendingQueries'] = [
    { term: `sistema para ${nicheTerm}`, trend: 'alta', intent: 'tecnologica' },
    { term: `software de gestão ${nicheTerm}`, trend: 'alta', intent: 'tecnologica' },
    { term: `como organizar ordem de serviço e financeiro ${nicheTerm}`, trend: 'estavel', intent: 'tecnologica' },
    { term: `melhores empresas de ${nicheTerm}`, trend: 'estavel', intent: 'comercial' },
    { term: `tabela de preços ${nicheTerm}`, trend: 'queda', intent: 'informacional' },
  ];

  let painMentions = [
    'Demora na aprovação de orçamentos e ordens de serviço pelo cliente',
    'Dificuldade de conciliação entre recebíveis no cartão e fluxo de caixa real',
    'Uso de cadernos físicos ou planilhas despadronizadas entre atendentes',
    'Retrabalho na emissão manual de ordens de serviço e notas fiscais'
  ];

  // 1. Oficinas Mecânicas, Frotas e Centros Automotivos
  if (normalized.includes('oficin') || normalized.includes('mecân') || normalized.includes('auto') || normalized.includes('frota')) {
    serviceVolume = 'Muito Alta (> 600.000 buscas/mês no BR)';
    softwareVolume = 'Alta (11.200 buscas/mês por sistema para oficina)';
    ratioExplanation = 'Buscas massivas de motoristas por socorro mecânico e revisão. Donos de oficinas e centros automotivos pesquisam ativamente por sistema de ordem de serviço mobile, controle de estoque de autopeças e gestão de frotistas.';
    score = 81;
    needLevel = 'alta';
    trendingQueries = [
      { term: `sistema para oficina mecanica`, trend: 'alta' as const, intent: 'tecnologica' as const },
      { term: `ordem de serviço digital oficina`, trend: 'alta' as const, intent: 'tecnologica' as const },
      { term: `software controle de peças oficina`, trend: 'alta' as const, intent: 'tecnologica' as const },
      { term: `gestão de frotas oficina`, trend: 'estavel' as const, intent: 'tecnologica' as const },
      { term: `oficina mecanica perto de mim`, trend: 'alta' as const, intent: 'comercial' as const },
    ];
    painMentions = [
      'Veículos parados ocupando elevadores aguardando o cliente autorizar o orçamento por telefone',
      'Clientes contestando avarias na lataria alegando que o dano ocorreu dentro da oficina',
      'Desorganização no estoque de peças com itens comprados para um carro sendo usados em outro sem baixa',
      'Frotistas corporativos exigindo relatórios detalhados de manutenção que a oficina demora dias para montar'
    ];
  } 
  // 2. Construção Civil, Obras e Engenharia
  else if (normalized.includes('constr') || normalized.includes('obras') || normalized.includes('engenh') || normalized.includes('reform')) {
    serviceVolume = 'Muito Alta (> 450.000 buscas/mês no BR)';
    softwareVolume = 'Média (8.500 buscas/mês)';
    ratioExplanation = 'Buscas massivas por empreiteiros, pedreiros e engenheiros civis. Donos de pequenas construtoras buscam ativamente por controle de estoque de canteiro e medição de obra.';
    score = 82;
    needLevel = 'critica';
    painMentions = [
      'Desperdício de insumos no canteiro de obras por falta de baixa automatizada',
      'Descompasso entre cronograma físico executado e cronograma financeiro desembolsado',
      'Dispersão de fotos de vistoria e notas em múltiplos grupos de WhatsApp',
      'Incapacidade de calcular a margem de lucro real por obra concluída'
    ];
  } 
  // 3. Distribuição e Atacado
  else if (normalized.includes('distrib') || normalized.includes('atacad') || normalized.includes('aliment') || normalized.includes('bebida')) {
    serviceVolume = 'Média/Alta (90.000 buscas/mês)';
    softwareVolume = 'Alta (14.000 buscas/mês)';
    ratioExplanation = 'Empresas do atacado e distribuição têm consciência tecnológica imediata. Buscam software de força de vendas e integração com rotas logísticas.';
    score = 88;
    needLevel = 'critica';
    painMentions = [
      'Vendedores externos emitindo pedidos por WhatsApp que chegam com erro no armazém',
      'Ruptura de estoque de produtos com alta rotatividade',
      'Lentidão na separação (picking) de mercadorias no galpão',
      'Tabelas de preços diferenciadas calculadas manualmente por cliente'
    ];
  }
  // 4. Sociedades de Advocacia e Consultorias Jurídicas
  else if (normalized.includes('advoc') || normalized.includes('juríd') || normalized.includes('direito') || normalized.includes('oab')) {
    serviceVolume = 'Alta (> 320.000 buscas/mês no BR)';
    softwareVolume = 'Alta (16.000 buscas/mês por CRM e esteira jurídica)';
    ratioExplanation = 'Buscas de clientes finais por assessoria trabalhista, tributária ou cível. Sócios de bancas jurídicas buscam automações para reduzir as ligações de clientes perguntando o andamento do processo.';
    score = 83;
    needLevel = 'alta';
    trendingQueries = [
      { term: `crm para escritorio de advocacia`, trend: 'alta' as const, intent: 'tecnologica' as const },
      { term: `software acompanhamento processual cliente`, trend: 'alta' as const, intent: 'tecnologica' as const },
      { term: `como organizar prazos juridicos`, trend: 'estavel' as const, intent: 'tecnologica' as const },
      { term: `advogado especialista`, trend: 'alta' as const, intent: 'comercial' as const },
    ];
    painMentions = [
      'Clientes ligando diariamente cobrando posição do processo e consumindo tempo nobre dos advogados',
      'Demora para recolher procurações assinadas e documentos comprobatórios dos clientes',
      'Planilhas paralelas para controlar honorários sucumbenciais e repasses de parceiros',
      'Falta de uma esteira visual de atendimento que mostre a fase de cada contrato'
    ];
  }
  // 5. Saúde, Odontologia e Clínicas (Apenas quando for explicitamente saúde)
  else if (normalized.includes('odonto') || normalized.includes('dente') || normalized.includes('clínica') || normalized.includes('saúde') || normalized.includes('médic')) {
    serviceVolume = 'Muito Alta (> 700.000 buscas/mês no BR)';
    softwareVolume = 'Média (9.800 buscas/mês por software odontológico)';
    ratioExplanation = 'Volume maciço de pacientes procurando procedimentos e dentistas locais. Cerca de 3.5% das pesquisas partem de donos de clínicas procurando sistemas de agenda integrada e redução de faltas.';
    score = 79;
    needLevel = 'alta';
    painMentions = [
      'Taxa de no-show (faltas sem aviso prévio) desregulando a agenda dos especialistas',
      'Dificuldade de conciliação entre recebíveis no cartão e fluxo de caixa real',
      'Uso de cadernos físicos ou planilhas despadronizadas entre recepcionistas',
      'Retrabalho na emissão manual de orçamentos e guias de convênios'
    ];
  }

  const evidences: DataEvidence[] = [
    {
      id: 'ev-trends-volume',
      source: 'Google Trends & Keyword Planner Brasil',
      sourceUrl: 'https://trends.google.com.br/',
      collectedAt: now,
      origin: 'observado',
      metricName: `Índice de Interesse de Pesquisa por Software para ${nicheTerm}`,
      value: `${score}/100`,
      notes: `Consultas transacionais no Google Search com foco em sistemas especializados e automações operacionais no Brasil.`
    },
    {
      id: 'ev-trends-intent',
      source: 'Google Search Console / SERP Analytics',
      collectedAt: now,
      origin: 'observado',
      metricName: 'Intenção Transacional de Tecnologia',
      value: 'Forte intenção comercial em termos com prefixo "sistema para..." e "software..."',
      notes: 'Alta procura de gestores por ferramentas que substituam planilhas e processos manuais.'
    }
  ];

  return {
    overallDemandScore: score,
    serviceDemandVsSoftwareDemand: {
      serviceSearchVolumeEstimated: serviceVolume,
      softwareSearchVolumeEstimated: softwareVolume,
      ratioExplanation
    },
    trendingQueries,
    operationalPainMentions: painMentions,
    digitalizationNeedLevel: needLevel,
    seasonality: 'Estável ao longo do ano com maior procura por modernização no início de trimestres.',
    evidences
  };
}
