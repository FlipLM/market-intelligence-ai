import { 
  NicheBasicInfo, 
  SoftwareOpportunity, 
  CommercialViability, 
  CompetitiveAnalysis,
  TechAuditAnalysis 
} from '@/types/market';
import { TOP_50_NICHES_CATALOG } from '../data/top50Niches';

export function runTechAuditorAgent(params: {
  basicInfo: NicheBasicInfo;
  opportunities: SoftwareOpportunity[];
  viability: CommercialViability;
  competition: CompetitiveAnalysis;
}): TechAuditAnalysis {
  const { basicInfo, opportunities, viability } = params;
  const normalized = basicInfo.name.toLowerCase();

  const avgDevDays = opportunities.reduce((acc, o) => acc + o.typicalDevelopmentDays, 0) / (opportunities.length || 1);
  const avgSetupFee = (viability.recommendedPricing.implementationSetupMin + viability.recommendedPricing.implementationSetupMax) / 2;
  const avgMonthlyFee = (viability.recommendedPricing.monthlyFeeMin + viability.recommendedPricing.monthlyFeeMax) / 2;

  const dailyDevReturn = avgSetupFee / Math.max(1, avgDevDays);
  const devEffortVsRoiScore = Math.min(100, Math.round((dailyDevReturn / 400) * 80 + (avgMonthlyFee > 400 ? 20 : 10)));

  // Verificação no Catálogo Top 50
  const catalogMatch = TOP_50_NICHES_CATALOG.find(
    c => c.nicheQuery.toLowerCase() === normalized || normalized.includes(c.nicheQuery.toLowerCase()) || c.nicheQuery.toLowerCase().includes(normalized)
  );

  if (catalogMatch) {
    return {
      verdict: catalogMatch.typicalDevDays <= 16 ? 'altamente_viavel' : 'viavel_com_escopo_fechado',
      verdictTitle: `Recomendado: Ciclo de ${catalogMatch.typicalDevDays} Dias e Solução Modular para ${catalogMatch.nicheQuery}`,
      verdictReason: `O gargalo crítico deste segmento (${catalogMatch.specificPain}) possui arquitetura direta e repetível. A solução proposta (${catalogMatch.specificSolution}) pode ser empacotada como micro-SaaS ou entregue sob demanda com mais de 80% de reaproveitamento de código entre empresas do mesmo nicho no DF.`,
      devEffortVsRoiScore: Math.max(82, Math.min(96, Math.round(100 - catalogMatch.typicalDevDays * 1.2))),
      architectureComplexity: catalogMatch.typicalDevDays > 16 ? 'media' : 'baixa',
      recommendedTechStack: {
        frontend: 'Next.js 16 + React 19 + Tailwind CSS (PWA mobile-first)',
        backendAndDb: 'Node.js Route Handlers + PostgreSQL / Supabase',
        authAndSecurity: 'NextAuth ou Supabase Auth com RBAC (Administrador e Operação)',
        integrations: ['WhatsApp Cloud API para automação de mensagens e alertas', 'Gateway Pix para cobrança e conciliação']
      },
      reusabilityPercentageEstimated: 85,
      pitfallsToAvoid: [
        `Focar exclusivamente em resolver "${catalogMatch.specificPain}" no MVP. Evite adicionar funcionalidades periféricas antes de validar a adesão.`,
        'Garantir isolamento lógico por cliente (multi-tenant) e criptografia em repouso para conformidade com a LGPD.'
      ],
      maintenanceBurdenLevel: 'baixo',
      mvpDeliveryTargetDays: catalogMatch.typicalDevDays
    };
  }

  // 1. Oficinas Mecânicas, Frotas e Linha Pesada
  if (normalized.includes('oficin') || normalized.includes('mecân') || normalized.includes('auto') || normalized.includes('frota')) {
    return {
      verdict: 'altamente_viavel',
      verdictTitle: 'Recomendado: Alta Margem em Ordens de Serviço Mobile e Aprovação via WhatsApp',
      verdictReason: 'Oficinas sofrem com carros ocupando elevadores esperando aprovação de orçamento por telefone. Um PWA leve para o mecânico tirar foto da peça danificada com botão de aprovação rápida no WhatsApp do cliente resolve 90% da dor. Reutilização de código superior a 80% entre oficinas mecânicas.',
      devEffortVsRoiScore: 91,
      architectureComplexity: 'baixa',
      recommendedTechStack: {
        frontend: 'Next.js 16 + Tailwind CSS (PWA mobile com suporte a câmera para mecânicos)',
        backendAndDb: 'Node.js Route Handlers + PostgreSQL / Supabase para armazenamento de fotos de vistorias',
        authAndSecurity: 'Login simplificado por PIN/WhatsApp para mecânicos do pátio e senha para o gerente',
        integrations: ['WhatsApp Cloud API para envio de orçamento com fotos e botão de aprovação imediata', 'Integração com gateway de pagamento Pix para entrada/sinal de peças']
      },
      reusabilityPercentageEstimated: 85,
      pitfallsToAvoid: [
        'Não tentar criar um catálogo universal de peças automotivas no início (deixe a oficina cadastrar seus próprios itens e fornecedores).',
        'Evitar comunicação direta com hardware de scanners automotivos OBD2 no MVP; mantenha o foco no fluxo de OS, fotos e aprovação pelo cliente.'
      ],
      maintenanceBurdenLevel: 'baixo',
      mvpDeliveryTargetDays: 14
    };
  }

  // 2. Construção Civil, Engenharia e Obras
  if (normalized.includes('constr') || normalized.includes('obra') || normalized.includes('engenh') || normalized.includes('reform')) {
    return {
      verdict: 'viavel_com_escopo_fechado',
      verdictTitle: 'Altamente Lucrativo, mas Exige Escopo Rígido Anti-Feature Creep',
      verdictReason: 'Construtoras e engenheiros pagam tickets elevados de setup (R$ 5.000 a R$ 12.000), mas tendem a pedir relatórios e regras customizadas a cada nova obra. O segredo de engenharia é entregar um PWA focado exclusivamente em Diário de Obras + Baixa de Insumos sem tentar construir um ERP completo.',
      devEffortVsRoiScore: 84,
      architectureComplexity: 'media',
      recommendedTechStack: {
        frontend: 'Next.js 16 + Tailwind CSS + PWA com IndexedDB (para operação offline no canteiro)',
        backendAndDb: 'Node.js Route Handlers + PostgreSQL / Supabase com Storage S3 para fotos de alta resolução',
        authAndSecurity: 'Supabase Auth com RBAC (Engenheiro, Mestre de Obras, Financeiro)',
        integrations: ['WhatsApp Cloud API para envio de alertas diários', 'Gerador de PDF nativo no Node para relatórios de medição']
      },
      reusabilityPercentageEstimated: 75,
      pitfallsToAvoid: [
        'Não tentar integrar com softwares legados complexos (ex: Sienge) na versão inicial.',
        'Impedir upload de fotos sem compressão no client (pode estourar custos de storage e travar em conexões 3G).',
        'Fechar contrato com no máximo 2 rodadas de revisões de relatórios para evitar retrabalho infinito.'
      ],
      maintenanceBurdenLevel: 'baixo',
      mvpDeliveryTargetDays: 18
    };
  }

  // 3. Distribuição e Atacado
  if (normalized.includes('distrib') || normalized.includes('atacad') || normalized.includes('aliment') || normalized.includes('bebida')) {
    return {
      verdict: 'altamente_viavel',
      verdictTitle: 'Excelente Potencial para Micro-SaaS com Alta Recorrência',
      verdictReason: 'Distribuidoras necessitam de velocidade de pedidos e catálogo online. A dor é repetitiva em todas as empresas do segmento, permitindo 85% de reutilização de código entre clientes. A mensalidade (R$ 600 a R$ 1.800/mês) cobre com folga os custos de cloud.',
      devEffortVsRoiScore: 92,
      architectureComplexity: 'media',
      recommendedTechStack: {
        frontend: 'Next.js 16 + React 19 + Tailwind CSS',
        backendAndDb: 'PostgreSQL com Prisma ORM + Redis para cache de catálogo e tabelas de preços',
        authAndSecurity: 'JWT corporativo com login por CNPJ e perfis de vendedor/representante',
        integrations: ['Webhooks de notificação no WhatsApp', 'Exportação de pedidos em JSON/CSV para conciliação com ERP interno']
      },
      reusabilityPercentageEstimated: 85,
      pitfallsToAvoid: [
        'Evitar emissão direta de NF-e no MVP (deixe o cliente faturar no ERP dele via exportação de pedido).',
        'Cuidado com concorrência de estoque em tempo real: utilize travas otimistas no banco.'
      ],
      maintenanceBurdenLevel: 'baixo',
      mvpDeliveryTargetDays: 20
    };
  }

  // 4. Sociedades de Advocacia e Serviços Jurídicos
  if (normalized.includes('advoc') || normalized.includes('juríd') || normalized.includes('direito') || normalized.includes('oab')) {
    return {
      verdict: 'altamente_viavel',
      verdictTitle: 'Alta Margem de Lucro e Baixíssimo Esforço de Infraestrutura',
      verdictReason: 'Bancas de advogados possuem alto faturamento e pagam bem por automações que poupam tempo dos sócios. Soluções de portais de acompanhamento e esteiras de pós-venda para clientes exigem pouca infraestrutura de servidores e geram baixo volume de tickets de suporte.',
      devEffortVsRoiScore: 89,
      architectureComplexity: 'baixa',
      recommendedTechStack: {
        frontend: 'Next.js App Router + Tailwind CSS responsivo para desktop e mobile',
        backendAndDb: 'PostgreSQL + Prisma ou SQLite em servidor VPS leve',
        authAndSecurity: 'Autenticação com 2FA e criptografia em dados de processos',
        integrations: ['APIs de WhatsApp para aviso de andamento processual ao cliente', 'Assinatura digital e gerador de procurações em PDF']
      },
      reusabilityPercentageEstimated: 90,
      pitfallsToAvoid: [
        'Conformidade rígida com sigilo da OAB e LGPD: nunca compartilhe instâncias sem isolamento de tenant.',
        'Não tentar criar um repositório jurídico completo: foque na esteira de atendimento e pós-venda.'
      ],
      maintenanceBurdenLevel: 'baixo',
      mvpDeliveryTargetDays: 14
    };
  }

  // 5. Saúde, Clínicas e Odontologia (Apenas quando for explicitamente saúde)
  if (normalized.includes('odonto') || normalized.includes('dente') || normalized.includes('clínica') || normalized.includes('saúde') || normalized.includes('médic')) {
    return {
      verdict: 'altamente_viavel',
      verdictTitle: 'Recomendado: Ciclo de Desenvolvimento Rápido e Baixo Custo de Manutenção',
      verdictReason: 'O nicho possui regras de negócio bem padronizadas (agendamento, confirmação, histórico e recebimento). A arquitetura é direta e pode ser reaproveitada em até 85% entre diferentes estabelecimentos de saúde.',
      devEffortVsRoiScore: 90,
      architectureComplexity: 'baixa',
      recommendedTechStack: {
        frontend: 'Next.js + Tailwind CSS (PWA mobile-first para a secretária e paciente)',
        backendAndDb: 'PostgreSQL ou Appwrite/Supabase com banco relacional e backups diários',
        authAndSecurity: 'NextAuth com papéis (Admin, Recepção, Especialista)',
        integrations: ['WhatsApp Cloud API para disparo de confirmações', 'Integração Pix para cobrança de sinal antecipado']
      },
      reusabilityPercentageEstimated: 85,
      pitfallsToAvoid: [
        'Não construir prontuário médico complexo com CID-10 no primeiro mês; priorize a esteira de agendamento e redução de faltas.',
        'Sempre prever isolamento de dados de pacientes para cumprir a LGPD da Saúde.'
      ],
      maintenanceBurdenLevel: 'baixo',
      mvpDeliveryTargetDays: 12
    };
  }

  // 6. Serviços Corporativos Gerais & B2B
  return {
    verdict: 'altamente_viavel',
    verdictTitle: 'Recomendado: Foco em Automação de Ordens de Serviço e Cobrança Recorrente',
    verdictReason: 'Empresas de serviços possuem gargalos no controle de chamados e cobrança de contratos. Um painel web com esteira de atendimento e alertas automáticos via WhatsApp resolve o principal ponto de atrito sem complexidades técnicas elevadas.',
    devEffortVsRoiScore: 88,
    architectureComplexity: 'baixa',
    recommendedTechStack: {
      frontend: 'Next.js 16 + Tailwind CSS',
      backendAndDb: 'Node.js + PostgreSQL ou SQLite estruturado',
      authAndSecurity: 'Autenticação baseada em sessão com papéis de operador e administrador',
      integrations: ['Disparo de mensagens via WhatsApp API', 'Cobrança Pix integrada']
    },
    reusabilityPercentageEstimated: 80,
    pitfallsToAvoid: [
      'Evitar customizações de layout cliente a cliente; mantenha o core padronizado com campos flexíveis.',
      'Não assumir responsabilidade por suporte de hardware do cliente.'
    ],
    maintenanceBurdenLevel: 'baixo',
    mvpDeliveryTargetDays: 14
  };
}
