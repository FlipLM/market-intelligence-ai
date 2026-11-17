'use client';

import { ScoreItem } from '@/types/market';

interface ScoreBreakdownViewProps {
  items: ScoreItem[];
}

export default function ScoreBreakdownView({ items }: ScoreBreakdownViewProps) {
  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="bg-slate-50 dark:bg-[#19191b] border border-slate-200 dark:border-white/[0.06] rounded-md p-3 space-y-1.5"
        >
          <div className="flex items-center justify-between text-xs gap-2">
            <span className="font-medium text-slate-900 dark:text-[#ededed]">{item.name}</span>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] text-slate-500 font-mono">
                {(item.weight * 100).toFixed(0)}%
              </span>
              <span className="font-mono font-semibold text-slate-900 dark:text-[#ededed]">
                {item.rawScore !== null ? item.rawScore : 'Não verificado'}
              </span>
            </div>
          </div>

          <div className="w-full bg-slate-200 dark:bg-[#101113] h-1 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 dark:bg-[#ededed] h-full rounded-full opacity-80"
              style={{ width: `${item.rawScore ?? 0}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-500 dark:text-[#85858b] leading-tight">
            {item.justification}
          </p>
        </div>
      ))}
    </div>
  );
}
