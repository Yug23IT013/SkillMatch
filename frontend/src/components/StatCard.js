'use client';
import { SpotlightCard } from './ui/SpotlightCard';

export default function StatCard({ title, value, subtitle, icon, color = 'primary' }) {
  const colors = {
    primary: 'bg-primary/20 text-primary border-primary/20',
    green: 'bg-green-500/20 text-green-500 border-green-500/20',
    yellow: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20',
    red: 'bg-red-500/20 text-red-500 border-red-500/20',
    purple: 'bg-purple-500/20 text-purple-500 border-purple-500/20'
  };

  return (
    <SpotlightCard className="p-6 h-full flex flex-col justify-center">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-muted-foreground tracking-tight">{title}</p>
          <p className="text-4xl font-black text-foreground mt-2 tracking-tighter">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-2 font-medium">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </SpotlightCard>
  );
}
