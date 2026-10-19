import React, { useState } from 'react';
import { Maximize2, Minimize2, ExternalLink, Activity } from 'lucide-react';

const SYMBOLS = {
  xauusd: {
    label: 'XAU/USD',
    sub: 'Emas Dunia',
    symbol: 'OANDA:XAUUSD',
  },
  usdidr: {
    label: 'USD/IDR',
    sub: 'Dolar ke Rupiah',
    symbol: 'FX_IDC:USDIDR',
  },
  xauidr: {
    label: 'XAU/IDR',
    sub: 'Emas ke Rupiah',
    symbol: 'FX_IDC:XAUIDR',
  },
};

const INTERVALS = [
  { value: '1', label: '1m' },
  { value: '5', label: '5m' },
  { value: '15', label: '15m' },
  { value: '60', label: '1h' },
  { value: '240', label: '4h' },
  { value: 'D', label: '1D' },
];

export default function TradingViewCard() {
  const [activeTab, setActiveTab] = useState('xauusd');
  const [activeInterval, setActiveInterval] = useState('15'); // Default 15m
  const [isExpanded, setIsExpanded] = useState(false);

  const getTvUrl = (sym, intv = activeInterval) => {
    return `https://www.tradingview.com/widgetembed/?symbol=${encodeURIComponent(
      sym
    )}&interval=${intv}&hidetoptoolbar=0&hidesidetoolbar=1&symboledit=1&saveimage=0&toolbarbg=131722&theme=dark&style=1&timezone=Asia%2FJakarta&locale=id_ID&withdateranges=1&hideideas=1`;
  };

  const currentSym = SYMBOLS[activeTab].symbol;

  return (
    <div
      className={`tradingview-card ${isExpanded ? 'tv-expanded' : ''}`}
      id="section-tradingview"
      style={
        isExpanded
          ? {
              position: 'fixed',
              top: '20px',
              left: '20px',
              right: '20px',
              bottom: '20px',
              zIndex: 9999,
              borderRadius: '20px',
            }
          : {}
      }
    >
      <div className="tv-tabs-header">
        <div className="tv-tab-buttons">
          {Object.entries(SYMBOLS).map(([key, item]) => (
            <button
              key={key}
              className={`tv-tab-btn ${activeTab === key ? 'active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              <Activity size={14} />
              <span>{item.label}</span>
              <span style={{ fontSize: '0.78rem', opacity: 0.75, fontWeight: 600 }}>({item.sub})</span>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Timeframe Selector (Default 15m) */}
          <div className="tv-interval-buttons">
            {INTERVALS.map((intv) => (
              <button
                key={intv.value}
                className={`tv-interval-btn ${activeInterval === intv.value ? 'active' : ''}`}
                onClick={() => setActiveInterval(intv.value)}
                title={`Pilih timeframe ${intv.label}`}
              >
                {intv.label}
              </button>
            ))}
          </div>

          <button
            className="icon-button"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Perkecil Grafik' : 'Perbesar Layar Penuh'}
          >
            {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
          <a
            href={`https://id.tradingview.com/symbols/${currentSym.replace(':', '-')}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="icon-button"
            title="Buka di TradingView"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      <div
        className="tv-iframe-wrapper"
        style={isExpanded ? { height: 'calc(100% - 50px)' } : { height: '420px' }}
      >
        <iframe
          key={`${currentSym}-${activeInterval}`}
          title={`TradingView Chart ${currentSym}`}
          src={getTvUrl(currentSym, activeInterval)}
          loading="lazy"
        />
      </div>
    </div>
  );
}
