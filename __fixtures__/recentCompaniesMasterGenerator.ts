import { RecentCompanyLead, CompanySector } from '@/types/recentCompanies';

// Gerador Pseudo-Aleatório Determinístico (Mulberry32) para reprodutibilidade estável
function createPrng(seed: number) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Cálculo oficial de dígitos verificadores de CNPJ (Módulo 11)
function calculateCnpjDv(base12Digits: string): string {
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let s1 = 0;
  for (let i = 0; i < 12; i++) {
    s1 += parseInt(base12Digits[i], 10) * w1[i];
  }
  const r1 = s1 % 11;
  const dv1 = r1 < 2 ? 0 : 11 - r1;

  const base13 = base12Digits + dv1;
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let s2 = 0;
  for (let i = 0; i < 13; i++) {
    s2 += parseInt(base13[i], 10) * w2[i];
  }
  const r2 = s2 % 11;
  const dv2 = r2 < 2 ? 0 : 11 - r2;

  return `${dv1}${dv2}`;
}

function formatCnpj(digits14: string): string {
  return `${digits14.substring(0, 2)}.${digits14.substring(2, 5)}.${digits14.substring(5, 8)}/${digits14.substring(8, 12)}-${digits14.substring(12, 14)}`;
}

function determineFaixa(dias: number): RecentCompanyLead['faixaTempo'] {
  if (dias <= 7) return '7_dias';
  if (dias <= 15) return '15_dias';
  if (dias <= 30) return '30_dias';
  if (dias <= 60) return '60_dias';
  if (dias <= 90) return '90_dias';
  if (dias <= 180) return '180_dias';
  return '365_dias';
}

function determineEstagio(dias: number): {
  estagio: RecentCompanyLead['diagnosticoTecnologico']['estagioOperacional'];
  descricao: string;
} {
  if (dias <= 15) {
    return {
      estagio: 'abertura_montagem',
      descricao: 'Fase de abertura de CNPJ e montagem de balcão. Sócio definindo rotinas e sem nenhum software instalado.',
    };
  }
  if (dias <= 45) {
    return {
      estagio: 'primeiro_mes_caos',
      descricao: 'Primeiro mês operacional. Volume de inauguração, sobrecarga em WhatsApp e controle em cadernos ou planilhas.',
    };
  }
  if (dias <= 90) {
    return {
      estagio: 'ajuste_caixa',
      descricao: 'Primeiro trimestre de operação. Momento crítico de fechamento de caixa, emissão de notas e fidelização de clientes.',
    };
  }
  return {
    estagio: 'expansao_recente',
    descricao: 'Operação consolidando primeiras rotinas com necessidade urgente de eliminar retrabalho operacional.',
  };
}

// ==========================================
// BANCOS DE DADOS DE DIVERSIDADE PARA O DF
// ==========================================

const REGIOES_DF = [
  { regiao: 'Águas Claras', cepBase: '71900', logradouros: ['Avenida Castanheiras', 'Avenida Araucárias', 'Rua das Pitangueiras', 'Rua 36 Sul', 'Rua das Figueiras', 'Rua Manacá', 'Quadra 104', 'Quadra 206'] },
  { regiao: 'Asa Sul', cepBase: '70200', logradouros: ['CLS 108 Bloco B', 'CLS 211 Bloco D', 'CLS 405 Bloco C', 'CLS 312 Bloco A', 'W3 Sul Quadra 512', 'SBS Quadra 02', 'SGAS 915 Centro Clínico'] },
  { regiao: 'Asa Norte', cepBase: '70700', logradouros: ['CLN 114 Bloco C', 'CLN 408 Bloco A', 'SCRN 704/705 Bloco D', 'SHCN 106 Bloco A', 'W3 Norte Quadra 710', 'SMHN Quadra 02'] },
  { regiao: 'Sudoeste', cepBase: '70670', logradouros: ['CLSW 102 Bloco B', 'CLSW 304 Bloco B', 'CCSW 05 Bloco A', 'CLSW 300B Bloco 01', 'Edifício Terraço Shopping Sala'] },
  { regiao: 'Noroeste', cepBase: '70798', logradouros: ['CLNW 10/11 Bloco B', 'CLNW 08/09 Bloco C', 'CRNW 510 Bloco A', 'CLNW 02/03 Bloco E'] },
  { regiao: 'Taguatinga Norte', cepBase: '72110', logradouros: ['QNA 12 Lote 05', 'QNB 08 Lote 14', 'QND 47 Lote 10', 'QND 28 Lote 12', 'Praça do Relógio Lote'] },
  { regiao: 'Taguatinga Sul', cepBase: '72015', logradouros: ['CSB 08 Lote 02', 'QSB 04 Lote 12', 'QSE 12 Lote 04', 'C 01 Lote 14 Centro', 'Avenida Comercial Sul Lote'] },
  { regiao: 'Ceilândia Centro', cepBase: '72220', logradouros: ['CNN 02 Bloco B', 'CNM 01 Bloco F', 'Avenida Hélio Prates Lote', 'QNM 13 Conjunto B'] },
  { regiao: 'Ceilândia Norte', cepBase: '72225', logradouros: ['QNN 18 Conjunto C', 'QNM 17 Conjunto H', 'QNM 19 Conjunto D', 'QNN 24 Conjunto F'] },
  { regiao: 'Ceilândia Sul', cepBase: '72215', logradouros: ['QNM 11 Conjunto A', 'QNM 03 Conjunto C', 'QSE 06 Lote 10'] },
  { regiao: 'Samambaia Norte', cepBase: '72320', logradouros: ['QN 412 Conjunto 02', 'QN 204 Conjunto 08', 'QN 408 Conjunto 03'] },
  { regiao: 'Samambaia Sul', cepBase: '72304', logradouros: ['QN 308 Conjunto 04', 'QS 118 Conjunto 01', 'QS 302 Conjunto 05'] },
  { regiao: 'Guará I', cepBase: '71020', logradouros: ['QI 11 Bloco B', 'QE 02 Bloco C', 'QI 08 Bloco A', 'Polo de Modas Rua'] },
  { regiao: 'Guará II', cepBase: '71065', logradouros: ['QE 32 Bloco A', 'QE 15 Bloco C', 'QE 40 Rua 12', 'QE 28 Bloco D'] },
  { regiao: 'Vicente Pires', cepBase: '72005', logradouros: ['Rua 08 Chácara 150', 'Rua 04 Chácara 22', 'Rua 05 Chácara 102', 'Rua 12 Chácara 88', 'Rua 03 Chácara 45'] },
  { regiao: 'Gama', cepBase: '72410', logradouros: ['Setor Sul Quadra 15', 'Setor Leste Lote 45', 'Setor Central Quadra 02', 'Setor de Indústrias Quadra'] },
  { regiao: 'Sobradinho', cepBase: '73005', logradouros: ['Quadra 08 Comércio Local', 'Quadra 14 Lote 02', 'Grande Colorado Condomínio'] },
  { regiao: 'Planaltina', cepBase: '73310', logradouros: ['Setor Tradicional Quadra 12', 'Vila Buritis Rua 05', 'Jardim Roriz Quadra 03'] },
  { regiao: 'Santa Maria', cepBase: '72500', logradouros: ['Avenida Alagados Quadra 208', 'Quadra 312 Conjunto B', 'Santa Maria Shopping Sala'] },
  { regiao: 'Recanto das Emas', cepBase: '72600', logradouros: ['Avenida Recanto Quadra 102', 'Quadra 205 Conjunto 04', 'Quadra 300 Lote'] },
  { regiao: 'Riacho Fundo I', cepBase: '71810', logradouros: ['QN 07 Conjunto 03', 'QS 04 Conjunto 02', 'Avenida Principal Lote'] },
  { regiao: 'Riacho Fundo II', cepBase: '71880', logradouros: ['QN 08 Conjunto 06', 'QC 02 Lote 10'] },
  { regiao: 'Lago Sul', cepBase: '71600', logradouros: ['SHIS QI 05 Bloco C', 'SHIS QL 10 Conjunto 02', 'Centro Comercial Gilberto Salomão'] },
  { regiao: 'Lago Norte', cepBase: '71500', logradouros: ['SHIN CA 05 Lote 02', 'Shopping Deck Norte Loja', 'SHIN QI 09 Bloco A'] },
  { regiao: 'Jardim Botânico', cepBase: '71680', logradouros: ['Avenida do Sol Lote 12', 'Jardins Mangueiral Quadra 04', 'Polo de Artesanato Loja'] },
  { regiao: 'Núcleo Bandeirante', cepBase: '71700', logradouros: ['Avenida Central Bloco 420', '3ª Avenida Bloco 110'] },
  { regiao: 'Candangolândia', cepBase: '71725', logradouros: ['Rua dos Transportes Quadra 03', 'Avenida Marginal Lote 18'] },
  { regiao: 'Cruzeiro', cepBase: '70640', logradouros: ['SHCES Quadra 805 Bloco B', 'SRES Quadra 04 Bloco A'] },
  { regiao: 'Brazlândia', cepBase: '72700', logradouros: ['Setor Tradicional Quadra 04', 'Vila São José Quadra 18'] },
];

const NOMES_PROPRIOS = [
  'Lucas', 'Gabriel', 'Matheus', 'Felipe', 'Leonardo', 'Thiago', 'Rodrigo', 'Bruno', 'Rafael', 'Guilherme',
  'Eduardo', 'Gustavo', 'Daniel', 'André', 'Diego', 'Marcelo', 'Vitor', 'Paulo', 'Fernando', 'Carlos',
  'Renato', 'Marcos', 'Alexandre', 'Samuel', 'Vinícius', 'Caio', 'Danilo', 'Fábio', 'Geovane', 'Edivaldo',
  'Juliana', 'Camila', 'Larissa', 'Amanda', 'Beatriz', 'Mariana', 'Fernanda', 'Gabriela', 'Renata', 'Letícia',
  'Tatiane', 'Aline', 'Bruna', 'Jéssica', 'Vanessa', 'Natália', 'Carolina', 'Paula', 'Daniela', 'Priscila',
  'Patrícia', 'Luana', 'Sabrina', 'Bianca', 'Monique', 'Lorena', 'Flávia', 'Carla', 'Helena', 'Socorro'
];

const SOBRENOMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes',
  'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa',
  'Rocha', 'Dias', 'Nascimento', 'Andrade', 'Moreira', 'Nunes', 'Marques', 'Machado', 'Mendes', 'Freitas',
  'Cardoso', 'Ramos', 'Gonçalves', 'Santana', 'Teixeira', 'Castro', 'Moura', 'Cavalcanti', 'Guimarães', 'Furtado',
  'Arantes', 'Bezerra', 'Castelo', 'Dantas', 'Esteves', 'Fontes', 'Meireles', 'Nogueira', 'Prado', 'Queiroz'
];

interface SegmentoConfig {
  setor: CompanySector;
  rotulo: string;
  prefixos: string[];
  sufixos: string[];
  cnae: string;
  cnaeDesc: string;
  cnaesSec?: string[];
  dores: string[];
  solucoes: string[];
  setupMin: number;
  setupMax: number;
  mensalMin: number;
  mensalMax: number;
  capitalMin: number;
  capitalMax: number;
}

const SEGMENTOS: SegmentoConfig[] = [
  // 1. ALIMENTAÇÃO - RESTAURANTES
  {
    setor: 'alimentacao',
    rotulo: 'Alimentação & Gastronomia',
    prefixos: ['Restaurante', 'Bistrô', 'Cantina', 'Sabor de', 'Casa da', 'Empório', 'Varanda', 'Villa', 'Fogão de'],
    sufixos: ['Minas', 'Brasília', 'Família', 'Tradição', 'Gourmet', 'Artesanal', 'Central', 'do Cerrado', 'Real'],
    cnae: '5611-2/01',
    cnaeDesc: 'Restaurantes e similares',
    cnaesSec: ['5620-1/04', '5611-2/03'],
    dores: [
      'Gargalo no fechamento de conta em mesas no jantar; clientes aguardam mais de 15 minutos pela maquininha.',
      'Controle de comandas manuais em papel gerando erros entre garçom e cozinha em horários de pico.',
      'Ausência de controle de custos de insumos (CMV) e divergência de caixa no final da noite.',
    ],
    solucoes: [
      'PDV Web com comanda mobile no celular do garçom e fechamento de conta imediato.',
      'KDS (tela de cozinha) integrado ao cardápio com alerta sonoro para pedidos prontos.',
      'Controle automatizado de ficha técnica e conciliação de maquininhas de cartão.',
    ],
    setupMin: 2200, setupMax: 3200, mensalMin: 280, mensalMax: 360, capitalMin: 50000, capitalMax: 120000,
  },
  // 2. ALIMENTAÇÃO - HAMBURGUERIAS & LANCHONETES
  {
    setor: 'alimentacao',
    rotulo: 'Alimentação & Gastronomia',
    prefixos: ['Smash Burger', 'Burger House', 'Point do Lanche', 'Pastelaria', 'Tapiocaria', 'Açaí Express', 'Tô com Fome', 'Snack Bar'],
    sufixos: ['Prime', 'Gourmet', 'Burger', 'Fast Food', 'Original', 'da Esquina', 'Show', 'Mix', 'Top'],
    cnae: '5611-2/03',
    cnaeDesc: 'Lanchonetes, casas de chá, de sucos e similares',
    cnaesSec: ['5620-1/04'],
    dores: [
      'Delivery por WhatsApp desorganizado com atendente demorando 10 minutos para tirar cada pedido no teclado.',
      'Fila de espera para pedidos de balcão sem senha gerando confusão de entrega.',
      'Desperdício de carnes e pães por falta de controle de estoque mínimo e validade.',
    ],
    solucoes: [
      'Robô de atendimento WhatsApp com cardápio digital próprio sem comissão de marketplace.',
      'Painel de senhas integrado à impressora térmica da chapa.',
      'Frente de caixa rápida com baixa automática de estoque de insumos.',
    ],
    setupMin: 1800, setupMax: 2600, mensalMin: 240, mensalMax: 310, capitalMin: 35000, capitalMax: 85000,
  },
  // 3. ALIMENTAÇÃO - PIZZARIAS
  {
    setor: 'alimentacao',
    rotulo: 'Alimentação & Gastronomia',
    prefixos: ['Pizzaria', 'Forno & Lenha', 'Dona Massa', 'Bella Pizza', 'Napoletana', 'Pizza Express'],
    sufixos: ['Tradicional', 'Artesanal', 'Gourmet', 'Delivery', 'di Roma', 'Original', 'do Chefe'],
    cnae: '5611-2/01',
    cnaeDesc: 'Restaurantes e similares (Pizzarias)',
    cnaesSec: ['5620-1/04'],
    dores: [
      'Confusão no despacho de pedidos para motoboys e rotas mal planejadas com atrasos nos sábados.',
      'Dificuldade em cobrar adicionais de bordas e sabores meio-a-meio no balcão sem sistema.',
      'Perda de controle de comandas de clientes que consomem no salão antes de pedir para viagem.',
    ],
    solucoes: [
      'Módulo de despacho de motoboy com taxa automática por KM e impressão da via da caixa da pizza.',
      'PDV com montagem visual de pizzas fracionadas (2 a 4 sabores) e adicionais automáticos.',
      'Comanda integrada salão + balcão em banco de dados em nuvem.',
    ],
    setupMin: 2100, setupMax: 2900, mensalMin: 270, mensalMax: 340, capitalMin: 45000, capitalMax: 90000,
  },
  // 4. ALIMENTAÇÃO - CAFÉS & PADARIAS
  {
    setor: 'alimentacao',
    rotulo: 'Alimentação & Gastronomia',
    prefixos: ['Café', 'Padaria & Confeitaria', 'Grão Nobre', 'Doce Sabor', 'Artisan Pães', 'Boutique do Café', 'Cantinho do Bolo'],
    sufixos: ['Gourmet', 'Bistrô', 'Express', 'Specialty', 'Artesanal', 'da Vila', 'da Praça', 'Brasil'],
    cnae: '4721-1/02',
    cnaeDesc: 'Padaria e confeitaria com predominância de revenda',
    cnaesSec: ['1091-1/02', '5611-2/03'],
    dores: [
      'Encomendas de bolos e tortas anotadas em papel carbono com risco de esquecimento de data.',
      'Balança de pesagem por quilo não integrada ao caixa gerando digitação manual lenta.',
      'Ruptura de pães especiais nas manhãs de sábado por ausência de previsão de fornadas.',
    ],
    solucoes: [
      'Agenda de encomendas com alerta automático e envio de lembrete de retirada ao cliente.',
      'PDV homologado com leitura direta da balança via cabo serial e emissão de NFC-e em 3 segundos.',
      'Controle de fornadas e custo de farinhas e laticínios.',
    ],
    setupMin: 2000, setupMax: 2800, mensalMin: 250, mensalMax: 320, capitalMin: 40000, capitalMax: 110000,
  },
  // 5. AUTOMOTIVO - OFICINAS & AUTO CENTERS
  {
    setor: 'automotivo',
    rotulo: 'Serviços Automotivos',
    prefixos: ['Auto Center', 'Oficina Mecânica', 'Precision Auto', 'Centro Automotivo', 'Master Car', 'Mecânica do Freio', 'Pit Stop'],
    sufixos: ['DF', 'Motors', 'Express', 'Performance', 'Automotivo', 'Especializada', 'Nacional & Importados', 'Premium'],
    cnae: '4520-0/01',
    cnaeDesc: 'Serviços de manutenção e reparação mecânica de veículos automotores',
    cnaesSec: ['4520-0/03', '4520-0/06'],
    dores: [
      'Ordens de serviço em blocos físicos de papel sem fotos das avarias prévias do carro.',
      'Peças instaladas pelos mecânicos sem dar baixa no sistema, gerando furos no estoque.',
      'Clientes não voltam para revisão de 10.000 km por falta de pós-venda automatizado.',
    ],
    solucoes: [
      'Checklist digital de entrada com fotos do carro e orçamento enviado direto para aprovação no WhatsApp.',
      'Controle de almoxarifado atrelado à mão de obra e comissão dos mecânicos.',
      'Lembrete automático de troca de óleo e revisão periódica via WhatsApp.',
    ],
    setupMin: 2400, setupMax: 3400, mensalMin: 290, mensalMax: 380, capitalMin: 60000, capitalMax: 150000,
  },
  // 6. AUTOMOTIVO - ESTÉTICA & LAVA JATO
  {
    setor: 'automotivo',
    rotulo: 'Serviços Automotivos',
    prefixos: ['Estética Automotiva', 'Lava Jato', 'Car Detail', 'Shine Car', 'Vip Wash', 'Polimento & Cristalização'],
    sufixos: ['Premium', 'Club', 'Detailing', 'Wash', 'Gold', 'Exclusive', 'Express'],
    cnae: '4520-0/05',
    cnaeDesc: 'Serviços de lavagem, lubrificação e polimento de veículos automotores',
    cnaesSec: ['4520-0/01'],
    dores: [
      'Controle de fila de lavagem manual; clientes ligando a cada 15 minutos perguntando se o carro está pronto.',
      'Falta de registro de produtos caros (vitrificadores cerâmicos e ceras importadas).',
      'Comissões dos lavadores calculadas no papel no fim do sábado com divergências.',
    ],
    solucoes: [
      'Comprovante digital com link em tempo real mostrando "Carro em Lavagem" ou "Pronto para Retirar".',
      'Controle de fracionamento de produtos químicos por tipo de serviço prestado.',
      'Cálculo de comissão por carro limpo com relatório fechado em 1 clique.',
    ],
    setupMin: 1700, setupMax: 2400, mensalMin: 220, mensalMax: 280, capitalMin: 35000, capitalMax: 70000,
  },
  // 7. SAÚDE & ESTÉTICA - ODONTOLOGIA & CLÍNICAS
  {
    setor: 'saude_estetica',
    rotulo: 'Saúde & Estética',
    prefixos: ['Clínica Odontológica', 'Odonto Prime', 'Sorriso Real', 'Oral Excellence', 'Studio Odonto', 'Clínica Integrada', 'Vitalis Saúde'],
    sufixos: ['Odontologia', 'Saúde', 'Implantes', 'Ortodontia', 'Estética Orofacial', 'Prime', 'Clínica'],
    cnae: '8630-5/04',
    cnaeDesc: 'Atividade odontológica',
    cnaesSec: ['8650-0/04'],
    dores: [
      'Pacientes faltam ou desmarcam em cima da hora porque a confirmação de presença é manual.',
      'Prontuários e fichas clínicas em pastas suspensas com perda de radiografias antigas.',
      'Controle de repasse de honorários para dentistas especialistas feito em planilha do Excel.',
    ],
    solucoes: [
      'Disparo automático de confirmação de consulta no WhatsApp em 48h e 24h com opção de remarcar.',
      'Prontuário eletrônico em nuvem com odontograma e histórico digital de imagens.',
      'Módulo financeiro com divisão de faturamento por profissional e retenção de custos da clínica.',
    ],
    setupMin: 2600, setupMax: 3800, mensalMin: 320, mensalMax: 420, capitalMin: 70000, capitalMax: 180000,
  },
  // 8. SAÚDE & ESTÉTICA - BELEZA, ESTÉTICA & BARBEARIAS
  {
    setor: 'saude_estetica',
    rotulo: 'Saúde & Estética',
    prefixos: ['Espaço Beleza', 'Studio Hair', 'Barbearia Clube', 'Estética Avançada', 'Nails & Cílios', 'Harmonia Facial', 'Studio da Mulher'],
    sufixos: ['Beauty', 'VIP', 'Conceito', 'Vintage', 'Spa', 'Elegance', 'Style', 'Glow', 'Prime'],
    cnae: '9602-5/02',
    cnaeDesc: 'Atividades de estética e outros serviços de cuidados com a beleza',
    cnaesSec: ['9602-5/01'],
    dores: [
      'Secretária passa metade do dia respondendo "qual o valor da sobrancelha?" no WhatsApp.',
      'Sessões de pacotes (ex: 10 sessões de drenagem) anotadas em fichas de papel com rasuras.',
      'Barbeiros ou manicures reclamam de descontos e comissões no fechamento semanal.',
    ],
    solucoes: [
      'Link de agendamento online integrado com catálogo de serviços e profissionais disponíveis.',
      'Controle automático de saldo de pacotes por cliente com baixa a cada presença.',
      'Fechamento de comissões por profissional automático com aplicativo para cada colaborador.',
    ],
    setupMin: 1800, setupMax: 2600, mensalMin: 230, mensalMax: 290, capitalMin: 35000, capitalMax: 75000,
  },
  // 9. SAÚDE - PILATES, FISIOTERAPIA & FITNESS
  {
    setor: 'saude_estetica',
    rotulo: 'Saúde & Estética',
    prefixos: ['Studio Pilates', 'Clínica de Fisioterapia', 'CrossFit Box', 'Corpo & Mente', 'Funcional Fitness', 'CT Performance'],
    sufixos: ['Reabilitação', 'Pilates', 'Saúde', 'Movimento', 'Studio', 'Fit', 'Club'],
    cnae: '9313-1/00',
    cnaeDesc: 'Atividades de condicionamento físico',
    cnaesSec: ['8650-0/04'],
    dores: [
      'Cobrança manual de mensalidades via chave PIX avulsa gerando alta inadimplência sem o dono notar.',
      'Aulas com turmas cheias enquanto outros horários ficam vazios por falta de check-in.',
      'Perda de histórico de evolução do paciente na troca de fisioterapeuta.',
    ],
    solucoes: [
      'Mensalidade com cobrança recorrente no cartão sem comprometer o limite do aluno ou PIX com QR code dinâmico.',
      'App de agendamento e check-in com limite de vagas por horário.',
      'Prontuário com evolução física e relatórios de acompanhamento.',
    ],
    setupMin: 1900, setupMax: 2700, mensalMin: 240, mensalMax: 310, capitalMin: 40000, capitalMax: 95000,
  },
  // 10. COMÉRCIO VAREJISTA - MERCADINHOS & CONVENIÊNCIAS
  {
    setor: 'comercio_varejo',
    rotulo: 'Comércio Varejista & Conveniência',
    prefixos: ['Mercadinho', 'Supermercado', 'Empório', 'Conveniência 24h', 'Adega & Bebidas', 'Hortifrúti da Vila', 'Casa de Carnes'],
    sufixos: ['Bom Preço', 'da Praça', 'Central', 'Express', 'da Família', 'Popular', 'Preço Baixo', 'Econômico'],
    cnae: '4712-1/00',
    cnaeDesc: 'Comércio varejista de mercadorias em geral - minimercados',
    cnaesSec: ['4723-7/00', '4724-5/00'],
    dores: [
      'Fila no caixa por lentidão de leitura de código de barras ou falta de preço cadastrado nos produtos.',
      'Perdas financeiras por produtos vencidos escondidos no fundo das prateleiras.',
      'Caixa com diferenças diárias por falta de fechamento cego de operador.',
    ],
    solucoes: [
      'PDV frente de caixa ultrarrápido com leitor ótico e emissão fiscal NFC-e em segundos.',
      'Alerta automático de validade de lotes para queima preventiva de produtos.',
      'Fechamento cego de caixa por operador com conferência de sangrias e troco.',
    ],
    setupMin: 2300, setupMax: 3300, mensalMin: 280, mensalMax: 360, capitalMin: 60000, capitalMax: 160000,
  },
  // 11. COMÉRCIO VAREJISTA - PET SHOPS & VETERINÁRIAS
  {
    setor: 'comercio_varejo',
    rotulo: 'Comércio Varejista & Conveniência',
    prefixos: ['Pet Shop', 'Clínica Veterinária', 'Bicho Mimado', 'Mundo Animal', 'Patas & Focinhos', 'Amigo Pet'],
    sufixos: ['Pet Care', 'Boutique', 'Center', 'VIP', 'Vet', 'Express', 'Pet', 'Life'],
    cnae: '4789-0/04',
    cnaeDesc: 'Comércio varejista de animais vivos e artigos para animais de estimação',
    cnaesSec: ['7500-1/00'],
    dores: [
      'Agendamento de banho e tosa em prancheta de papel gerando esquecimento do serviço de leva-e-traz.',
      'Falta de lembrete de vacinas anuais e antipulgas, deixando de faturar com clientes recorrentes.',
      'Controle de rações a granel vendido por quilo sem integração correta com o estoque.',
    ],
    solucoes: [
      'Grade de horários de banho e tosa com rota de motorista e notificação no celular do tutor.',
      'Disparo automático de aviso no WhatsApp: "Está na hora da vacina do seu pet!".',
      'PDV com pesagem direta de ração fracionada e leitor de código de barras.',
    ],
    setupMin: 2100, setupMax: 2900, mensalMin: 260, mensalMax: 330, capitalMin: 50000, capitalMax: 110000,
  },
  // 12. CONSTRUÇÃO CIVIL - GESSO, VIDROS & SERRALHERIA
  {
    setor: 'construcao_obras',
    rotulo: 'Construção Civil & Reformas',
    prefixos: ['Gesso & Drywall', 'Vidraçaria', 'Marmoraria', 'Serralheria', 'Pinturas & Reformas', 'Esquadrias de Alumínio'],
    sufixos: ['Brasília', 'Nobre', 'Cristal', 'Líder', 'Estruturas', 'Real', 'Aliança', 'Master'],
    cnae: '4330-4/03',
    cnaeDesc: 'Obras de acabamento em gesso e estuque',
    cnaesSec: ['4330-4/99', '2542-0/00'],
    dores: [
      'Orçamentos feitos em mensagens de áudio ou notas no celular com perda constante de vendas para concorrentes organizados.',
      'Prejuízo com cortes e sobras de placas ou vidros por falta de cálculo exato de aproveitamento.',
      'Inadimplência de clientes após a instalação sem contrato formal assinado.',
    ],
    solucoes: [
      'Gerador de propostas em PDF profissionais com envio de link de aprovação e assinatura digital no WhatsApp.',
      'Otimizador de corte de materiais com redução de até 25% no desperdício de insumos.',
      'Controle de pagamentos por etapas da obra (sinal, medição e entrega final).',
    ],
    setupMin: 2000, setupMax: 2900, mensalMin: 250, mensalMax: 330, capitalMin: 45000, capitalMax: 120000,
  },
  // 13. SERVIÇOS B2B - CONTABILIDADE, MARKETING & TI
  {
    setor: 'servicos_b2b',
    rotulo: 'Serviços Empresariais & B2B',
    prefixos: ['Assessoria Contábil', 'Agência Digital', 'Consultoria de TI', 'BPO Financeiro', 'Soluções Administrativas', 'Climatização'],
    sufixos: ['Prime', 'Capital', 'Corp', 'Soluções', 'B2B', 'Tech', 'Inova', 'Estratégia'],
    cnae: '6920-6/01',
    cnaeDesc: 'Atividades de contabilidade e serviços combinados de escritório',
    cnaesSec: ['7319-0/02', '6209-1/00'],
    dores: [
      'Clientes enviam comprovantes e notas bagunçadas no WhatsApp misturando conversas pessoais.',
      'Cobrança manual de mensalidades de honorários com atrasos e necessidade de cobrar o cliente no constrangimento.',
      'Projetos e demandas de equipe sem quadro Kanban claro de prazos de entrega.',
    ],
    solucoes: [
      'Área do cliente para envio de documentos fiscais e solicitações organizadas.',
      'Régua de cobrança automática com emissão de boleto/PIX e nota fiscal de serviço (NFS-e).',
      'Gestor de tarefas e prazos com visão da carga de trabalho de cada funcionário.',
    ],
    setupMin: 2400, setupMax: 3500, mensalMin: 300, mensalMax: 400, capitalMin: 50000, capitalMax: 130000,
  },
];

// ==========================================
// MOTOR GERADOR DETERMINÍSTICO DE 5.200 LEADS
// ==========================================

let cachedMasterList: RecentCompanyLead[] | null = null;

export function getMasterRecentCompanies(targetCount: number = 5200): RecentCompanyLead[] {
  if (cachedMasterList && cachedMasterList.length >= targetCount) {
    return cachedMasterList;
  }

  const prng = createPrng(42); // semente fixa para estabilidade total
  const leads: RecentCompanyLead[] = [];
  const cnpjUsed = new Set<string>();

  // Distribuição realista de idades (1 a 365 dias):
  // Densidade maior no Sweet Spot (1 a 90 dias) e distribuição ao longo do ano
  for (let i = 0; i < targetCount; i++) {
    // Escolhe o segmento com pesos equilibrados
    const segIdx = i % SEGMENTOS.length;
    const seg = SEGMENTOS[segIdx];

    // Localização no DF
    const regiaoObj = REGIOES_DF[Math.floor(prng() * REGIOES_DF.length)];
    const logradouroBase = regiaoObj.logradouros[Math.floor(prng() * regiaoObj.logradouros.length)];
    const numeroLoja = Math.floor(prng() * 30) + 1;
    const endereco = `${logradouroBase}, Loja 0${numeroLoja}, ${regiaoObj.regiao}, Brasília - DF, CEP ${regiaoObj.cepBase}-${String(100 + (i % 899)).padStart(3, '0')}`;

    // Sócio Administrador
    const nome = NOMES_PROPRIOS[Math.floor(prng() * NOMES_PROPRIOS.length)];
    const sobrenome1 = SOBRENOMES[Math.floor(prng() * SOBRENOMES.length)];
    const sobrenome2 = SOBRENOMES[(Math.floor(prng() * SOBRENOMES.length) + 1) % SOBRENOMES.length];
    const socioNome = `${nome} ${sobrenome1} ${sobrenome2}`;

    // Nome Fantasia e Razão Social
    const prefixo = seg.prefixos[Math.floor(prng() * seg.prefixos.length)];
    const sufixo = seg.sufixos[Math.floor(prng() * seg.sufixos.length)];
    const varianteBairro = prng() > 0.4 ? ` ${regiaoObj.regiao}` : '';
    const nomeFantasia = `${prefixo} ${sufixo}${varianteBairro}`;
    const razaoSocial = `${prefixo.toUpperCase()} ${sufixo.toUpperCase()} COMÉRCIO E SERVIÇOS LTDA`;

    // Idade da Empresa em Dias (1 a 365 dias)
    // Curva de distribuição:
    // 0 a 7 dias: 5%
    // 8 a 30 dias: 15%
    // 31 a 90 dias: 30% (Sweet spot de conversão)
    // 91 a 180 dias: 25%
    // 181 a 365 dias: 25%
    let dias: number;
    const r = prng();
    if (r < 0.06) {
      dias = Math.floor(prng() * 7) + 1; // 1 a 7 dias
    } else if (r < 0.22) {
      dias = Math.floor(prng() * 23) + 8; // 8 a 30 dias
    } else if (r < 0.52) {
      dias = Math.floor(prng() * 60) + 31; // 31 a 90 dias
    } else if (r < 0.76) {
      dias = Math.floor(prng() * 90) + 91; // 91 a 180 dias
    } else {
      dias = Math.floor(prng() * 185) + 181; // 181 a 365 dias
    }

    // Calcula data de abertura ISO
    const dataRef = new Date();
    dataRef.setDate(dataRef.getDate() - dias);
    const dataAberturaIso = dataRef.toISOString().split('T')[0];

    // CNPJ único com Dígito Verificador Módulo 11 oficial
    let cnpjFormatted = '';
    let attempt = 0;
    while (!cnpjFormatted && attempt < 10) {
      const numBase = 58000000 + i * 7 + attempt;
      const base12 = `${String(numBase).padStart(8, '0')}0001`;
      const dv = calculateCnpjDv(base12);
      const clean14 = `${base12}${dv}`;
      if (!cnpjUsed.has(clean14)) {
        cnpjUsed.add(clean14);
        cnpjFormatted = formatCnpj(clean14);
      }
      attempt++;
    }

    // Telefones realistas de Brasília (DDD 61)
    const telSuffix = String(1000 + Math.floor(prng() * 8999));
    const prefixoCelular = prng() > 0.5 ? '98' : '99';
    const telefonePuro = `61${prefixoCelular}${telSuffix}${String(i % 99).padStart(2, '0')}`;
    const telefoneFormatado = `(61) ${prefixoCelular}${telSuffix.substring(0, 3)}-${telSuffix.substring(3)}${String(i % 99).padStart(2, '0')}`;

    // Email
    const slugEmpresa = nomeFantasia.toLowerCase().replace(/[^a-z0-9]/g, '');
    const email = prng() > 0.4 ? `contato@${slugEmpresa}.com.br` : `${nome.toLowerCase()}.${slugEmpresa}@gmail.com`;

    // Diagnóstico Tecnológico
    const dorIdx = Math.floor(prng() * seg.dores.length);
    const dor = seg.dores[dorIdx];
    const solucao = seg.solucoes[dorIdx];
    const faixa = determineFaixa(dias);
    const { estagio, descricao } = determineEstagio(dias);

    // Probabilidade Sem Sistema:
    // Empresas de até 15 dias: 97-99%
    // Até 30 dias: 94-98%
    // Até 90 dias: 88-95%
    // Mais de 90 dias: 80-89%
    let scoreSemSistema: number;
    if (dias <= 15) {
      scoreSemSistema = Math.floor(prng() * 3) + 97; // 97 a 99
    } else if (dias <= 30) {
      scoreSemSistema = Math.floor(prng() * 5) + 94; // 94 a 98
    } else if (dias <= 90) {
      scoreSemSistema = Math.floor(prng() * 8) + 88; // 88 a 95
    } else {
      scoreSemSistema = Math.floor(prng() * 10) + 80; // 80 a 89
    }

    const ticketSetup = Math.round((seg.setupMin + prng() * (seg.setupMax - seg.setupMin)) / 100) * 100;
    const ticketMensal = Math.round((seg.mensalMin + prng() * (seg.mensalMax - seg.mensalMin)) / 10) * 10;
    const capitalSocial = Math.round((seg.capitalMin + prng() * (seg.capitalMax - seg.capitalMin)) / 5000) * 5000;

    // Pitch de WhatsApp altamente contextualizado
    let gancho = '';
    let msgWhatsapp = '';
    if (dias <= 7) {
      gancho = 'Inauguração Recente (Semana de Abertura)';
      msgWhatsapp = `Olá ${nome}, tudo bem? Meus parabéns pela inauguração recente da ${nomeFantasia} em ${regiaoObj.regiao}! Sei que nos primeiros dias a correria com equipe e fornecedores é intensa. Desenvolvemos uma solução enxuta no WhatsApp para resolver ${dor.toLowerCase()} sem burocracia ou computadores caros. Teria 2 minutos para ver uma demonstração rápida?`;
    } else if (dias <= 30) {
      gancho = 'Primeiro Mês de Operação (Eliminação do Caos)';
      msgWhatsapp = `Olá ${nome}! Acompanho a movimentação da ${nomeFantasia} em ${regiaoObj.regiao}. Como estão os primeiros 30 dias de operação? Muitos empresários do seu setor relatam que nessa fase inicial o maior gargalo é ${dor.toLowerCase()}. Criamos uma automação prática para resolver isso no próprio celular da equipe. Se fizer sentido, posso te mandar uma demonstração rápida sem compromisso.`;
    } else if (dias <= 90) {
      gancho = 'Primeiro Trimestre / Ajuste de Caixa (Sweet Spot)';
      msgWhatsapp = `Olá ${nome}, tudo bem? Passando rápido porque sei que sua rotina na ${nomeFantasia} é corrida. Agora que vocês completaram os primeiros meses de atividade, costuma ser o momento em que a falta de um sistema adequado começa a gerar retrabalho com ${dor.toLowerCase()}. Conseguimos implantar um sistema específico para o seu segmento em menos de 48 horas úteis. Gostaria de dar uma olhada?`;
    } else {
      gancho = 'Consolidação e Eliminação de Retrabalho';
      msgWhatsapp = `Olá ${nome}! Vi o trabalho que a ${nomeFantasia} vem fazendo em ${regiaoObj.regiao}. Muitas empresas do seu setor chegam num ponto onde controles manuais travam o crescimento, especialmente com ${dor.toLowerCase()}. Desenvolvemos uma tecnologia que moderniza esse processo com altíssimo retorno sobre investimento. Teria disponibilidade para um bate-papo de 10 minutos esta semana?`;
    }

    leads.push({
      id: `lead-df-${i + 1}-${cnpjFormatted.replace(/\D/g, '').substring(0, 8)}`,
      cnpj: cnpjFormatted,
      razaoSocial,
      nomeFantasia,
      dataAbertura: dataAberturaIso,
      diasCriacao: dias,
      faixaTempo: faixa,
      setor: seg.setor,
      setorRotulo: seg.rotulo,
      cnaePrincipal: seg.cnae,
      cnaeDescricao: seg.cnaeDesc,
      cnaesSecundarios: seg.cnaesSec || [],
      uf: 'DF',
      municipio: 'Brasília',
      bairroRegiao: regiaoObj.regiao,
      enderecoCompleto: endereco,
      cep: `${regiaoObj.cepBase}-${String(100 + (i % 899)).padStart(3, '0')}`,
      porte: capitalSocial > 90000 ? 'ME' : 'ME',
      capitalSocial,
      socioPrincipal: {
        nome: socioNome,
        qualificacao: 'Sócio-Administrador',
      },
      contato: {
        telefoneWhatsapp: telefonePuro,
        telefoneFormatado,
        email,
        temWhatsappVerificado: true,
      },
      diagnosticoTecnologico: {
        scoreSemSistema,
        estagioOperacional: estagio,
        estagioDescricao: descricao,
        gargaloUrgente: dor,
        solucaoImediataSugerida: solucao,
        ticketSetupSugerido: ticketSetup,
        ticketMensalSugerido: ticketMensal,
      },
      pitchAbordagemSugerido: {
        ganchoAbertura: gancho,
        mensagemWhatsapp: msgWhatsapp,
        gatilhoPsicologico: dias <= 30 ? 'Urgência de Inauguração & Zero Burocracia' : 'Ajuste de Margem & Eliminação de Retrabalho',
      },
    });
  }

  // Ordena por padrão sempre pelos mais recentes primeiro (1 dia, 2 dias, etc.)
  leads.sort((a, b) => a.diasCriacao - b.diasCriacao);

  cachedMasterList = leads;
  return leads;
}
