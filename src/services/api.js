// Service for Treasury, Global Rates, and Firebase Realtime Database APIs

const TREASURY_API_URL = 'https://api.treasury.id/api/v1/antigrvty/gold/rate';
const TREASURY_PROXY_URL = '/api-treasury/gold/rate';
const FIREBASE_BASE_URL = 'https://monitor-treasury-default-rtdb.firebaseio.com';
const AWESOME_API_URL = 'https://economia.awesomeapi.com.br/json/last/XAU-USD,USD-IDR';

export const PROMO_PACKAGES = [
  { m: 10000000, label: '10 Juta', b: 9669000 },
  { m: 30000000, label: '30 Juta', b: 29005500 },
  { m: 40000000, label: '40 Juta', b: 38674000 },
  { m: 50000000, label: '50 Juta', b: 48341000 },
  { m: 60000000, label: '60 Juta', b: 58006500 },
];

export const formatRupiah = (num) => {
  if (num === null || num === undefined || isNaN(num)) return 'Rp 0';
  return 'Rp ' + Math.round(Number(num)).toLocaleString('id-ID');
};

export const formatNumber = (num, decimals = 0) => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return Number(num).toLocaleString('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const parseRupiahInput = (str) => {
  if (!str) return 0;
  if (typeof str === 'number') return str;
  const cleaned = str.toString().replace(/\./g, '').replace(/[^0-9]/g, '');
  return cleaned ? parseFloat(cleaned) : 0;
};

// Check if market is currently live
export const isMarketOpen = () => {
  const d = new Date();
  const utcHours = d.getUTCHours();
  const wibHours = (utcHours + 7) % 24;
  const wibDay = new Date(d.getTime() + 7 * 3600 * 1000).getUTCDay(); // 0 is Sun, 6 is Sat

  // Closed from Saturday 05:00 WIB to Monday 05:00 WIB
  if (wibDay === 6 && wibHours >= 5) return 'PASAR TUTUP';
  if (wibDay === 0) return 'PASAR TUTUP';
  if (wibDay === 1 && wibHours < 5) return 'PASAR TUTUP';
  return 'PASAR LIVE';
};

// Fetch live Treasury.id gold rate
export const fetchTreasuryLiveRate = async () => {
  try {
    const res = await fetch(TREASURY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.data) {
        return {
          buyingRate: data.data.buying_rate,
          sellingRate: data.data.selling_rate,
          updatedAt: data.data.updated_at || new Date().toLocaleTimeString('id-ID'),
          raw: data.data
        };
      }
    }
  } catch (err) {
    console.warn('Direct Treasury API fetch failed, trying proxy...', err);
  }

  // Fallback to Vite proxy
  try {
    const res = await fetch(TREASURY_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.data) {
        return {
          buyingRate: data.data.buying_rate,
          sellingRate: data.data.selling_rate,
          updatedAt: data.data.updated_at || new Date().toLocaleTimeString('id-ID'),
          raw: data.data
        };
      }
    }
  } catch (proxyErr) {
    console.error('All Treasury API fetch attempts failed:', proxyErr);
  }
  return null;
};

// Fetch Gold History from Firebase
export const fetchGoldHistory = async (limit = 50) => {
  try {
    const res = await fetch(`${FIREBASE_BASE_URL}/gold_history.json?orderBy="timestamp"&limitToLast=${limit}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        return Object.values(data)
          .filter(x => x && x.timestamp)
          .sort((a, b) => b.timestamp - a.timestamp);
      }
    }
  } catch (e) {
    console.warn('Firebase gold history with orderBy failed, fetching all...', e);
  }

  try {
    const res = await fetch(`${FIREBASE_BASE_URL}/gold_history.json`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        return Object.values(data)
          .filter(x => x && x.timestamp)
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, limit);
      }
    }
  } catch (e) {
    console.error('Failed to fetch gold history:', e);
  }
  return [];
};

// Fetch USD History from Firebase
export const fetchUsdHistory = async () => {
  try {
    const res = await fetch(`${FIREBASE_BASE_URL}/usd_history.json?t=${Date.now()}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        return Object.values(data)
          .filter(item => item && item.usd_idr != null)
          .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      }
    }
  } catch (e) {
    console.error('Failed to fetch USD history:', e);
  }
  return [];
};

// Fetch Global Market Rates (XAU/USD and USD/IDR)
export const fetchGlobalRates = async () => {
  try {
    const res = await fetch(AWESOME_API_URL, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return {
        xauUsd: data?.XAUUSD ? parseFloat(data.XAUUSD.bid || data.XAUUSD.ask || 0) : 0,
        xauUsdHigh: data?.XAUUSD ? parseFloat(data.XAUUSD.high || 0) : 0,
        xauUsdLow: data?.XAUUSD ? parseFloat(data.XAUUSD.low || 0) : 0,
        xauUsdChange: data?.XAUUSD ? parseFloat(data.XAUUSD.pctChange || 0) : 0,
        usdIdr: data?.USDIDR ? parseFloat(data.USDIDR.bid || data.USDIDR.ask || 0) : 0,
        usdIdrHigh: data?.USDIDR ? parseFloat(data.USDIDR.high || 0) : 0,
        usdIdrLow: data?.USDIDR ? parseFloat(data.USDIDR.low || 0) : 0,
        usdIdrChange: data?.USDIDR ? parseFloat(data.USDIDR.pctChange || 0) : 0,
      };
    }
  } catch (e) {
    console.error('Failed to fetch global rates:', e);
  }
  return null;
};

// Fetch Admin Settings & Promo from Firebase
export const fetchAdminSettings = async () => {
  try {
    const res = await fetch(`${FIREBASE_BASE_URL}/admin_settings.json?t=${Date.now()}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.error('Failed to fetch admin settings:', e);
  }
  return null;
};

// Fetch Promo History
export const fetchPromoHistory = async () => {
  try {
    const res = await fetch(`${FIREBASE_BASE_URL}/promo_price_history.json?orderBy="$key"&limitToLast=15`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        return Object.values(data).reverse();
      }
    }
  } catch (e) {
    console.error('Failed to fetch promo history:', e);
  }
  return [];
};

// Fetch Chart Data
export const fetchChartData = async (timeframe) => {
  try {
    const res = await fetch(`${FIREBASE_BASE_URL}/chart_data/${timeframe}.json?t=${Date.now()}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (e) {
    console.warn(`Chart data for ${timeframe} not found in rtdb, will generate from history:`, e);
  }
  return null;
};

// Audio & Web Speech synthesis helper
let audioCtx = null;
export const playBeep = (freq = 880, duration = 0.15, type = 'sine') => {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    if (audioCtx) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    }
  } catch (e) {
    console.warn('Audio play failed:', e);
  }
};

export const speakId = (text) => {
  if (!('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'id-ID';
    u.rate = 1.05;
    u.volume = 0.85;
    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find(v => /^id[-_]ID$/i.test(v.lang) || /^id/i.test(v.lang));
    if (idVoice) u.voice = idVoice;
    window.speechSynthesis.speak(u);
  } catch (e) {
    console.warn('Speech synthesis failed:', e);
  }
};
