import React from 'react';
import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface DynamicIconProps extends LucideProps {
  name: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, ...props }) => {
  const IconComponent = (Icons as any)[name] || Icons.HelpCircle;
  return <IconComponent {...props} />;
};

export const ICON_BANK = [
  'Layers', 'Database', 'Briefcase', 'Users', 'Target', 'Activity', 'Shield', 
  'Calendar', 'Clock', 'Bell', 'FileText', 'Globe', 'Settings', 'Cpu', 'Terminal',
  'Zap', 'HardDrive', 'Network', 'Server', 'Cloud', 'Monitor', 'Smartphone',
  'Code', 'Wrench', 'Lightbulb', 'Compass', 'Flag', 'Map', 'Navigation',
  'Box', 'Package', 'Truck', 'ShoppingCart', 'CreditCard', 'Wallet',
  'PieChart', 'BarChart', 'LineChart', 'TrendingUp', 'Award', 'Trophy'
];

interface IconPickerProps {
  selectedIcon: string;
  onSelect: (name: string) => void;
}

export const IconPicker: React.FC<IconPickerProps> = ({ selectedIcon, onSelect }) => {
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(45px, 1fr))', 
      gap: '10px',
      maxHeight: '200px',
      overflowY: 'auto',
      padding: '15px',
      backgroundColor: 'rgba(0,0,0,0.2)',
      borderRadius: '12px',
      border: '1px solid rgba(255,255,255,0.05)'
    }}>
      {ICON_BANK.map(iconName => (
        <button
          key={iconName}
          type="button"
          onClick={() => onSelect(iconName)}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: selectedIcon === iconName ? 'var(--accent-primary)' : 'rgba(255,255,255,0.03)',
            border: '1px solid',
            borderColor: selectedIcon === iconName ? 'var(--accent-primary)' : 'rgba(255,255,255,0.08)',
            color: selectedIcon === iconName ? 'white' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title={iconName}
        >
          <DynamicIcon name={iconName} size={20} />
        </button>
      ))}
    </div>
  );
};
