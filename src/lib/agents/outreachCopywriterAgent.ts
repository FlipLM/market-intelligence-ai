import type { OutreachCopyBriefing } from '@/types/market';
import { desconhecido } from '@/types/provenance';
import { STANDARD_OUTREACH_TEMPLATE } from '../outreachMessage';

export function runOutreachCopywriterAgent(): OutreachCopyBriefing {
  return {
    disclaimer:
      'Modelo padrão único baseado exclusivamente em variáveis verificáveis. Máximo de 1 follow-up após 4 a 5 dias.',
    templatePadrao: STANDARD_OUTREACH_TEMPLATE,
    regraFollowup: 'Máximo 1 follow-up após 4 a 5 dias; bloquear imediatamente se recusou.',
    targetPersona: desconhecido('Persona não verificada — confirmar diretamente nas conversas'),
  };
}
