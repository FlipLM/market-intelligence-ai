'use client';

import { ScoreItem } from '@/types/market';

interface ScoreBreakdownViewProps {
  items: ScoreItem[];
}

export default function ScoreBreakdownView({ items }: ScoreBreakdownViewProps) {
  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="bg-[#19191b] border border-white/[0.04] rounded-md p-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[#ededed]">{item.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#6e6e73] font-mono">
                {(item.weight * 100).toFixed(0)}%
              </span>
              <span className="font-mono font-semibold text-[#ededed]">
                {item.rawScore}
              </span>
            </div>
          </div>

          <div className="w-full bg-[#101113] h-1 rounded-full overflow-hidden">
            <div 
              className="bg-[#ededed] h-full rounded-full opacity-80"
              style={{ width: `${item.rawScore}%` }}
            />
          </div>

          <p className="text-[11px] text-[#85858b] leading-tight">
            {item.justification}
          </p>
        </div>
      ))}
    </div>
  );
}
