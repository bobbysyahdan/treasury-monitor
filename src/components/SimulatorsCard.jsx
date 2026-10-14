import React, { useState, useEffect } from 'react';
import { Calculator, Lock, ShoppingCart, DollarSign, Trash2, BookmarkCheck } from 'lucide-react';
import { PROMO_PACKAGES, formatRupiah, parseRupiahInput } from '../services/api';

export default function SimulatorsCard({ liveBuy, liveSell }) {
  const [activeTab, setActiveTab] = useState('promo');

  // Form states
  const [selectedPromo, setSelectedPromo] = useState('');
  const [promoBuyPrice, setPromoBuyPrice] = useState('');

  const [jualGram, setJualGram] = useState('');
  const [jualRp, setJualRp] = useState('');

  const [beliRp, setBeliRp] = useState('');
  const [beliGram, setBeliGram] = useState('');

  const [entryLabel, setEntryLabel] = useState('');
  const [savedEntries, setSavedEntries] = useState([]);

  // Load saved entries from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cuanmania_sim_entries');
      if (stored) {
        setSavedEntries(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveToLocalStorage = (list) => {
    setSavedEntries(list);
    try {
      localStorage.setItem('cuanmania_sim_entries', JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
  };

  // Conversions for Jual
  const handleJualGramChange = (val) => {
    setJualGram(val);
    const g = parseFloat(val);
    if (!isNaN(g) && liveSell > 0) {
      setJualRp(Math.round(g * liveSell).toLocaleString('id-ID'));
    } else {
      setJualRp('');
    }
  };

  const handleJualRpChange = (val) => {
    const raw = parseRupiahInput(val);
    setJualRp(raw ? raw.toLocaleString('id-ID') : '');
    if (raw > 0 && liveSell > 0) {
      setJualGram((raw / liveSell).toFixed(4));
    } else {
      setJualGram('');
    }
  };

  // Conversions for Beli
  const handleBeliRpChange = (val) => {
    const raw = parseRupiahInput(val);
    setBeliRp(raw ? raw.toLocaleString('id-ID') : '');
    if (raw > 0 && liveBuy > 0) {
      setBeliGram((raw / liveBuy).toFixed(4));
    } else {
      setBeliGram('');
    }
  };

  const handleBeliGramChange = (val) => {
    setBeliGram(val);
    const g = parseFloat(val);
    if (!isNaN(g) && liveBuy > 0) {
      setBeliRp(Math.round(g * liveBuy).toLocaleString('id-ID'));
    } else {
      setBeliRp('');
    }
  };

  // Promo calculations
  const promoPkg = PROMO_PACKAGES.find(p => p.m === Number(selectedPromo));
  const rawPromoPrice = parseRupiahInput(promoBuyPrice);
  const promoGram = promoPkg && rawPromoPrice > 0 ? promoPkg.m / rawPromoPrice : 0;
  const promoCurrentValue = promoGram > 0 && liveSell > 0 ? promoGram * liveSell : 0;
  const promoProfit = promoCurrentValue > 0 && promoPkg ? promoCurrentValue - promoPkg.b : 0;

  // Handle Save Entry
  const handleSaveEntry = () => {
    let newEntry = null;

    if (activeTab === 'promo' && promoPkg && rawPromoPrice > 0) {
      newEntry = {
        id: Date.now(),
        type: 'PROMO',
        title: entryLabel.trim() || `Promo ${promoPkg.label}`,
        modal: promoPkg.b,
        gram: promoGram,
        buyPrice: rawPromoPrice,
        timestamp: Date.now()
      };
      setSelectedPromo('');
      setPromoBuyPrice('');
    } else if (activeTab === 'jual' && parseFloat(jualGram) > 0) {
      const g = parseFloat(jualGram);
      newEntry = {
        id: Date.now(),
        type: 'JUAL',
        title: entryLabel.trim() || `Catatan Jual ${g}g`,
        modal: parseRupiahInput(jualRp),
        gram: g,
        buyPrice: liveSell,
        timestamp: Date.now()
      };
      setJualGram('');
      setJualRp('');
    } else if (activeTab === 'beli' && parseFloat(beliGram) > 0) {
      const g = parseFloat(beliGram);
      newEntry = {
        id: Date.now(),
        type: 'BELI',
        title: entryLabel.trim() || `Catatan Beli ${g}g`,
        modal: parseRupiahInput(beliRp),
        gram: g,
        buyPrice: liveBuy,
        timestamp: Date.now()
      };
      setBeliGram('');
      setBeliRp('');
    }

    if (newEntry) {
      setEntryLabel('');
      saveToLocalStorage([newEntry, ...savedEntries]);
    }
  };

  const handleDeleteEntry = (id) => {
    saveToLocalStorage(savedEntries.filter(e => e.id !== id));
  };

  return (
    <div className="calc-card" id="section-calculator">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <Calculator size={18} color="#38bdf8" />
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>
          Simulasi & Kalkulator Investasi
        </h3>
      </div>

      {/* Tabs */}
      <div className="calc-tabs">
        <button
          className={`calc-tab ${activeTab === 'promo' ? 'active' : ''}`}
          onClick={() => setActiveTab('promo')}
        >
          <Lock size={13} style={{ display: 'inline', marginRight: '4px' }} /> Kunci Promo
        </button>
        <button
          className={`calc-tab ${activeTab === 'beli' ? 'active' : ''}`}
          onClick={() => setActiveTab('beli')}
        >
          <ShoppingCart size={13} style={{ display: 'inline', marginRight: '4px' }} /> Simulasi Beli
        </button>
        <button
          className={`calc-tab ${activeTab === 'jual' ? 'active' : ''}`}
          onClick={() => setActiveTab('jual')}
        >
          <DollarSign size={13} style={{ display: 'inline', marginRight: '4px' }} /> Simulasi Jual
        </button>
      </div>

      {/* Calculator Body */}
      <div className="calc-body">
        {activeTab === 'promo' && (
          <>
            <div className="input-group">
              <label className="input-label">Pilih Paket Promo</label>
              <select
                className="calc-input"
                value={selectedPromo}
                onChange={(e) => setSelectedPromo(e.target.value)}
              >
                <option value="">-- Pilih Paket Promo --</option>
                {PROMO_PACKAGES.map((p) => (
                  <option key={p.m} value={p.m}>
                    Paket {p.label} (Modal Bayar: {formatRupiah(p.b)})
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Harga Beli Emas Saat Promo (Rp/gram)</label>
              <input
                type="text"
                className="calc-input"
                placeholder="misal: 2.450.000"
                value={promoBuyPrice}
                onChange={(e) => {
                  const raw = parseRupiahInput(e.target.value);
                  setPromoBuyPrice(raw ? raw.toLocaleString('id-ID') : '');
                }}
              />
            </div>

            {promoPkg && rawPromoPrice > 0 && (
              <div className="calc-result-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#94a3b8' }}>Gramasi Didapat:</span>
                  <span style={{ fontWeight: 800, color: '#38bdf8' }}>{promoGram.toFixed(4)} gram</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#94a3b8' }}>Modal Dibayar:</span>
                  <span style={{ fontWeight: 800 }}>{formatRupiah(promoPkg.b)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#94a3b8' }}>Nilai Jual Sekarang:</span>
                  <span style={{ fontWeight: 800 }}>{formatRupiah(promoCurrentValue)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ color: '#94a3b8' }}>Potensi Untung/Rugi:</span>
                  <span style={{ fontWeight: 800, color: promoProfit >= 0 ? '#34d399' : '#f87171' }}>
                    {promoProfit >= 0 ? '+' : ''}{formatRupiah(promoProfit)}
                  </span>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'beli' && (
          <>
            <div className="input-group">
              <label className="input-label">Punya Rupiah (Rp)</label>
              <input
                type="text"
                className="calc-input"
                placeholder="misal: 10.000.000"
                value={beliRp}
                onChange={(e) => handleBeliRpChange(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Dapat Emas (Gram)</label>
              <input
                type="number"
                step="0.001"
                className="calc-input"
                placeholder="0.0000"
                value={beliGram}
                onChange={(e) => handleBeliGramChange(e.target.value)}
              />
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Dihitung berdasarkan Harga Beli Treasury saat ini ({formatRupiah(liveBuy)}/g).
            </div>
          </>
        )}

        {activeTab === 'jual' && (
          <>
            <div className="input-group">
              <label className="input-label">Punya Emas (Gram)</label>
              <input
                type="number"
                step="0.001"
                className="calc-input"
                placeholder="misal: 5.0"
                value={jualGram}
                onChange={(e) => handleJualGramChange(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Terima Rupiah (Rp)</label>
              <input
                type="text"
                className="calc-input"
                placeholder="0"
                value={jualRp}
                onChange={(e) => handleJualRpChange(e.target.value)}
              />
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Dihitung berdasarkan Harga Jual Treasury saat ini ({formatRupiah(liveSell)}/g).
            </div>
          </>
        )}

        {/* Save Entry Group */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
          <input
            type="text"
            className="calc-input"
            style={{ flex: 1 }}
            placeholder="Beri label portofolio (opsional)..."
            value={entryLabel}
            onChange={(e) => setEntryLabel(e.target.value)}
          />
          <button
            className="pagi-btn active"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 14px' }}
            onClick={handleSaveEntry}
          >
            <BookmarkCheck size={14} /> Simpan
          </button>
        </div>
      </div>

      {/* Saved Entries List */}
      {savedEntries.length > 0 && (
        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--card-border)' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fbbf24', marginBottom: '8px' }}>
            Portofolio Tersimpan ({savedEntries.length} entri):
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
            {savedEntries.map((item) => {
              const currentValue = liveSell > 0 ? item.gram * liveSell : item.modal;
              const profit = currentValue - item.modal;
              const isProfit = profit >= 0;

              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.86rem' }}>{item.title}</div>
                    <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                      {item.gram.toFixed(3)}g · Modal: {formatRupiah(item.modal)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: isProfit ? '#34d399' : '#f87171', fontSize: '0.88rem' }}>
                        {isProfit ? '+' : ''}{formatRupiah(profit)}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        {((profit / item.modal) * 100).toFixed(2)}%
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteEntry(item.id)}
                      style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
