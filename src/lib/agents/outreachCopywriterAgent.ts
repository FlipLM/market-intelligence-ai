import { OutreachCopyBriefing } from '@/types/market';
import { desconhecido } from '@/types/provenance';

export const STANDARD_OUTREACH_TEMPLATE =
  'Olá, {nome}! Tudo bem? Aqui é o {remetente}, desenvolvedor aqui de Brasília. Encontrei a {empresa} pelo {origem} e gostei do trabalho de vocês. Crio ferramentas simples de gestão (agenda, estoque, orçamentos) para negócios pequenos e estou conversando com donos de {categoria} para entender como organizam a rotina. Posso te fazer 2 perguntas rápidas? Não é pegadinha de venda. Se não for o momento, sem problema, é só me avisar que não volto a escrever.';

export function runOutreachCopywriterAgent(): OutreachCopyBriefing {
  return {
    disclaimer:
      'Modelo padrão único baseado exclusivamente em variáveis verificáveis. Máximo de 1 follow-up após 4 a 5 dias.',
    templatePadrao: STANDARD_OUTREACH_TEMPLATE,
    regraFollowup: 'Máximo 1 follow-up após 4 a 5 dias; bloquear imediatamente se recusou.',
    targetPersona: desconhecido('Persona não verificada — confirmar diretamente nas conversas'),
  };
}
