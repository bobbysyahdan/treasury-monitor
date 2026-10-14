import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Radio, Sparkles, TrendingUp, DollarSign, Calculator, Calendar } from 'lucide-react';

export default function Header({ marqueeText, isOnline, soundEnabled, onToggleSound }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate WIB greeting
  const getGreeting = () => {
    const utcHours = currentTime.getUTCHours();
    const wibHour = (utcHours + 7) % 24;

    if (wibHour >= 4 && wibHour < 11) {
      return {
        text: 'Selamat Pagi',
        emoji: '🌅',
        color: '#fbbf24',
        accentGlow: 'rgba(251, 191, 36, 0.22)',
        badgeBg: 'rgba(245, 158, 11, 0.12)',
        badgeBorder: 'rgba(251, 191, 36, 0.3)',
        gradient: 'linear-gradient(135deg, #fef08a 0%, #fbbf24 60%, #f59e0b 100%)',
        subtext: 'Awali pagi dengan pantauan harga emas terkini'
      };
    } else if (wibHour >= 11 && wibHour < 15) {
      return {
        text: 'Selamat Siang',
        emoji: '☀️',
        color: '#38bdf8',
        accentGlow: 'rgba(56, 189, 248, 0.22)',
        badgeBg: 'rgba(56, 189, 248, 0.12)',
        badgeBorder: 'rgba(56, 189, 248, 0.3)',
        gradient: 'linear-gradient(135deg, #bae6fd 0%, #38bdf8 60%, #0284c7 100%)',
        subtext: 'Pantau peluang transaksi di sesi tengah hari'
      };
    } else if (wibHour >= 15 && wibHour < 18) {
      return {
        text: 'Selamat Sore',
        emoji: '🌇',
        color: '#fb923c',
        accentGlow: 'rgba(251, 146, 60, 0.22)',
        badgeBg: 'rgba(251, 146, 60, 0.12)',
        badgeBorder: 'rgba(251, 146, 60, 0.3)',
        gradient: 'linear-gradient(135deg, #fed7aa 0%, #fb923c 60%, #ea580c 100%)',
        subtext: 'Evaluasi spread dan pergerakan penutupan sesi'
      };
    } else {
      return {
        text: 'Selamat Malam',
        emoji: '🌙',
        color: '#a78bfa',
        accentGlow: 'rgba(167, 139, 250, 0.22)',
        badgeBg: 'rgba(139, 92, 246, 0.12)',
        badgeBorder: 'rgba(167, 139, 250, 0.3)',
        gradient: 'linear-gradient(135deg, #ddd6fe 0%, #a78bfa 60%, #7c3aed 100%)',
        subtext: 'Pasar global tetap aktif, pantau tren XAUUSD live'
      };
    }
  };

  const greeting = getGreeting();

  const timeString = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const dateString = currentTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="header-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Top Navbar */}
      <div className="top-navbar">
        <div className="brand-section" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img
            src="/logo.png"
            alt="Treasury Monitor"
            className="brand-logo-img"
          />
        </div>

        <nav className="nav-links">
          <button className="nav-item active" onClick={() => scrollTo('section-treasury')}>
            <TrendingUp size={15} /> Treasury Live
          </button>
          <button className="nav-item" onClick={() => scrollTo('section-tradingview')}>
            <Radio size={15} /> TradingView
          </button>
          <button className="nav-item" onClick={() => scrollTo('section-usd')}>
            <DollarSign size={15} /> USD to IDR
          </button>
          <button className="nav-item" onClick={() => scrollTo('section-calculator')}>
            <Calculator size={15} /> Simulasi
          </button>
          <button className="nav-item" onClick={() => scrollTo('section-calendar')}>
            <Calendar size={15} /> Kalender
          </button>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className={`icon-button ${soundEnabled ? 'active' : ''}`}
            onClick={onToggleSound}
            title={soundEnabled ? 'Matikan suara notifikasi' : 'Aktifkan suara notifikasi'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      {/* Greeting and Digital Clock Bar */}
      <div
        className="greeting-bar"
      >
        <div className="greeting-info">
          <div className="greeting-text-wrap">
            <h2 className="greeting-title">
              <span
                className="greeting-highlight"
                style={{
                  backgroundImage: greeting.gradient
                }}
              >
                {greeting.text}
              </span>
              <span className="greeting-sep">,</span>
              <span className="greeting-target">Sobat Treasury</span>
            </h2>
          </div>
        </div>

        <div className="time-status">
          <div className="time-date-badge">
            <Calendar size={13} className="date-icon" />
            <span>{dateString}</span>
          </div>
          <div className="digital-clock-pill">
            <span className="digital-clock">{timeString}</span>
            <span className="clock-zone">WIB</span>
          </div>
          <div className={`status-pill ${isOnline ? 'online' : 'syncing'}`}>
            <span className="pulse-dot">●</span> {isOnline ? 'LIVE SYNC' : 'SYNCING'}
          </div>
        </div>
      </div>
    </header>
  );
}
