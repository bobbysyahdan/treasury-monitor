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

  // Sound alert state
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      return localStorage.getItem('cuanmania_sound') === '1';
    } catch {
      return false;
    }
  });

  // Data collections
  const [historyData, setHistoryData] = useState([]);
  const [usdHistory, setUsdHistory] = useState([]);
  const [currentUsd, setCurrentUsd] = useState(0);
  const [usdChange, setUsdChange] = useState(0);
  const [globalRates, setGlobalRates] = useState(null);
  const [adminSettings, setAdminSettings] = useState(null);
  const [promoHistory, setPromoHistory] = useState([]);

  const isFirstLoad = useRef(true);

  const toggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    try {
      localStorage.setItem('cuanmania_sound', nextVal ? '1' : '0');
    } catch {}
    if (nextVal) {
      speakId('Suara aktif');
      playBeep(880, 0.15);
    }
  };

  // Primary data fetcher function
  const refreshAllData = async () => {
    try {
      // 1. Fetch live Treasury.id rate
      const treasuryRate = await fetchTreasuryLiveRate();
      if (treasuryRate) {
        setIsOnline(true);
        setUpdatedAt(treasuryRate.updatedAt);

        setLiveBuy((currentLiveBuy) => {
          if (currentLiveBuy > 0 && treasuryRate.buyingRate !== currentLiveBuy) {
            setPrevBuy(currentLiveBuy);
            const delta = treasuryRate.buyingRate - currentLiveBuy;
            setLiveDelta(delta);

            // Trigger audio alerts if sound is enabled
            if (soundEnabled && isMarketOpen() === 'PASAR LIVE') {
              if (delta > 0) {
                speakId('Harga naik');
                playBeep(980, 0.2);
              } else if (delta < 0) {
                speakId('Harga turun');
                playBeep(440, 0.2);
              }
            }
          }
          return treasuryRate.buyingRate;
        });

        setLiveSell((currentLiveSell) => {
          if (currentLiveSell > 0 && treasuryRate.sellingRate !== currentLiveSell) {
            setPrevSell(currentLiveSell);
          }
          return treasuryRate.sellingRate;
        });
      }

      // 2. Fetch Gold History from Firebase
      const goldHist = await fetchGoldHistory(50);
      if (goldHist && goldHist.length > 0) {
        setHistoryData(goldHist);
        // Fallback for live price on first load if treasury API was slow
        if (isFirstLoad.current && (!treasuryRate || !treasuryRate.buyingRate)) {
          const top = goldHist[0];
          if (top) {
            setLiveBuy(top.buy);
            setLiveSell(top.sell);
            setUpdatedAt(top.datetime || 'Database Live');
            setIsOnline(true);
          }
        }
      }

      // 3. Fetch USD History from Firebase (Google Finance feed)
      const usdHist = await fetchUsdHistory();
      if (usdHist && usdHist.length > 0) {
        setUsdHistory(usdHist);
        const latest = usdHist[0];
        const prev = usdHist[1] || latest;
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

      // 4. Fetch Global Rates (AwesomeAPI)
      const gRates = await fetchGlobalRates();
      if (gRates) {
        setGlobalRates(gRates);
      }

      // 5. Fetch Admin Settings
      const adm = await fetchAdminSettings();
      if (adm) {
        setAdminSettings(adm);
      }

      // 6. Fetch Promo History
      const pHist = await fetchPromoHistory();
      if (pHist && pHist.length > 0) {
        setPromoHistory(pHist);
      }

      isFirstLoad.current = false;
    } catch (err) {
      console.error('Error during data refresh:', err);
    }
  };

  // Initial load and periodic interval
  useEffect(() => {
    refreshAllData();

    // Poll every 30 seconds
    const interval = setInterval(() => {
      refreshAllData();
    }, 30000);

    return () => clearInterval(interval);
  }, [soundEnabled]);

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
