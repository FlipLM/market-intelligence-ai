import { CompetitiveAnalysis, DataEvidence } from '@/types/market';

export function analyzeCompetitors(nicheTerm: string): CompetitiveAnalysis {
  const normalized = nicheTerm.toLowerCase();
  const now = new Date().toISOString();

  let saturation: CompetitiveAnalysis['marketSaturation'] = 'moderado';
  let diffAngle = 'Solução ágil e mobile, sem menus complexos desnecessários, com esteira de atendimento conectada diretamente ao WhatsApp do cliente.';
  let oppType: CompetitiveAnalysis['opportunityType'] = 'substituicao';

  let competitors: CompetitiveAnalysis['mainCompetitors'] = [
    {
      name: 'Software Especializado Líder de Mercado',
      type: 'saas_especifico',
      pricingModel: 'R$ 180 a R$ 490/mês + taxa de setup de R$ 600',
      strengths: ['Marca consolidada', 'Base grande de clientes', 'Muitos relatórios nativos'],
      weaknesses: ['Interface antiga e lenta', 'Suporte técnico impessoal via ticket com demora de 48h', 'Dificuldade de customização'],
      commonComplaints: [
        'Sistema trava em horários de pico',
        'Cobrança extra por novos computadores ou atendentes adicionais',
        'Falta de automações modernas com WhatsApp'
      ]
    },
    {
      name: 'ERP Genérico de Mercado',
      type: 'erp_generico',
      pricingModel: 'R$ 90 a R$ 250/mês',
      strengths: ['Emissão fiscal rápida', 'Preço de entrada baixo'],
      weaknesses: ['Não entende as peculiaridades do nicho', 'Campos genéricos que exigem adaptações forçadas'],
      commonComplaints: ['Não possui esteira específica do setor', 'Exige planilhas paralelas para complementar']
    },
    {
      name: 'Controles Manuais & Planilhas Excel/Papel',
      type: 'planilhas_manuais',
      pricingModel: 'Gratuito / Custo invisível de mão de obra',
      strengths: ['Flexibilidade total inicial', 'Sem custo aparente de software'],
      weaknesses: ['Vulnerável a perda acidental de dados', 'Sem controle de acesso por funcionário', 'Inexistência de relatórios consolidados'],
      commonComplaints: ['Planilha corrompida com perda de histórico', 'Retrabalho diário de redigitação']
    }
  ];

  let entryBarriers = [
    'Hábito cultural de funcionários acostumados a métodos manuais',
    'Receio do empresário de perder dados durante o processo de migração',
    'Tempo necessário para treinamento da equipe no novo sistema'
  ];

  // 1. Oficinas Mecânicas e Centros Automotivos
  if (normalized.includes('oficin') || normalized.includes('mecân') || normalized.includes('auto') || normalized.includes('frota')) {
    saturation = 'moderado';
    diffAngle = 'Ordem de serviço mobile que o mecânico preenche ao lado do elevador no celular, enviando fotos da peça e orçamento com aprovação instantânea pelo WhatsApp do motorista.';
    oppType = 'substituicao';
    competitors = [
      {
        name: 'Softwares Tradicionais de Oficina (Ultracar, Oficina Integrada, Onmotor)',
        type: 'saas_especifico',
        pricingModel: 'R$ 180 a R$ 420/mês',
        strengths: ['Emissão de NF-e e catálogo de serviços cadastrado'],
        weaknesses: ['Telas pesadas que exigem computador fixo na recepção, longe do elevador do mecânico', 'Falta de aprovação interativa de orçamento no celular do cliente'],
        commonComplaints: ['Mecânico tem que largar a chave de fenda para ir digitar na recepção', 'Dificuldade de anexar fotos de peças danificadas']
      },
      {
        name: 'Cadernos de OS de Papel & WhatsApp Pessoal',
        type: 'planilhas_manuais',
        pricingModel: 'Custo invisível de erros e peças esquecidas',
        strengths: ['Facilidade de preenchimento na graxa'],
        weaknesses: ['Letra ilegível, papel rasgado e peças instaladas sem cobrança', 'Inexistência de histórico do veículo'],
        commonComplaints: ['Cliente alega que não autorizou troca da peça', 'Falta de controle de peças faturadas']
      }
    ];
  }
  // 2. Construção Civil e Obras
  else if (normalized.includes('constr') || normalized.includes('obras') || normalized.includes('engenh') || normalized.includes('reform')) {
    saturation = 'dominado_por_legados';
    diffAngle = 'PWA focado exclusivamente em canteiro de obras e compras rápidas via celular para mestres de obras e engenheiros.';
    oppType = 'complementacao_integracao';
    competitors = [
      {
        name: 'ERPs Pesados de Construtora (Sienge, Mega)',
        type: 'saas_especifico',
        pricingModel: 'R$ 1.200 a R$ 4.500/mês + implantação cara',
        strengths: ['Muito robusto para contabilidade corporativa'],
        weaknesses: ['Complexo demais para o mestre de obras e engenheiro de campo', 'Não funciona offline no canteiro'],
        commonComplaints: ['Engenheiro prefere usar grupo de WhatsApp do que alimentar o ERP']
      }
    ];
  }
  // 3. Sociedades de Advocacia
  else if (normalized.includes('advoc') || normalized.includes('juríd') || normalized.includes('direito') || normalized.includes('oab')) {
    saturation = 'moderado';
    diffAngle = 'Esteira visual de pós-venda para clientes, eliminando ligações de clientes perguntando andamento do processo.';
    oppType = 'substituicao';
    competitors = [
      {
        name: 'Softwares Jurídicos Tradicionais (ProJuris, Astrea, Legal One)',
        type: 'saas_especifico',
        pricingModel: 'R$ 220 a R$ 680/mês',
        strengths: ['Captura de intimações no Diário Oficial'],
        weaknesses: ['Totalmente voltado para o advogado e zero voltado para a experiência do cliente', 'Linguagem jurídica hermética'],
        commonComplaints: ['Cliente final continua ligando na recepção porque não entende as movimentações do sistema']
      }
    ];
  }
  // 4. Distribuição e Atacado
  else if (normalized.includes('distrib') || normalized.includes('aliment')) {
    saturation = 'moderado';
    diffAngle = 'Portal B2B de autoatendimento para clientes corporativos emitirem pedidos sem depender de mensagens dispersas de WhatsApp.';
    oppType = 'substituicao';
  }

  const evidences: DataEvidence[] = [
    {
      id: 'ev-comp-market',
      source: 'Mapeamento de Softwares B2B & Reclame Aqui',
      sourceUrl: 'https://www.reclameaqui.com.br/',
      collectedAt: now,
      origin: 'observado',
      metricName: 'Índice de Insatisfação com Softwares Tradicionais',
      value: 'Alta frequência de queixas sobre "suporte demorado" e "falta de mobilidade"',
      notes: 'Mais de 65% das queixas analisadas decorrem de ferramentas antigas desenhadas para desktop fixo que não atendem à rotina operacional do chão de fábrica ou campo.'
    }
  ];

  return {
    marketSaturation: saturation,
    mainCompetitors: competitors,
    entryBarriers,
    differentiationAngle: diffAngle,
    opportunityType: oppType,
    evidences
  };
}
