'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface RankingChartProps {
  data: Array<{
    name: string;
    score: number;
    potential: string;
  }>;
}

export default function NicheRankingChart({ data }: RankingChartProps) {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 8, right: 16, left: 4, bottom: 0 }}
        >
          <XAxis 
            type="number" 
            domain={[0, 100]} 
            stroke="#262629" 
            tick={{ fill: '#6e6e73', fontSize: 11 }} 
            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            tickLine={false}
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            width={170} 
            stroke="#262629" 
            tick={{ fill: '#a1a1a6', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            contentStyle={{ 
              backgroundColor: '#141517', 
              borderColor: 'rgba(255,255,255,0.12)', 
              borderRadius: '6px', 
              padding: '6px 10px',
              fontSize: '12px',
              color: '#ededed' 
            }}
            formatter={(value: any) => [`${value} pts`, 'Score']}
          />
          <Bar dataKey="score" radius={[0, 3, 3, 0]} barSize={12}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={index === 0 ? '#ededed' : '#2d3036'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
