import React, { useState } from 'react';
import { X, ExternalLink, Activity } from 'lucide-react';

export default function FloatingXauModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <button
        className="floating-xau-fab"
        onClick={() => setIsOpen(true)}
        title="Buka Quick Chart XAUUSD"
      >
        XAU
      </button>

      {/* Floating Modal */}
      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '780px', height: '560px', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="#f59e0b" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
                  XAUUSD · Spot Gold Realtime
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <a
                  href="https://id.tradingview.com/symbols/OANDA-XAUUSD/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="icon-button"
                  title="Buka di TradingView"
                >
                  <ExternalLink size={14} />
                </a>
                <button
                  className="icon-button"
                  onClick={() => setIsOpen(false)}
                  title="Tutup"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div style={{ flex: 1, borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--card-border)' }}>
              <iframe
                title="Floating XAUUSD Chart"
                src="https://www.tradingview.com/widgetembed/?symbol=OANDA%3AXAUUSD&interval=5&hidetoptoolbar=0&hidesidetoolbar=1&symboledit=1&saveimage=0&toolbarbg=131722&theme=dark&style=1&timezone=Asia%2FJakarta&locale=id_ID&withdateranges=1&hideideas=1"
                width="100%"
                height="100%"
                frameBorder="0"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
