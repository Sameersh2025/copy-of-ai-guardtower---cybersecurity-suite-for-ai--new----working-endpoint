
import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  color: 'green' | 'yellow' | 'red' | 'blue' | 'gray';
}

const Badge: React.FC<BadgeProps> = ({ children, color }) => {
  const colorClasses = {
    green: 'bg-green-500/10 text-green-400 border-green-500/30',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    red: 'bg-red-500/10 text-red-400 border-red-500/30',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    gray: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses[color]}`}>
      {children}
    </span>
  );
};

export default Badge;
