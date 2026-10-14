import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Key, Eye, EyeOff, HelpCircle, Trash2, Sparkles, ExternalLink, X } from 'lucide-react';
import { formatRupiah } from '../services/api';

const GEMINI_MODELS = [
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Cepat & Akurat)' },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Analisa Mendalam)' },
  { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
];

export default function AiCopilotCard({ liveBuy, liveSell, usdRate, globalRates }) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: 'Halo sob! Gw AI Cuan Copilot 🤖. Pantau harga emas Treasury atau analisa teknikal? Tanya aja cuy!'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    try {
      const storedKey = localStorage.getItem('cuanmania_gemini_key');
      if (storedKey) setApiKey(storedKey);
    } catch (e) { }
  }, []);

  const handleKeySave = (val) => {
    setApiKey(val);
    try {
      localStorage.setItem('cuanmania_gemini_key', val);
    } catch (e) { }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getMarketContext = () => {
    const buyStr = liveBuy ? formatRupiah(liveBuy) : 'tidak tersedia';
    const sellStr = liveSell ? formatRupiah(liveSell) : 'tidak tersedia';
    const spreadStr = liveBuy && liveSell ? `${(((liveBuy - liveSell) / liveBuy) * 100).toFixed(2)}%` : '0%';
    const usdStr = usdRate ? `Rp ${Math.round(usdRate).toLocaleString('id-ID')}` : 'tidak tersedia';
    const xauStr = globalRates?.xauUsd ? `$${globalRates.xauUsd}` : 'tidak tersedia';

    return `[DATA PASAR SAAT INI]:
- Harga Beli Treasury: ${buyStr}/g
- Harga Jual Treasury: ${sellStr}/g
- Spread: ${spreadStr}
- Kurs USD/IDR: ${usdStr}
- Harga Emas Dunia XAU/USD: ${xauStr}`;
  };

  const handleSendMessage = async (textToSend = null) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    if (!apiKey) {
      setShowTutorialModal(true);
      return;
    }

    const newMsgs = [...messages, { role: 'user', text: query }];
    setMessages(newMsgs);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      const context = getMarketContext();
      const systemPrompt = `Kamu adalah asisten investasi. Jawab singkat, padat, pakai bahasa Indonesia gaul/santai spt sob/cuy. Gunakan emoticon relevan (📈, 💰, 🤖, ⚠️, ✨). Fokus ke insight berharga dr data yg dikirim, hindari teori panjang lebar. Berikan saran logis beli, tahan, atau cicil.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemPrompt }]
            },
            contents: [
              ...newMsgs.slice(-4).map(m => ({
                role: m.role === 'model' ? 'model' : 'user',
                parts: [{ text: m.text }]
              })),
              {
                role: 'user',
                parts: [{ text: `${context}\n\nPertanyaan user: ${query}` }]
              }
            ]
          })
        }
      );

      const data = await response.json();
      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const reply = data.candidates[0].content.parts[0].text;
        setMessages(prev => [...prev, { role: 'model', text: reply }]);
      } else if (data?.error) {
        setMessages(prev => [...prev, { role: 'model', text: `⚠️ Error: ${data.error.message || 'Gagal memanggil Gemini'}` }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: '⚠️ Maaf sob, respons tidak terbaca.' }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: '⚠️ Gagal terhubung ke Gemini API. Cek koneksi atau kuota API Key kamu.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="ai-card" id="section-ai">
        <div className="ai-header">
          <div className="ai-title">
            <Bot size={20} />
            <span>AI CUAN COPILOT</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="API Key Gemini..."
                value={apiKey}
                onChange={(e) => handleKeySave(e.target.value)}
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  padding: '6px 28px 6px 10px',
                  fontSize: '0.8rem',
                  color: '#fff',
                  width: '140px',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                style={{
                  position: 'absolute',
                  right: '8px',
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>

            <button
              className="icon-button"
              onClick={() => setShowTutorialModal(true)}
              title="Cara dapatkan API Key Gemini Gratis"
            >
              <HelpCircle size={15} />
            </button>
          </div>
        </div>

        {/* Model Selector */}
        <select
          className="calc-input"
          style={{ padding: '8px 12px', fontSize: '0.84rem', width: '100%' }}
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
        >
          {GEMINI_MODELS.map(m => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </select>

        {/* Chat History Box */}
        <div className="ai-chat-box">
          {messages.map((m, idx) => (
            <div key={idx} className={`chat-bubble ${m.role}`}>
              {m.text}
            </div>
          ))}
          {isLoading && (
            <div className="chat-bubble ai">
              <span style={{ fontStyle: 'italic', opacity: 0.8 }}>AI sedang menganalisis pasar...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Shortcut Buttons */}
        <div className="ai-shortcuts">
          <button
            className="ai-shortcut-btn"
            onClick={() => handleSendMessage('Tolong analisa pasar emas Treasury saat ini, apakah wajar?')}
          >
            📊 Analisa Market
          </button>
          <button
            className="ai-shortcut-btn"
            onClick={() => handleSendMessage('Lebih baik beli emas sekarang atau tunggu koreksi?')}
          >
            💡 Saran Beli/Tunggu
          </button>
          <button
            className="ai-shortcut-btn"
            onClick={() => handleSendMessage('Bahas strategi kunci paket promo yang menguntungkan')}
          >
            🏷️ Strategi Promo
          </button>
        </div>

        {/* Input Bar */}
        <div className="ai-input-row">
          <input
            type="text"
            className="ai-text-input"
            placeholder="Curhat portofolio / tanya strategi..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button
            className="ai-send-button"
            disabled={isLoading}
            onClick={() => handleSendMessage()}
          >
            <Send size={15} />
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#94a3b8' }}>
          <span>⚠️ DYOR: Analisa AI hanya referensi dan edukasi, bukan ajakan finansial.</span>
          <button
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}
            onClick={() => setMessages([{ role: 'model', text: 'Chat direset sob! Tanya apa lagi?' }])}
          >
            <Trash2 size={13} /> Reset
          </button>
        </div>
      </div>

      {/* Tutorial Modal */}
      {showTutorialModal && (
        <div className="modal-overlay" onClick={() => setShowTutorialModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowTutorialModal(false)}>
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Key size={22} color="#fbbf24" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
                Cara Ambil API Key Gemini Gratis
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              <div>
                <b>Langkah 1:</b> Kunjungi situs resmi{' '}
                <a
                  href="https://aistudio.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#60a5fa', textDecoration: 'underline' }}
                >
                  Google AI Studio
                </a>.
              </div>
              <div><b>Langkah 2:</b> Login menggunakan Akun Google / Gmail Anda.</div>
              <div><b>Langkah 3:</b> Klik menu sebelah kiri, pilih <b>"Get API key"</b>.</div>
              <div><b>Langkah 4:</b> Klik <b>"Create API key in new project"</b>.</div>
              <div><b>Langkah 5:</b> Salin kunci tersebut, lalu tempel pada kolom <b>"API Key Gemini..."</b> di AI Copilot.</div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <a
                href="https://aistudio.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="pagi-btn active"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', textDecoration: 'none' }}
              >
                Buka Google AI Studio <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
