'use client';

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface ScatterChartProps {
  data: Array<{
    name: string;
    potencial: number; // 0-100
    facilidade: number; // 0-100
    empresas: number;
  }>;
}

export default function ScatterOpportunityChart({ data }: ScatterChartProps) {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 12, right: 16, bottom: 12, left: 0 }}
        >
          <XAxis 
            type="number" 
            dataKey="facilidade" 
            name="Facilidade de Entrada" 
            domain={[0, 100]} 
            stroke="#262629"
            tick={{ fill: '#6e6e73', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            tickLine={false}
          />
          <YAxis 
            type="number" 
            dataKey="potencial" 
            name="Potencial Comercial" 
            domain={[0, 100]} 
            stroke="#262629"
            tick={{ fill: '#6e6e73', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            tickLine={false}
          />
          <ZAxis type="number" dataKey="empresas" range={[60, 200]} name="Empresas" />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.1)' }}
            contentStyle={{ 
              backgroundColor: '#141517', 
              borderColor: 'rgba(255,255,255,0.12)', 
              borderRadius: '6px', 
              padding: '6px 10px',
              fontSize: '12px',
              color: '#ededed' 
            }}
            formatter={(value: any, name: any) => [value, name]}
          />
          <ReferenceLine x={50} stroke="rgba(255,255,255,0.06)" strokeDasharray="2 2" />
          <ReferenceLine y={50} stroke="rgba(255,255,255,0.06)" strokeDasharray="2 2" />
          <Scatter name="Nichos" data={data} fill="#a1a1a6" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
