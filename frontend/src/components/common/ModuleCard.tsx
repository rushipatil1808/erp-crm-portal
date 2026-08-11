import React from 'react';

interface ModuleCardProps {
  title: string;
  variant: 'finance' | 'inventory' | 'sales' | 'hr';
  icon: React.ReactNode;
  onClick?: () => void;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  title,
  variant,
  icon,
  onClick,
}) => {
  return (
    <div className={`module-card module-${variant}`} onClick={onClick}>
      <div style={{ fontSize: '1.75rem' }}>{icon}</div>
      <span>{title}</span>
    </div>
  );
};
