import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Student } from '../types';

interface AttendanceChartProps {
  students: Student[];
}

export default function AttendanceChart({ students }: AttendanceChartProps) {
  const chartData = useMemo(() => {
    const monthlyData: { [key: string]: { total: number; present: number } } = {};

    students.forEach(s => {
      s.attendance.forEach(a => {
        const date = new Date(a.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { total: 0, present: 0 };
        }
        
        monthlyData[monthKey].total++;
        if (a.status === "Présent" || a.status === "Retard") {
          monthlyData[monthKey].present++;
        }
      });
    });

    return Object.keys(monthlyData)
      .sort()
      .map(month => ({
        month,
        rate: Math.round((monthlyData[month].present / monthlyData[month].total) * 100)
      }));
  }, [students]);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip />
          <Line type="monotone" dataKey="rate" stroke="#4f46e5" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
