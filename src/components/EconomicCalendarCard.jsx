import React from 'react';
import { Newspaper, ChevronRight, Calendar } from 'lucide-react';

export default function EconomicCalendarCard() {
  return (
    <div className="glass-card" id="section-calendar" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* ForexFactory Global News Banner */}
      <a
        href="https://www.forexfactory.com/news"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.4) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '14px',
          padding: '12px 16px',
          textDecoration: 'none',
          color: '#fff',
          transition: 'all 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(59, 130, 246, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#60a5fa',
            }}
          >
            <Newspaper size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.94rem' }}>Berita Global ForexFactory</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Pantau rilis data ekonomi & sentimen pasar dunia</div>
          </div>
        </div>
        <ChevronRight size={18} color="#94a3b8" />
      </a>

      {/* Investing.com Economic Calendar Widget */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Calendar size={16} color="#fbbf24" />
          <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc' }}>
            Kalender Ekonomi Global (Investing.com)
          </h4>
        </div>

        <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--card-border)' }}>
          <iframe
            src="https://sslecal2.investing.com?columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&category=_employment,_economicActivity,_inflation,_centralBanks,_Bonds&importance=1,2,3&features=datepicker,filters&countries=5,25,37,45,39,14,48,4,10,35,17,6,11,42,44,22,43,36,26,12,46,41,178,72&calType=day&timeZone=27&lang=54"
            width="100%"
            height="467"
            frameBorder="0"
            marginWidth="0"
            marginHeight="0"
            title="Investing.com Economic Calendar"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
