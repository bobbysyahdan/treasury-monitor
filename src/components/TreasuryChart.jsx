import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { TrendingUp, ArrowUp, ArrowDown, Target, PieChart } from 'lucide-react';
import { formatRupiah, fetchChartData } from '../services/api';

const TF_CONFIG = {
  '5m': { label: '5 Mnt', ms: 300000, maxPts: 30 },
  '15m': { label: '15 Mnt', ms: 900000, maxPts: 30 },
  '1h': { label: '1 Jam', ms: 3600000, maxPts: 40 },
  '4h': { label: '4 Jam', ms: 14400000, maxPts: 35 },
  '8h': { label: '8 Jam', ms: 28800000, maxPts: 35 },
  '1d': { label: '1 Hari', ms: 86400000, maxPts: 30 },
};

export default function TreasuryChart({ historyData, adminSettings }) {
  const [activeTf, setActiveTf] = useState('5m');
  const [chartPoints, setChartPoints] = useState([]);
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      // First try fetching dedicated timeframe chart data from firebase
      if (activeTf !== '5m' && activeTf !== '15m') {
        const remoteData = await fetchChartData(activeTf);
        if (remoteData && remoteData.length > 0 && isMounted) {
          setChartPoints(remoteData);
          return;
        }
      }

      // Fallback: derive from live historyData
      if (!historyData || historyData.length === 0) return;

      const cfg = TF_CONFIG[activeTf] || TF_CONFIG['5m'];
      const now = Date.now();
      const filtered = historyData
        .filter(x => x && x.timestamp && (now - x.timestamp) <= cfg.ms)
        .sort((a, b) => a.timestamp - b.timestamp);

      if (filtered.length > 0 && isMounted) {
        setChartPoints(filtered);
      } else if (historyData.length > 0 && isMounted) {
        setChartPoints(historyData.slice(0, 30).reverse());
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [activeTf, historyData]);

  // Render chart on canvas
  useEffect(() => {
    if (!canvasRef.current || chartPoints.length === 0) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    const labels = chartPoints.map(p => {
      const d = new Date(p.timestamp);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    });
    const dataValues = chartPoints.map(p => p.buy || 0);

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Harga Beli Treasury (Rp/g)',
            data: dataValues,
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            borderWidth: 2,
            fill: true,
            tension: 0.35,
            pointRadius: chartPoints.length > 30 ? 0 : 3,
            pointHoverRadius: 6,
            pointBackgroundColor: '#10B981',
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `Harga: ${formatRupiah(context.parsed.y)}`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8', font: { size: 10 }, maxTicksLimit: 7 }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: '#94a3b8',
              font: { size: 10 },
              callback: (value) => (value >= 1000000 ? `${(value / 1000000).toFixed(2)}M` : value)
            }
          }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [chartPoints]);

  return (
    <div className="chart-card-wrapper" id="section-chart">
      <div className="chart-header">
        <div className="chart-title">
          <TrendingUp size={18} /> GRAFIK HARGA BELI TREASURY
        </div>
        <div className="timeframe-group">
          {Object.entries(TF_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              className={`tf-btn ${activeTf === key ? 'active' : ''}`}
              onClick={() => setActiveTf(key)}
            >
              {cfg.label}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-canvas-container">
        <canvas ref={canvasRef} />
      </div>

      {/* Mini Stats Grid */}
      <div className="mini-stats-grid" style={{ marginTop: '16px' }}>
        <div className="mini-stat-card">
          <div>
            <div className="mini-stat-label">Tertinggi Hari Ini</div>
            <div className="mini-stat-val high">
              {adminSettings?.day_high ? formatRupiah(adminSettings.day_high) : 'Rp 0'}
            </div>
          </div>
          <ArrowUp size={20} color="#10b981" />
        </div>

        <div className="mini-stat-card">
          <div>
            <div className="mini-stat-label">Terendah Hari Ini</div>
            <div className="mini-stat-val low">
              {adminSettings?.day_low ? formatRupiah(adminSettings.day_low) : 'Rp 0'}
            </div>
          </div>
          <ArrowDown size={20} color="#ef4444" />
        </div>

        <div className="mini-stat-card">
          <div>
            <div className="mini-stat-label">Tertinggi Bulan Ini</div>
            <div className="mini-stat-val high">
              {adminSettings?.month_high ? formatRupiah(adminSettings.month_high) : 'Rp 0'}
            </div>
          </div>
          <ArrowUp size={20} color="#10b981" />
        </div>

        <div className="mini-stat-card">
          <div>
            <div className="mini-stat-label">Terendah Bulan Ini</div>
            <div className="mini-stat-val low">
              {adminSettings?.month_low ? formatRupiah(adminSettings.month_low) : 'Rp 0'}
            </div>
          </div>
          <ArrowDown size={20} color="#ef4444" />
        </div>

        <div className="mini-stat-card">
          <div>
            <div className="mini-stat-label">Batas Harga ON</div>
            <div className="mini-stat-val" style={{ color: '#38bdf8' }}>
              {adminSettings?.promo_price ? formatRupiah(adminSettings.promo_price) : 'Sedang memuat...'}
            </div>
          </div>
          <Target size={20} color="#38bdf8" />
        </div>

        <div className="mini-stat-card">
          <div>
            <div className="mini-stat-label">Limit Bulan Ini</div>
            <div className="mini-stat-val" style={{ color: '#fbbf24' }}>
              {adminSettings?.limbul_ver3 ? `${Number(adminSettings.limbul_ver3).toLocaleString('id-ID')}` : '----'}
            </div>
          </div>
          <PieChart size={20} color="#fbbf24" />
        </div>
      </div>
    </div>
  );
}
