import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface FinancialGaugeProps {
  revenue: number;
  breakEven: number;
}

export default function FinancialGauge({ revenue, breakEven }: FinancialGaugeProps) {
  const percentage = Math.min((revenue / breakEven) * 100, 100);
  const data = [
    { name: 'Revenue', value: percentage },
    { name: 'Remaining', value: 100 - percentage },
  ];
  const COLORS = ['#4f46e5', '#e2e8f0'];

  return (
    <div className="h-40 w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={0}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute bottom-0 w-full text-center">
        <p className="text-2xl font-black text-slate-800">{Math.round(percentage)}%</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase">Objectif</p>
      </div>
    </div>
  );
}
