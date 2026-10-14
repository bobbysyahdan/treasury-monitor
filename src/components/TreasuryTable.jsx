import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { PROMO_PACKAGES, formatRupiah } from '../services/api';

export default function TreasuryTable({ historyData, liveBuy, liveSell, liveDelta }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // Combine live item with historical data
  const combinedData = useMemo(() => {
    let list = [...historyData];
    if (liveBuy > 0 && liveSell > 0) {
      const liveItem = {
        buy: liveBuy,
        sell: liveSell,
        timestamp: Date.now(),
        isLive: true
      };
      // Prevent duplicate within same minute
      const currentMinKey = Math.floor(Date.now() / 60000);
      list = [liveItem, ...list.filter(x => Math.floor(x.timestamp / 60000) !== currentMinKey)];
    }
    return list;
  }, [historyData, liveBuy, liveSell]);

  // Filter based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return combinedData;
    const q = searchQuery.replace(/[^0-9]/g, '');
    if (!q) return combinedData;
    return combinedData.filter(item => {
      const bStr = Math.round(item.buy || 0).toString();
      const sStr = Math.round(item.sell || 0).toString();
      return bStr.includes(q) || sStr.includes(q);
    });
  }, [combinedData, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentRows = filteredData.slice(startIndex, startIndex + rowsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="table-card">
      {/* Search Toolbar */}
      <div className="table-toolbar">
        <div className="search-input-wrap">
          <Search className="search-icon" size={15} />
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Cari harga jual / beli (contoh: 2470000)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>Tampilkan:</span>
          <select
            className="limit-select"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={2}>2 Baris</option>
            <option value={5}>5 Baris</option>
            <option value={10}>10 Baris</option>
            <option value={15}>15 Baris</option>
            <option value={25}>25 Baris</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="table-scroll-container">
        <table className="treasury-table">
          <thead>
            <tr>
              <th>Waktu</th>
              <th>Harga Pasar</th>
              {PROMO_PACKAGES.map((pkg) => (
                <th key={pkg.m}>
                  Est. Pembelian<br />{pkg.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentRows.length === 0 ? (
              <tr>
                <td colSpan={2 + PROMO_PACKAGES.length} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                  {searchQuery ? 'Data harga tidak ditemukan' : 'Menyinkronkan data riwayat Treasury...'}
                </td>
              </tr>
            ) : (
              currentRows.map((row, index) => {
                const isFirstRow = currentPage === 1 && index === 0;
                const nextRow = combinedData[startIndex + index + 1];
                let diff = 0;

                if (row.isLive) {
                  diff = liveDelta !== 0 ? liveDelta : (nextRow ? row.buy - nextRow.buy : 0);
                } else if (nextRow) {
                  diff = row.buy - nextRow.buy;
                }

                const dateObj = new Date(row.timestamp);
                const dayStr = dateObj.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
                const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const spreadPercent = row.buy > 0 ? (((row.buy - row.sell) / row.buy) * 100).toFixed(2) : '0.00';

                return (
                  <tr key={row.timestamp || index} className={isFirstRow ? 'row-glass' : ''}>
                    {/* Waktu */}
                    <td>
                      <div className="time-cell-wrap">
                        <div>
                          <div className="time-date">{dayStr}</div>
                          <div className="time-hour">{timeStr}</div>
                        </div>
                        {diff > 0 ? (
                          <TrendingUp size={15} color="#10b981" />
                        ) : diff < 0 ? (
                          <TrendingDown size={15} color="#ef4444" />
                        ) : (
                          <Minus size={15} color="#94a3b8" />
                        )}
                      </div>
                    </td>

                    {/* Harga Pasar */}
                    <td>
                      <div className="price-buy-text">{formatRupiah(row.buy)}</div>
                      <div className="price-sell-text">Jual: {formatRupiah(row.sell)}</div>
                      <div className="badges-row">
                        {diff > 0 && <span className="diff-pill up">+{formatRupiah(diff)}</span>}
                        {diff < 0 && <span className="diff-pill down">-{formatRupiah(Math.abs(diff))}</span>}
                        {diff === 0 && <span className="diff-pill neutral">Tetap</span>}
                        <span className="spread-pill">▼ {spreadPercent}%</span>
                      </div>
                    </td>

                    {/* Promo Packages Estimates */}
                    {PROMO_PACKAGES.map((pkg) => {
                      const gram = row.buy > 0 ? pkg.m / row.buy : 0;
                      const profit = row.buy > 0 && row.sell > 0 ? (gram * row.sell) - pkg.b : 0;
                      const isProfit = profit >= 0;

                      return (
                        <td key={pkg.m}>
                          <div className={`profit-val ${isProfit ? 'plus' : 'min'}`}>
                            {isProfit ? '+' : ''}{formatRupiah(profit)}
                          </div>
                          <div className="gram-pill">{gram.toFixed(3)}g</div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="table-footer">
        <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>
          Halaman {currentPage} dari {totalPages} ({filteredData.length} entri)
        </span>

        {totalPages > 1 && (
          <div className="pagination-controls">
            <button
              className="pagi-btn"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <ChevronLeft size={13} />
            </button>
            {(() => {
              let startPage = Math.max(1, currentPage - 2);
              let endPage = Math.min(totalPages, startPage + 4);
              if (endPage - startPage < 4) {
                startPage = Math.max(1, endPage - 4);
              }
              const pages = [];
              for (let p = startPage; p <= endPage; p++) {
                pages.push(p);
              }
              return pages.map(p => (
                <button
                  key={p}
                  className={`pagi-btn ${p === currentPage ? 'active' : ''}`}
                  onClick={() => handlePageChange(p)}
                >
                  {p}
                </button>
              ));
            })()}
            <button
              className="pagi-btn"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              <ChevronRight size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
