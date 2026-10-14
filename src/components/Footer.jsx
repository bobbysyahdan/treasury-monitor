import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Calculator,
  Calendar,
  Radio,
  Sparkles,
  ArrowUp,
  ShieldCheck,
  Activity,
  Clock,
  ExternalLink,
  Coins,
  Cpu
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="dashboard-footer" id="section-footer">
      {/* Ambient gradient line on top */}
      <div className="footer-glow-bar" />

      <div className="footer-main-container">
        {/* Column 1: Brand & Product Info */}
        <div className="footer-col footer-col-brand">
          <div className="footer-brand-header" onClick={scrollToTop} role="button" tabIndex={0}>
            <div className="footer-logo-row">
              <img
                src="/logo.png"
                alt="Treasury Monitor"
                className="footer-brand-logo"
              />
              <span className="footer-tag-badge">PRO LIVE</span>
            </div>
          </div>

          <p className="footer-brand-desc">
            Platform intelijen pasar realtime untuk memantau pergerakan harga emas batangan,
            kurs valuta asing USD/IDR, charting teknikal XAU/USD, serta simulasi keuntungan investasi presisi tinggi.
          </p>

          <div className="footer-status-pill">
            <span className="footer-pulse-dot" />
            <span className="footer-status-text">Semua Feed Data Live Terhubung</span>
          </div>
        </div>

        {/* Column 2: Quick Navigation */}
        <div className="footer-col">
          <h4 className="footer-col-title">
            <Activity size={16} className="col-icon" /> Navigasi Modul
          </h4>
          <ul className="footer-link-list">
            <li>
              <button
                type="button"
                className="footer-link-btn"
                onClick={() => scrollToSection('section-treasury')}
              >
                <TrendingUp size={14} /> Treasury Live Rate
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footer-link-btn"
                onClick={() => scrollToSection('section-tradingview')}
              >
                <Radio size={14} /> Charting TradingView
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footer-link-btn"
                onClick={() => scrollToSection('section-usd')}
              >
                <DollarSign size={14} /> Kurs USD to IDR
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footer-link-btn"
                onClick={() => scrollToSection('section-calculator')}
              >
                <Calculator size={14} /> Kalkulator & Simulasi
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footer-link-btn"
                onClick={() => scrollToSection('section-ai')}
              >
                <Sparkles size={14} /> AI Cuan Copilot
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footer-link-btn"
                onClick={() => scrollToSection('section-calendar')}
              >
                <Calendar size={14} /> Kalender Ekonomi
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: Data Feeds & Integrations */}
        <div className="footer-col">
          <h4 className="footer-col-title">
            <Cpu size={16} className="col-icon" /> Integrasi Feed
          </h4>
          <div className="footer-badges-grid">
            <div className="footer-source-card">
              <span className="source-label">Treasury.id</span>
              <span className="source-desc">Harga Beli & Jual Emas Fisik</span>
            </div>
            <div className="footer-source-card">
              <span className="source-label">Google Finance</span>
              <span className="source-desc">Kurs Realtime USD/IDR & Indeks</span>
            </div>
            <div className="footer-source-card">
              <span className="source-label">TradingView API</span>
              <span className="source-desc">Candlestick Spot XAUUSD</span>
            </div>
            <div className="footer-source-card">
              <span className="source-label">AwesomeAPI</span>
              <span className="source-desc">Valuta Asing & Komoditas Global</span>
            </div>
          </div>
        </div>

        {/* Column 4: Pasar & Disclaimer */}
        <div className="footer-col">
          <h4 className="footer-col-title">
            <Clock size={16} className="col-icon" /> Waktu Pasar & Disclaimer
          </h4>
          <div className="footer-market-info">
            <div className="market-row">
              <span className="market-label">Pasar Emas Fisik:</span>
              <span className="market-value text-emerald">Aktif 24/7 (WIB)</span>
            </div>
            <div className="market-row">
              <span className="market-label">Bursa Global (XAU):</span>
              <span className="market-value text-gold">24/5 Non-stop</span>
            </div>
          </div>

          <div className="footer-disclaimer-box">
            <ShieldCheck size={15} className="disclaimer-icon" />
            <p className="disclaimer-text">
              <strong>Treasury Monitor</strong> menyajikan kompilasi data pasar untuk referensi,
              monitoring, dan edukasi finansial. Seluruh keputusan investasi tetap menjadi tanggung jawab pengguna.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright, Back to Top */}
      <div className="footer-bottom-bar">
        <div className="footer-bottom-left">
          <p className="footer-copyright">
            © {currentYear} <span className="highlight-product">Treasury Monitor</span>. All rights reserved.
          </p>
          <span className="footer-dot-sep">•</span>
          <span className="footer-subtext">Dashboard Pantau Emas & Valas Indonesia</span>
        </div>

        <div className="footer-bottom-right">
          <button
            type="button"
            className="footer-back-to-top"
            onClick={scrollToTop}
            title="Kembali ke atas"
          >
            <span>Kembali ke Atas</span>
            <div className="back-to-top-icon">
              <ArrowUp size={15} />
            </div>
          </button>
        </div>
      </div>
    </footer>
  );
}
