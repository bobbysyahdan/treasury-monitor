import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Bell, Radio, ArrowUp, ArrowDown, Activity, Sparkles } from 'lucide-react';
import { formatRupiah, formatNumber, isMarketOpen } from '../services/api';

export default function AntigrvtyLiveCard({
  liveBuy,
  liveSell,
  prevBuy,
  prevSell,
  updatedAt,
  usdRate,
  usdChange,
  globalRates,
  promoActive,
  soundEnabled,
  onToggleSound
}) {
  const [flashBuyClass, setFlashBuyClass] = useState('');
  const [flashSellClass, setFlashSellClass] = useState('');
  const [tickBuyClass, setTickBuyClass] = useState('');
  const [tickSellClass, setTickSellClass] = useState('');
  const [showSiapSiap, setShowSiapSiap] = useState(false);

  // Monitor price changes for tick animations
  useEffect(() => {
    if (prevBuy && liveBuy && liveBuy !== prevBuy) {
      const isUp = liveBuy > prevBuy;
      setFlashBuyClass(isUp ? 'flash-up' : 'flash-down');
      setTickBuyClass(isUp ? 'tick-up' : 'tick-down');
      const timer = setTimeout(() => {
        setFlashBuyClass('');
        setTickBuyClass('');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [liveBuy, prevBuy]);

  useEffect(() => {
    if (prevSell && liveSell && liveSell !== prevSell) {
      const isUp = liveSell > prevSell;
      setFlashSellClass(isUp ? 'flash-up' : 'flash-down');
      setTickSellClass(isUp ? 'tick-up' : 'tick-down');
      const timer = setTimeout(() => {
        setFlashSellClass('');
        setTickSellClass('');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [liveSell, prevSell]);

  // Siap-siap timer check (runs around :55s to :59s of each minute)
  useEffect(() => {
    const checkSeconds = () => {
      const now = new Date();
      const sec = now.getSeconds();
      if (sec >= 54 && sec <= 59 && isMarketOpen() === 'PASAR LIVE') {
        setShowSiapSiap(true);
      } else {
        setShowSiapSiap(false);
      }
    };
    const interval = setInterval(checkSeconds, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate spread percentage and nominal
  const spreadNominal = liveBuy && liveSell ? liveBuy - liveSell : 0;
  const spreadPct = liveBuy && liveSell ? ((spreadNominal / liveBuy) * 100).toFixed(2) : '0.00';

  // Calculate World Gold difference (Markup / Markdown)
  let worldAnalysis = null;
  if (liveBuy > 0 && globalRates?.xauUsd > 0 && (usdRate > 0 || globalRates?.usdIdr > 0)) {
    const activeUsd = usdRate > 0 ? usdRate : globalRates.usdIdr;
    // 1 troy ounce = 31.1035 grams, multiply with import duty/tax factor ~ 1.0334
    const worldPerGram = ((globalRates.xauUsd / 31.1035) * activeUsd) * 1.0334;
    const diff = Math.round(liveBuy - worldPerGram);
    worldAnalysis = {
      worldPerGram,
      diff,
      type: diff > 500 ? 'MARKUP' : diff < -500 ? 'MARKDOWN' : 'NORMAL'
    };
  }

  // AI Sentiment text generator
  const getAiSentiment = () => {
    if (!liveBuy) return 'Menyinkronkan data dengan global market...';
    if (worldAnalysis) {
      const diffFormatted = Math.abs(worldAnalysis.diff).toLocaleString('id-ID');
      if (worldAnalysis.type === 'MARKUP') {
        return `Treasury melakukan markup sekitar Rp ${diffFormatted} dari harga dunia spot saat ini. Selisih spread jual & beli tercatat ${spreadPct}%.`;
      } else if (worldAnalysis.type === 'MARKDOWN') {
        return `Treasury melakukan markdown sekitar Rp ${diffFormatted} di bawah harga dunia spot. Momentum menarik untuk akumulasi! Spread: ${spreadPct}%.`;
      } else {
        return `Harga Treasury terpantau stabil selaras indikator pergerakan spot dunia. Selisih spread jual & beli tercatat ${spreadPct}%.`;
      }
    }
    return `Mengkalkulasi spread harga (${spreadPct}%) dan memvalidasi algoritma pergerakan harga Treasury...`;
  };

  const marketStatus = isMarketOpen();

  return (
    <div className="antigrvty-card" id="section-treasury">
      {/* Top Bar with signal and sound button */}
      <div className="antigrvty-top">
        <div className="antigrvty-badge-group">
          <div className="signal-bars">
            <div className="signal-bar"></div>
            <div className="signal-bar"></div>
            <div className="signal-bar"></div>
            <div className="signal-bar"></div>
          </div>
          <span className="live-badge-title">API TREASURY REALTIME</span>
          {/* <button
            className={`icon-button ${soundEnabled ? 'active' : ''}`}
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute Suara Notifikasi' : 'Aktifkan Suara Notifikasi'}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button> */}
        </div>

        <div className="right-badges">
          {promoActive ? (
            <span className="promo-status-badge on">• PROMO ON</span>
          ) : (
            <span className="promo-status-badge off">• PROMO OFF</span>
          )}

          {showSiapSiap && (
            <div className="siap-siap-badge">
              <Bell size={12} />
              <span>SIAP SIAP</span>
            </div>
          )}
        </div>
      </div>

      {/* Triple Stats Bar */}
      <div className="stats-triple-row">
        <div className="stat-pill-box">
          <div className="stat-pill-label">USD Rate</div>
          <div className={`stat-pill-value ${usdChange > 0 ? 'green' : usdChange < 0 ? 'red' : ''}`}>
            {usdRate > 0 ? `Rp ${formatNumber(usdRate, 2)}` : 'Memuat...'}
          </div>
        </div>

        <div className="stat-pill-box">
          <div className="stat-pill-label">Spread Jual-Beli</div>
          <div className="stat-pill-value">
            {spreadPct}% ({formatRupiah(spreadNominal)})
          </div>
        </div>

        <div className="stat-pill-box">
          <div className="stat-pill-label">
            {worldAnalysis?.type === 'MARKUP' ? 'Markup Dunia' : worldAnalysis?.type === 'MARKDOWN' ? 'Markdown Dunia' : 'Selisih Spot'}
          </div>
          <div className={`stat-pill-value ${worldAnalysis?.type === 'MARKUP' ? 'green' : worldAnalysis?.type === 'MARKDOWN' ? 'red' : ''}`}>
            {worldAnalysis ? `${worldAnalysis.diff >= 0 ? '+' : ''}${formatRupiah(worldAnalysis.diff)}` : 'Sinkronisasi...'}
          </div>
        </div>
      </div>

      {/* Rate Boxes: Beli and Jual */}
      <div className="rate-boxes-grid">
        <div className={`rate-box ${flashBuyClass}`}>
          <div className="rate-box-label">
            <span>HARGA BELI</span>
            <span style={{ color: '#10b981' }}>TREASURY.ID</span>
          </div>
          <div className={`rate-box-number ${tickBuyClass}`}>
            {liveBuy ? formatRupiah(liveBuy) : 'Memuat...'}
          </div>
        </div>

        <div className={`rate-box ${flashSellClass}`}>
          <div className="rate-box-label">
            <span>HARGA JUAL</span>
            <span style={{ color: '#3b82f6' }}>TREASURY.ID</span>
          </div>
          <div className={`rate-box-number ${tickSellClass}`}>
            {liveSell ? formatRupiah(liveSell) : 'Memuat...'}
          </div>
        </div>
      </div>

      {/* AI Sentiment Analysis Box */}
      <div className="ai-analysis-bar">
        <div className="ai-analysis-header">
          <Sparkles size={13} />
          <span>ANALISIS PASAR CUAN COPILOT</span>
        </div>
        <p className="ai-analysis-text">{getAiSentiment()}</p>
      </div>

      {/* Footer Info */}
      <div className="antigrvty-footer">
        <span className={`market-badge ${marketStatus === 'PASAR LIVE' ? 'live' : 'closed'}`}>
          ● {marketStatus}
        </span>
        <span>Diperbarui: {updatedAt || 'Realtime API'}</span>
      </div>
    </div>
  );
}
