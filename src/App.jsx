import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import AntigrvtyLiveCard from './components/AntigrvtyLiveCard';
import TreasuryTable from './components/TreasuryTable';
import TreasuryChart from './components/TreasuryChart';
import TradingViewCard from './components/TradingViewCard';
import UsdCard from './components/UsdCard';
import SimulatorsCard from './components/SimulatorsCard';
import PromoHistoryCard from './components/PromoHistoryCard';
import AiCopilotCard from './components/AiCopilotCard';
import EconomicCalendarCard from './components/EconomicCalendarCard';
import FloatingXauModal from './components/FloatingXauModal';
import Footer from './components/Footer';

import {
  fetchTreasuryLiveRate,
  fetchGoldHistory,
  fetchUsdHistory,
  fetchGlobalRates,
  fetchAdminSettings,
  fetchPromoHistory,
  speakId,
  playBeep,
  initAudioUnlock,
  isMarketOpen
} from './services/api';

export default function App() {
  // Live Treasury rates
  const [liveBuy, setLiveBuy] = useState(0);
  const [liveSell, setLiveSell] = useState(0);
  const [prevBuy, setPrevBuy] = useState(0);
  const [prevSell, setPrevSell] = useState(0);
  const [liveDelta, setLiveDelta] = useState(0);
  const [updatedAt, setUpdatedAt] = useState('');
  const [isOnline, setIsOnline] = useState(false);

  // Sound alert state - default AUTO ON saat dibuka
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const sessionVal = sessionStorage.getItem('cuanmania_sound');
      if (sessionVal !== null) {
        return sessionVal === '1';
      }
      // Default selalu aktif (auto ON) saat pertama kali dibuka
      return true;
    } catch {
      return true;
    }
  });

  const soundEnabledRef = useRef(soundEnabled);
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  // Audio unlock listener untuk kebijakan autoplay browser
  useEffect(() => {
    initAudioUnlock();
  }, []);

  // Data collections
  const [historyData, setHistoryData] = useState([]);
  const [usdHistory, setUsdHistory] = useState([]);
  const [currentUsd, setCurrentUsd] = useState(0);
  const [usdChange, setUsdChange] = useState(0);
  const [globalRates, setGlobalRates] = useState(null);
  const [adminSettings, setAdminSettings] = useState(null);
  const [promoHistory, setPromoHistory] = useState([]);

  const isFirstLoad = useRef(true);
  const liveBuyRef = useRef(0);
  const liveSellRef = useRef(0);
  const isFetchingTreasuryRef = useRef(false);
  const isFetchingSecondaryRef = useRef(false);

  const toggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    try {
      sessionStorage.setItem('cuanmania_sound', nextVal ? '1' : '0');
      localStorage.setItem('cuanmania_sound', nextVal ? '1' : '0');
    } catch {}
    if (nextVal) {
      speakId('Suara aktif');
      playBeep(880, 0.15);
    }
  };

  // 1. Fetch live Treasury buy & sell price super cepat (independen tanpa memblokir request lain)
  const updateLivePrice = async () => {
    if (isFetchingTreasuryRef.current) return;
    isFetchingTreasuryRef.current = true;
    try {
      const treasuryRate = await fetchTreasuryLiveRate();
      if (treasuryRate && treasuryRate.buyingRate) {
        setIsOnline(true);
        setUpdatedAt(treasuryRate.updatedAt);

        const newBuy = treasuryRate.buyingRate;
        const newSell = treasuryRate.sellingRate;
        const prevB = liveBuyRef.current;
        const prevS = liveSellRef.current;

        // Cek perubahan harga beli
        if (prevB > 0 && newBuy !== prevB) {
          const delta = newBuy - prevB;
          setPrevBuy(prevB);
          setLiveDelta(delta);

          // Peringatan suara jika pasar live dan suara aktif
          if (soundEnabledRef.current && isMarketOpen() === 'PASAR LIVE') {
            if (delta > 0) {
              speakId('Harga naik');
              playBeep(980, 0.2);
            } else if (delta < 0) {
              speakId('Harga turun');
              playBeep(440, 0.2);
            }
          }

          // Sinkronkan riwayat tabel & grafik agar data terbaru langsung masuk
          refreshSecondaryData();
        }

        if (prevS > 0 && newSell !== prevS) {
          setPrevSell(prevS);
        }

        liveBuyRef.current = newBuy;
        liveSellRef.current = newSell;
        setLiveBuy(newBuy);
        setLiveSell(newSell);
      }
    } catch (err) {
      console.warn('Gagal sinkronisasi harga live Treasury:', err);
    } finally {
      isFetchingTreasuryRef.current = false;
    }
  };

  // 2. Refresh data sekunder (riwayat emas, USD, pasar global, admin settings, promo)
  const refreshSecondaryData = async () => {
    if (isFetchingSecondaryRef.current) return;
    isFetchingSecondaryRef.current = true;
    try {
      const [goldRes, usdRes, gRatesRes, admRes, promoRes] = await Promise.allSettled([
        fetchGoldHistory(50),
        fetchUsdHistory(),
        fetchGlobalRates(),
        fetchAdminSettings(),
        fetchPromoHistory()
      ]);

      if (goldRes.status === 'fulfilled' && goldRes.value && goldRes.value.length > 0) {
        setHistoryData(goldRes.value);
        if (isFirstLoad.current && !liveBuyRef.current) {
          const top = goldRes.value[0];
          if (top) {
            setLiveBuy(top.buy);
            setLiveSell(top.sell);
            liveBuyRef.current = top.buy;
            liveSellRef.current = top.sell;
            setUpdatedAt(top.datetime || 'Database Live');
            setIsOnline(true);
          }
        }
      }

      if (usdRes.status === 'fulfilled' && usdRes.value && usdRes.value.length > 0) {
        setUsdHistory(usdRes.value);
        const latest = usdRes.value[0];
        const prev = usdRes.value[1] || latest;
        const curRate = parseFloat(latest.usd_idr);
        const prevRate = parseFloat(prev.usd_idr);
        if (!isNaN(curRate)) {
          setCurrentUsd(curRate);
          if (!isNaN(prevRate) && prevRate > 0) {
            const pct = ((curRate - prevRate) / prevRate) * 100;
            setUsdChange(pct);
          }
        }
      }

      if (gRatesRes.status === 'fulfilled' && gRatesRes.value) {
        setGlobalRates(gRatesRes.value);
      }

      if (admRes.status === 'fulfilled' && admRes.value) {
        setAdminSettings(admRes.value);
      }

      if (promoRes.status === 'fulfilled' && promoRes.value && promoRes.value.length > 0) {
        setPromoHistory(promoRes.value);
      }

      isFirstLoad.current = false;
    } catch (err) {
      console.warn('Gagal memuat data sekunder:', err);
    } finally {
      isFetchingSecondaryRef.current = false;
    }
  };

  // Muat pertama kali
  useEffect(() => {
    let ignore = false;
    (async () => {
      await updateLivePrice();
      if (!ignore) {
        await refreshSecondaryData();
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  // Polling detak 5 detik untuk respon harga cepat
  useEffect(() => {
    const heartbeat = setInterval(() => {
      updateLivePrice();
    }, 5000);

    return () => clearInterval(heartbeat);
  }, []);

  // Sinkronisasi presisi setiap pergantian menit (Treasury merilis update rate di awal menit)
  useEffect(() => {
    let isMounted = true;
    let minuteTimer = null;
    let retryTimer1 = null;
    let retryTimer2 = null;

    const scheduleMinuteTurnSync = () => {
      if (!isMounted) return;

      const now = new Date();
      const seconds = now.getSeconds();
      const ms = now.getMilliseconds();

      // Treasury.id server merilis harga sekitar detik 01 setiap menitnya.
      // Kita targetkan tepat di detik 01.100 agar langsung dapat harga beli/jual terbaru tanpa terlambat.
      let msToNextMinute = (60 - seconds) * 1000 - ms + 1100;
      if (msToNextMinute < 300) {
        msToNextMinute += 60000;
      }

      minuteTimer = setTimeout(async () => {
        if (!isMounted) return;
        await updateLivePrice();

        // Follow-up retry pada detik +2.5s dan +5s jika server ada jeda cache origin
        retryTimer1 = setTimeout(() => {
          if (isMounted) updateLivePrice();
        }, 2500);

        retryTimer2 = setTimeout(() => {
          if (isMounted) updateLivePrice();
        }, 5000);

        scheduleMinuteTurnSync();
      }, msToNextMinute);
    };

    scheduleMinuteTurnSync();

    return () => {
      isMounted = false;
      if (minuteTimer) clearTimeout(minuteTimer);
      if (retryTimer1) clearTimeout(retryTimer1);
      if (retryTimer2) clearTimeout(retryTimer2);
    };
  }, []);

  // Polling data sekunder setiap 25 detik di latar belakang
  useEffect(() => {
    const secondaryInterval = setInterval(() => {
      refreshSecondaryData();
    }, 25000);

    return () => clearInterval(secondaryInterval);
  }, []);

  // Segera update jika user berpindah tab dan kembali aktif
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        updateLivePrice();
        refreshSecondaryData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const promoActive =
    adminSettings?.promo_status === true || adminSettings?.promo_status === 'true';

  return (
    <div className="app-wrapper">
      {/* Background ambient orbs */}
      <div className="mesh-bg">
        <div className="mesh-orb-1" />
        <div className="mesh-orb-2" />
        <div className="mesh-orb-3" />
      </div>

      {/* Header with Navigation and Digital WIB Clock */}
      <Header
        marqueeText={adminSettings?.marquee_text}
        isOnline={isOnline}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
      />

      {/* Main Two-Column Dashboard Layout */}
      <div className="dashboard-grid">
        {/* Left Column: Treasury Core */}
        <div className="column-main">
          {/* Realtime Antigravity Treasury Card */}
          <AntigrvtyLiveCard
            liveBuy={liveBuy}
            liveSell={liveSell}
            prevBuy={prevBuy}
            prevSell={prevSell}
            updatedAt={updatedAt}
            usdRate={currentUsd}
            usdChange={usdChange}
            globalRates={globalRates}
            promoActive={promoActive}
            soundEnabled={soundEnabled}
            onToggleSound={toggleSound}
          />

          {/* Treasury Table with Calculation Estimates */}
          <TreasuryTable
            historyData={historyData}
            liveBuy={liveBuy}
            liveSell={liveSell}
            liveDelta={liveDelta}
          />

          {/* Interactive Chart.js Treasury Chart */}
          <TreasuryChart
            historyData={historyData}
            adminSettings={adminSettings}
          />

          {/* Promo History Card */}
          <PromoHistoryCard promoHistory={promoHistory} />
        </div>

        {/* Right Column: TradingView, USD to IDR, Simulators, AI, Calendar */}
        <div className="column-aside">
          {/* TradingView Chart Embed (XAUUSD, USDIDR, XAUIDR) */}
          <TradingViewCard />

          {/* USD to IDR by Google Finance */}
          <UsdCard
            usdHistory={usdHistory}
            currentUsd={currentUsd}
            usdChange={usdChange}
          />

          {/* Calculators & Simulation */}
          <SimulatorsCard
            liveBuy={liveBuy}
            liveSell={liveSell}
          />

          {/* AI Cuan Copilot */}
          <AiCopilotCard
            liveBuy={liveBuy}
            liveSell={liveSell}
            usdRate={currentUsd}
            globalRates={globalRates}
          />

          {/* ForexFactory News & Investing.com Economic Calendar */}
          <EconomicCalendarCard />
        </div>
      </div>

      {/* Dashboard Footer with Treasury Monitor Branding */}
      <Footer />

      {/* Floating Action Button & Quick View Modal for XAUUSD */}
      <FloatingXauModal />
    </div>
  );
}
