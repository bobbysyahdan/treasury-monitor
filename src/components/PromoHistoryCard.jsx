import React from 'react';
import { History, Tag } from 'lucide-react';
import { formatRupiah } from '../services/api';

export default function PromoHistoryCard({ promoHistory }) {
  return (
    <div className="glass-card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <History size={16} color="#fbbf24" />
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fbbf24' }}>
          RIWAYAT PROMO TREASURY
        </h3>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="treasury-table" style={{ fontSize: '0.88rem' }}>
          <thead>
            <tr>
              <th>Waktu</th>
              <th>Harga Promo</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {promoHistory && promoHistory.length > 0 ? (
              promoHistory.map((item, index) => {
                const rawPrice = item.price || item.promo_price_after || item.promo_price_before || 0;
                const dateObj = new Date(item.timestamp || Date.now());
                const timeStr = item.time || (item.datetime ? item.datetime.split(',')[1] : dateObj.toLocaleTimeString('id-ID'));
                const dateStr = item.date || (item.datetime ? item.datetime.split(',')[0] : dateObj.toLocaleDateString('id-ID'));
                const isPromoActive = item.status === 'ON' || item.status === 'active' || item.is_active;

                return (
                  <tr key={item.timestamp || index}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#f8fafc' }}>{timeStr}</div>
                      <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{dateStr}</div>
                    </td>
                    <td style={{ fontWeight: 800, color: '#38bdf8', fontFamily: 'JetBrains Mono, monospace' }}>
                      {rawPrice > 0 ? formatRupiah(rawPrice) : '-'}
                    </td>
                    <td>
                      <span
                        className={`promo-status-badge ${isPromoActive ? 'on' : 'off'}`}
                        style={{ fontSize: '0.8rem' }}
                      >
                        {isPromoActive ? 'ON' : 'OFF'}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '16px', color: '#94a3b8' }}>
                  Menunggu data riwayat promo...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
