import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface AnalyticsChartProps {
  data: any[];
  type: 'bar' | 'pie' | 'line';
  dataKey?: string;
  xAxisKey?: string;
  colors?: string[];
  className?: string;
}

const DEFAULT_COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

export function AnalyticsChart({ 
  data, 
  type, 
  dataKey = 'value', 
  xAxisKey = 'name',
  colors = DEFAULT_COLORS,
  className = "h-64"
}: AnalyticsChartProps) {
  if (type === 'bar') {
    return (
      <div className={className}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey={xAxisKey} 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <Bar 
              dataKey={dataKey} 
              fill={colors[0]}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'pie') {
    return (
      <div className={className}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={2}
              dataKey={dataKey}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'line') {
    return (
      <div className={className}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey={xAxisKey} 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke={colors[0]}
              strokeWidth={2}
              dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return null;
}