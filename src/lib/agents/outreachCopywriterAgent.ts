import { 
  NicheBasicInfo, 
  SoftwareOpportunity, 
  CommercialViability, 
  OutreachCopyBriefing 
} from '@/types/market';

export function runOutreachCopywriterAgent(params: {
  basicInfo: NicheBasicInfo;
  opportunities: SoftwareOpportunity[];
  viability: CommercialViability;
}): OutreachCopyBriefing {
  const { basicInfo, opportunities, viability } = params;
  const topOpp = opportunities[0] || {
    title: 'Automação de Processos',
    operationalProblem: 'Controles manuais e planilhas',
    expectedBenefit: 'Economia de tempo e eliminação de erros'
  };

  const nicheName = basicInfo.name;

  return {
    targetPersona: {
      role: 'Sócio-Proprietário, Diretor Geral ou Gestor de Operações',
      dailyFrustrations: [
        `Gastar horas do dia apagando incêndios operacionais gerados por ${topOpp.operationalProblem.toLowerCase()}.`,
        'Depender de funcionários para lembrar de prazos, cobranças ou confirmações manuais.',
        'Sensação de que a empresa fatura, mas o lucro é corroído por ineficiência e retrabalho invisível.'
      ],
      buyingTriggers: [
        'Promessa clara de economia de tempo imediata sem curva longa de aprendizado.',
        'Solução que roda no celular e no WhatsApp sem exigir computadores caros ou servidores locais.',
        'Demonstração visual do sistema resolvendo o problema real em menos de 5 minutos.'
      ]
    },
    whatsAppCadence: [
      {
        step: 'Passo 1 — Primeiro Contato (Quebra de Padrão)',
        timing: 'Dia 1 (Horário Comercial)',
        messageText: `Olá, tudo bem? Acompanho o trabalho da sua empresa no setor de ${nicheName}. Desenvolvemos recentemente uma automação web específica para empresas do seu segmento eliminarem ${topOpp.operationalProblem.toLowerCase()}, gerando ${topOpp.expectedBenefit.toLowerCase()}. Teria 3 minutos para ver um vídeo rápido mostrando como funciona na prática?`,
        purpose: 'Despertar curiosidade imediata focando na dor, sem empurrar reunião logo de início.'
      },
      {
        step: 'Passo 2 — Follow-up com Prova Prática',
        timing: 'Dia 3 (48h após sem resposta)',
        messageText: `Olá! Sei que sua rotina é corrida cuidando da operação. Só passando para compartilhar que uma empresa similar no setor conseguiu reduzir o tempo gasto com isso em mais de 70% já no primeiro mês com essa solução. Se fizer sentido para você, posso te mandar o link da demonstração sem compromisso.`,
        purpose: 'Trazer referência de mercado e reduzir a fricção de contato.'
      },
      {
        step: 'Passo 3 — Abordagem Direta com Vídeo/Link',
        timing: 'Dia 5 (4 dias após o primeiro contato)',
        messageText: `Passando rapidinho: gravei um vídeo de 90 segundos mostrando a tela da ferramenta resolvendo exatamente o gargalo de ${topOpp.operationalProblem.toLowerCase()}. Gostaria de dar uma olhada para ver se aplica à sua equipe?`,
        purpose: 'Oferecer valor tangível e visual com baixíssimo esforço para o tomador de decisão.'
      },
      {
        step: 'Passo 4 — Breakup Message (Saída Elegante)',
        timing: 'Dia 8 (7 dias após o primeiro contato)',
        messageText: `Imagino que este não seja o momento prioritário para modernizar esse processo por aí, então não vou insistir para não incomodar sua rotina. Caso no futuro queira ver como automatizar essa parte, meu contato continua por aqui. Sucesso nos negócios!`,
        purpose: 'Gatilho de escassez e desapego; é a mensagem com maior taxa de resposta surpresa em prospecção B2B.'
      }
    ],
    coldCallScript: {
      gatekeeperPitch: `Oi, bom dia! Por favor, quem cuida da parte de gestão e tecnologia da empresa é o [Nome do Sócio/Diretor]? É sobre uma solução para o gargalo de ${topOpp.operationalProblem.toLowerCase()} que estamos apresentando para os diretores do setor. Poderia me transferir para ele rapidinho?`,
      decisionMakerPitch: `Olá, [Nome], tudo bem? Sei que seu tempo é escasso, serei super direto. Nós desenvolvemos uma solução digital focada exclusivamente em ${nicheName} para resolver ${topOpp.operationalProblem.toLowerCase()}. Meu objetivo não é te vender nada agora, apenas te mostrar como funciona em 10 minutos. Quinta-feira às 14h ou sexta às 10h fica melhor para você?`
    },
    spinQuestions: {
      situation: `Como vocês controlam hoje a rotina de ${topOpp.operationalProblem.toLowerCase()}? Utilizam planilhas, papel ou algum software genérico?`,
      problem: `Quais são as principais dores de cabeça ou atrasos que essa forma manual atual costuma gerar no dia a dia da equipe?`,
      implication: `Quanto tempo ou dinheiro você calcula que a empresa perde por mês tendo que refazer coisas ou cobrando clientes manualmente?`,
      needPayoff: `Se você tivesse um painel simples no celular onde toda essa rotina acontecesse de forma automática, o quanto isso aliviaria o seu dia a dia?`
    },
    objectionsAndRebuttals: [
      {
        objection: 'Já usamos um sistema de mercado / ERP.',
        rebuttal: 'Excelente! A nossa solução não substitui o seu ERP atual; ela foi feita justamente para cobrir a lacuna que os sistemas tradicionais deixam de lado, que é a parte de automação rápida e contato com o cliente no WhatsApp.'
      },
      {
        objection: 'Não temos tempo para implantar nada novo agora.',
        rebuttal: 'Compreendo perfeitamente, por isso a nossa implantação leva menos de 48 horas e nós mesmos configuramos tudo para a sua equipe, sem que você precise parar a operação.'
      },
      {
        objection: 'Acho que isso deve ser muito caro.',
        rebuttal: 'O valor da solução é desenhado para se pagar já no primeiro mês só com o tempo poupado dos funcionários. Além disso, não cobramos mensalidades abusivas por usuário adicional.'
      }
    ]
  };
}

