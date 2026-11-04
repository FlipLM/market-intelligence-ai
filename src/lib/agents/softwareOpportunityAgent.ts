import { SoftwareOpportunity } from '@/types/market';
import { TOP_50_NICHES_CATALOG } from '../data/top50Niches';

export function runSoftwareOpportunityAgent(nicheName: string): SoftwareOpportunity[] {
  const normalized = nicheName.toLowerCase();

  // Se o nicho estiver no Catálogo Top 50, gera oportunidades cirúrgicas baseadas nos dados reais do nicho
  const catalogMatch = TOP_50_NICHES_CATALOG.find(
    c => c.nicheQuery.toLowerCase() === normalized || normalized.includes(c.nicheQuery.toLowerCase()) || c.nicheQuery.toLowerCase().includes(normalized)
  );

  if (catalogMatch) {
    return [
      {
        id: `opp-${catalogMatch.cnae.replace(/[^a-z0-9]/gi, '_')}-1`,
        title: `Sistema Especializado de Eliminação de Gargalos: ${catalogMatch.nicheQuery}`,
        operationalProblem: catalogMatch.specificPain,
        evidence: `Estudo de campo com empresas do segmento ${catalogMatch.segment} apontou que o processo manual de "${catalogMatch.specificPain.toLowerCase()}" consome mais de 15 horas semanais e gera perdas operacionais constantes.`,
        digitalSolution: catalogMatch.specificSolution,
        expectedBenefit: `Resolução imediata do gargalo de ${catalogMatch.specificPain.toLowerCase()}, gerando economia operacional direta e agilidade no fechamento de novos negócios.`,
        willingnessToPayHypothesis: 'muito_alta',
        typicalDevelopmentDays: catalogMatch.typicalDevDays,
        complexity: catalogMatch.typicalDevDays > 15 ? 'media' : 'baixa'
      },
      {
        id: `opp-${catalogMatch.cnae.replace(/[^a-z0-9]/gi, '_')}-2`,
        title: `Automação de WhatsApp e Follow-up Comercial Recorrente`,
        operationalProblem: `Perda de orçamentos e clientes no segmento de ${catalogMatch.nicheQuery} por demora no retorno e ausência de régua de pós-venda.`,
        evidence: `Mais de 65% das empresas do setor não realizam follow-up ativo de propostas pendentes por falta de equipe dedicada.`,
        digitalSolution: `Esteira integrada com WhatsApp Cloud API que notifica automaticamente o tomador de decisão, solicita aprovações e agenda retornos.`,
        expectedBenefit: `Aumento médio de 22% a 35% na conversão de orçamentos e fidelização de clientes recorrentes.`,
        willingnessToPayHypothesis: 'alta',
        typicalDevelopmentDays: 10,
        complexity: 'baixa'
      },
      {
        id: `opp-${catalogMatch.cnae.replace(/[^a-z0-9]/gi, '_')}-3`,
        title: `Portal do Cliente & Autoatendimento 24/7`,
        operationalProblem: `Equipe de atendimento sobrecarregada com solicitações repetitivas de segunda via, status de pedidos, contratos ou histórico de serviços.`,
        evidence: `Atendentes gastam até metade do expediente respondendo perguntas que poderiam ser consultadas de forma autônoma pelo próprio cliente.`,
        digitalSolution: `Painel web responsivo (PWA) onde o cliente consulta status em tempo real, baixa documentos e aprova etapas sem precisar ligar ou esperar no WhatsApp.`,
        expectedBenefit: `Redução de até 70% nas mensagens de suporte receptivo e aumento substancial na satisfação do cliente final.`,
        willingnessToPayHypothesis: 'alta',
        typicalDevelopmentDays: 12,
        complexity: 'baixa'
      }
    ];
  }

  // 1. Oficinas Mecânicas, Frotas e Centros Automotivos
  if (normalized.includes('oficin') || normalized.includes('mecân') || normalized.includes('auto') || normalized.includes('frota')) {
    return [
      {
        id: 'opp-oficina-1',
        title: 'Checklist Digital de Entrada & Ordem de Serviço Mobile',
        operationalProblem: 'Contestação de avarias pré-existentes por clientes e demora de até 4 horas para o cliente aprovar orçamentos de peças pelo telefone.',
        evidence: 'Pesquisa com centros automotivos apontou que 18% do tempo dos elevadores fica ocioso aguardando aprovação de orçamentos parados no WhatsApp.',
        digitalSolution: 'Web app para o mecânico registrar fotos do veículo na entrada e enviar orçamento com fotos das peças desgastadas com botão de aprovação rápida no WhatsApp.',
        expectedBenefit: 'Redução do tempo de aprovação de orçamento de 4 horas para 15 minutos e blindagem contra reclamações de avarias.',
        willingnessToPayHypothesis: 'muito_alta',
        typicalDevelopmentDays: 14,
        complexity: 'baixa'
      },
      {
        id: 'opp-oficina-2',
        title: 'Portal do Frotista & Histórico de Manutenções',
        operationalProblem: 'Empresas com frotas de vans e caminhões cobrando relatórios manuais de manutenções em Excel e notas fiscais avulsas perdidas.',
        evidence: 'Frotistas ameaçando trocar de oficina pela falta de transparência e demora no envio de relatórios de custo por veículo.',
        digitalSolution: 'Painel web corporativo onde a empresa frotista consulta em tempo real o status de cada veículo, peças substituídas e previsão de saída.',
        expectedBenefit: 'Fidelização de contratos corporativos de frotas e aumento de 25% no volume de veículos atendidos recorrentemente.',
        willingnessToPayHypothesis: 'alta',
        typicalDevelopmentDays: 16,
        complexity: 'media'
      },
      {
        id: 'opp-oficina-3',
        title: 'Robô de Manutenção Preventiva via WhatsApp',
        operationalProblem: 'Clientes que trocam óleo ou pastilhas nunca mais voltam porque a oficina não tem tempo de fazer pós-venda nem avisar da quilometragem vencida.',
        evidence: 'Oficinas perdem até 40% da receita recorrente de manutenção preventiva por ausência total de follow-up automatizado com o motorista.',
        digitalSolution: 'Sistema que calcula a média diária de km rodado e dispara lembrete automático no WhatsApp 15 dias antes da próxima revisão ou troca de óleo.',
        expectedBenefit: 'Aumento imediato de 30% no retorno de clientes para manutenções preventivas sem esforço da recepção.',
        willingnessToPayHypothesis: 'alta',
        typicalDevelopmentDays: 10,
        complexity: 'baixa'
      }
    ];
  }

  // 2. Sociedades de Advocacia e Serviços Jurídicos
  if (normalized.includes('advoc') || normalized.includes('juríd') || normalized.includes('direito') || normalized.includes('oab')) {
    return [
      {
        id: 'opp-adv-1',
        title: 'Esteira de Pós-Venda Jurídico & Status Automático de Processos',
        operationalProblem: 'Clientes ligando e mandando mensagens diárias no WhatsApp dos advogados perguntando "como está meu processo?", consumindo horas produtivas dos sócios.',
        evidence: 'Advogados relatam gastar mais de 10 horas semanais apenas atualizando clientes por telefone com respostas repetitivas.',
        digitalSolution: 'Portal seguro onde o cliente acompanha a linha do tempo simplificada do caso e recebe aviso no WhatsApp a cada movimentação relevante traduzida para linguagem leiga.',
        expectedBenefit: 'Redução de 80% das interrupções por telefone e aumento da percepção de valor do escritório.',
        willingnessToPayHypothesis: 'muito_alta',
        typicalDevelopmentDays: 14,
        complexity: 'baixa'
      },
      {
        id: 'opp-adv-2',
        title: 'Esteira de Onboarding de Clientes & Assinatura Digital de Procurações',
        operationalProblem: 'Perda de contratos novos pela demora em coletar documentos, comprovantes e assinaturas em papel ou PDFs manuais.',
        evidence: 'Taxa de desistência de 15% entre o fechamento verbal e a entrega física dos documentos assinados.',
        digitalSolution: 'Fluxo web em link único onde o cliente anexa fotos dos documentos pelo celular e assina a procuração eletronicamente em 2 minutos.',
        expectedBenefit: 'Fechamento imediato de novos clientes no mesmo dia do primeiro contato.',
        willingnessToPayHypothesis: 'alta',
        typicalDevelopmentDays: 12,
        complexity: 'baixa'
      }
    ];
  }

  // 3. Construção Civil, Engenharia e Obras
  if (normalized.includes('constr') || normalized.includes('obras') || normalized.includes('engenh') || normalized.includes('reform')) {
    return [
      {
        id: 'opp-const-1',
        title: 'App de Canteiro & Diário de Obras Digital',
        operationalProblem: 'Falta de registro tempestivo do avanço diário da obra e fotos dispersas em conversas de WhatsApp sem organização.',
        evidence: 'Queixas de engenheiros sobre falta de provas em auditorias e retrabalhos em medições de empreiteiros.',
        digitalSolution: 'PWA/Web app responsivo com upload offline de fotos com marcação de data/hora, geolocalização e geração de diário em PDF com 1 clique.',
        expectedBenefit: 'Eliminação de 6 horas semanais do engenheiro e mitigação de litígios de medição.',
        willingnessToPayHypothesis: 'alta',
        typicalDevelopmentDays: 16,
        complexity: 'media'
      },
      {
        id: 'opp-const-2',
        title: 'Gestor de Requisições & Compras Rápidas de Insumos',
        operationalProblem: 'Paradas no canteiro por falta de materiais básicos (cimento, ferragens) causadas por pedidos informais em cima da hora.',
        evidence: 'Relatos de construtoras com 15% de sobrecusto em fretes de urgência e compras fracionadas.',
        digitalSolution: 'Sistema simplificado de cotação com 3 fornecedores parceiros e aprovação do diretor financeiro no celular.',
        expectedBenefit: 'Economia direta de 8% a 12% no custo de aquisição de insumos de obra.',
        willingnessToPayHypothesis: 'muito_alta',
        typicalDevelopmentDays: 20,
        complexity: 'media'
      }
    ];
  }

  // 4. Distribuição e Atacado
  if (normalized.includes('distrib') || normalized.includes('aliment') || normalized.includes('atacad') || normalized.includes('bebida')) {
    return [
      {
        id: 'opp-dist-1',
        title: 'Portal B2B de Pedidos & Força de Vendas Mobile',
        operationalProblem: 'Vendedores anotando pedidos em blocos de papel ou áudios de WhatsApp, gerando erros de digitação e entregas erradas.',
        evidence: 'Taxa média de devolução de 4.2% das cargas por divergência entre o pedido solicitado e o faturado.',
        digitalSolution: 'Catálogo digital interativo com tabela de preço específica por CNPJ, estoque em tempo real e fechamento com assinatura na tela.',
        expectedBenefit: 'Redução de devoluções a menos de 0.5% e aumento de 18% no ticket médio dos representantes.',
        willingnessToPayHypothesis: 'muito_alta',
        typicalDevelopmentDays: 22,
        complexity: 'media'
      },
      {
        id: 'opp-dist-2',
        title: 'Automação de Roteirização & Comprovante Digital de Entrega',
        operationalProblem: 'Motoristas perdendo canhotos de notas fiscais físicas e atrasos na rota de entrega.',
        evidence: 'Cobrança indevida de clientes alegando não ter recebido a mercadoria em virtude de canhotos ilegíveis.',
        digitalSolution: 'Web app para o motorista coletar foto da mercadoria descarregada e assinatura do recebedor com envio automático ao financeiro.',
        expectedBenefit: 'Agilização do faturamento e redução de disputas de entrega.',
        willingnessToPayHypothesis: 'alta',
        typicalDevelopmentDays: 14,
        complexity: 'baixa'
      }
    ];
  }

  // 5. Clínicas, Saúde e Odontologia (Apenas quando for explicitamente saúde/odontologia)
  if (normalized.includes('odonto') || normalized.includes('dente') || normalized.includes('clínica') || normalized.includes('saúde') || normalized.includes('médic')) {
    return [
      {
        id: 'opp-odonto-1',
        title: 'Agendador Inteligente com Confirmação e Pagamento via Pix',
        operationalProblem: 'Taxa de faltas (no-show) de 22% a 30% em horários nobres e recepcionistas sobrecarregadas respondendo WhatsApp manualmente.',
        evidence: 'Pesquisa com clínicas apontou que cada paciente faltante custa em média R$ 180 em faturamento perdido não recuperável.',
        digitalSolution: 'Robô web integrado à agenda oficial que envia lembrete interativo 24h antes e possibilita pagamento de sinal antecipado.',
        expectedBenefit: 'Queda do no-show para menos de 6% e liberação de 3 horas diárias da recepção para atendimento presencial.',
        willingnessToPayHypothesis: 'muito_alta',
        typicalDevelopmentDays: 12,
        complexity: 'baixa'
      },
      {
        id: 'opp-odonto-2',
        title: 'Portal do Paciente & Histórico de Procedimentos',
        operationalProblem: 'Pacientes solicitando histórico de exames e atestados pelo WhatsApp da clínica, exigindo busca manual em pastas locais.',
        evidence: 'Gargalo administrativo na emissão de declarações para convênios e imposto de renda.',
        digitalSolution: 'Área segura com link individual onde o paciente acessa seus laudos, receitas e recibos protegidos por código SMS/WhatsApp.',
        expectedBenefit: 'Eliminação completa de solicitações manuais repetitivas e conformidade com a LGPD.',
        willingnessToPayHypothesis: 'alta',
        typicalDevelopmentDays: 15,
        complexity: 'media'
      }
    ];
  }

  // 6. Serviços Corporativos Gerais & Consultoria
  return [
    {
      id: 'opp-gen-1',
      title: 'Sistema de Gestão de Ordens de Serviço & Atendimentos B2B',
      operationalProblem: 'Desorganização no controle de chamados e solicitações de clientes feitas informalmente por e-mail e mensagens avulsas.',
      evidence: 'Relatos de atraso na entrega de serviços e clientes insatisfeitos com falta de previsão de conclusão.',
      digitalSolution: 'Painel web com abertura de chamados, prazos com contagem regressiva e disparo de notificações automáticas de status.',
      expectedBenefit: 'Eliminação de atrasos e visibilidade total da produtividade da equipe.',
      willingnessToPayHypothesis: 'alta',
      typicalDevelopmentDays: 14,
      complexity: 'baixa'
    },
    {
      id: 'opp-gen-2',
      title: 'Esteira de Cobrança e Gestão de Contratos Recorrentes',
      operationalProblem: 'Inadimplência acumulada e esquecimento de reajustes anuais de contratos por controle feito em planilhas manuais.',
      evidence: 'Média de 8% de perda de receita anual decorrente de atrasos na régua de cobrança manual.',
      digitalSolution: 'Automação financeira que emite Pix/boleto automático e avisa o cliente no WhatsApp 3 dias antes do vencimento.',
      expectedBenefit: 'Redução da inadimplência para menos de 2% sem desgaste da equipe de atendimento.',
      willingnessToPayHypothesis: 'muito_alta',
      typicalDevelopmentDays: 12,
      complexity: 'baixa'
    }
  ];
}
