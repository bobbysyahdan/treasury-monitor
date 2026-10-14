import React from 'react';
import { DollarSign, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { formatNumber } from '../services/api';

export default function UsdCard({ usdHistory, currentUsd, usdChange }) {
  const isUp = usdChange > 0;
  const isDown = usdChange < 0;

  return (
    <div className="usd-card" id="section-usd">
      <div className="usd-card-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <DollarSign size={17} />
          <span>Harga USD/IDR by Google Finance</span>
        </div>
        <span style={{ fontSize: '0.78rem', color: '#7dd3fc', fontWeight: 600 }}>
          Live GAS Feed
        </span>
      </div>

      <div className="usd-live-box">
        <div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
            Harga Saat Ini
          </div>
          <div className="usd-live-val">
            {currentUsd > 0 ? `Rp ${formatNumber(currentUsd, 2)}` : 'Memuat data...'}
          </div>
        </div>

        <div className={`usd-pct-tag ${isUp ? 'up' : isDown ? 'down' : 'neutral'}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {isUp ? <ArrowUpRight size={14} /> : isDown ? <ArrowDownRight size={14} /> : null}
            <span>{isUp ? '+' : ''}{formatNumber(usdChange, 2)}%</span>
          </div>
        </div>
      </div>

      <div style={{ fontSize: '0.84rem', color: '#94a3b8', fontWeight: 700, marginBottom: '6px' }}>
        Riwayat Pergerakan Terakhir:
      </div>

      <div className="usd-hist-list">
        {usdHistory && usdHistory.length > 0 ? (
          usdHistory.slice(0, 10).map((item, index) => {
            const nextItem = usdHistory[index + 1];
            const rawCur = parseFloat(item.usd_idr || 0);
            const rawNext = nextItem ? parseFloat(nextItem.usd_idr || 0) : rawCur;
            const isGreen = rawCur >= rawNext;

            const dateObj = new Date(item.timestamp || Date.now());
            const timeStr = !isNaN(dateObj.getTime())
              ? dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              : (item.datetime ? item.datetime.split(',')[1] || item.datetime : '--:--');

            return (
              <div key={item.timestamp || index} className="usd-hist-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 800, color: '#f8fafc', fontFamily: 'JetBrains Mono, monospace' }}>
                    Rp {formatNumber(rawCur, 2)}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                    ({timeStr})
                  </span>
                </div>
                <span>{isGreen ? '🟢' : '🔴'}</span>
              </div>
            );
          })
        ) : (
          <div style={{ color: '#94a3b8', fontSize: '0.82rem', textAlign: 'center', padding: '12px' }}>
            Menunggu sinkronisasi data Google Finance...
          </div>
        )}
      </div>
    </div>
  );
}
