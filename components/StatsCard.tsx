import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'default' | 'success' | 'danger';
  subText?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'default',
  subText
}) => {
  const colorStyles = {
    default: 'bg-white text-gray-900 border-gray-100',
    success: 'bg-success-50 text-success-700 border-success-100',
    danger: 'bg-danger-50 text-danger-700 border-danger-100',
  };

  const iconStyles = {
    default: 'bg-gray-50 text-gray-500',
    success: 'bg-white text-success-600',
    danger: 'bg-white text-danger-600',
  };

  return (
    <div className={`p-6 rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md ${colorStyles[color]}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className={`text-sm font-medium mb-1 opacity-80`}>{title}</p>
          <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${iconStyles[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {subText && (
        <div className="pt-2 border-t border-black/5 mt-2">
            <p className="text-xs font-medium opacity-70">{subText}</p>
        </div>
      )}
    </div>
  );
};

export default StatsCard;