import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown } from 'lucide-react';
import { type HistoryEntry } from '@/hooks/useProfiles';

interface HistoryChartProps {
  history: HistoryEntry[];
  activeProfileId: string | null;
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const HistoryChart = ({ history, activeProfileId }: HistoryChartProps) => {
  const filtered = activeProfileId
    ? history.filter(h => h.profileId === activeProfileId)
    : history;

  if (filtered.length < 1) return null;

  const data = filtered.map(h => {
    const [, month] = h.date.split('-');
    return {
      month: MONTH_LABELS[parseInt(month) - 1],
      total: Math.round(h.monthlyTotal),
    };
  });

  const firstVal = data[0]?.total || 0;
  const lastVal = data[data.length - 1]?.total || 0;
  const saved = firstVal - lastVal;
  const savedPercent = firstVal > 0 ? Math.round((saved / firstVal) * 100) : 0;

  return (
    <div className="bg-card rounded-3xl p-5 shadow-card mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-card-foreground text-sm">Savings Progress</h3>
          <p className="text-[11px] text-muted-foreground">Monthly bill over time</p>
        </div>
        {data.length >= 2 && saved > 0 && (
          <div className="flex items-center gap-1.5 bg-accent/10 text-accent px-2.5 py-1 rounded-full">
            <TrendingDown size={12} />
            <span className="text-[11px] font-bold">↓ {savedPercent}%</span>
          </div>
        )}
      </div>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="chartGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(153, 100%, 27%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(153, 100%, 27%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: 'hsl(220, 9%, 46%)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'hsl(220, 9%, 46%)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `₦${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(220, 13%, 91%)',
                borderRadius: 12,
                fontSize: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,.08)',
              }}
              formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Monthly Total']}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="hsl(153, 100%, 27%)"
              strokeWidth={2}
              fill="url(#chartGreen)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HistoryChart;
