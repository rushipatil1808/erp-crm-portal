import React from 'react';

export const DonutChart: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <svg width="130" height="130" viewBox="0 0 42 42">
        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#e2e8f0" strokeWidth="6" />
        <circle
          cx="21"
          cy="21"
          r="15.915"
          fill="transparent"
          stroke="#2563eb"
          strokeWidth="6"
          strokeDasharray="45 55"
          strokeDashoffset="25"
        />
        <circle
          cx="21"
          cy="21"
          r="15.915"
          fill="transparent"
          stroke="#f97316"
          strokeWidth="6"
          strokeDasharray="30 70"
          strokeDashoffset="80"
        />
        <circle
          cx="21"
          cy="21"
          r="15.915"
          fill="transparent"
          stroke="#0d9488"
          strokeWidth="6"
          strokeDasharray="25 75"
          strokeDashoffset="50"
        />
      </svg>

      <div style={{ width: '100%', fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb' }}></span>
            Power Banks
          </span>
          <strong>45%</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f97316' }}></span>
            USB Cables
          </span>
          <strong>30%</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0d9488' }}></span>
            Chargers
          </span>
          <strong>25%</strong>
        </div>
      </div>
    </div>
  );
};
