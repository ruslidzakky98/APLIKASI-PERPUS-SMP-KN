import React, { useState } from 'react';
import { RotateCcw, Search, CheckCircle, AlertTriangle, Receipt, ArrowRight, BookCheck, ShieldAlert, FileSpreadsheet } from 'lucide-react';
import { LoanTransaction } from '../types';
import { exportToCsv } from '../utils/exportCsv';

interface PengembalianBukuViewProps {
  loans: LoanTransaction[];
  onReturnLoan: (loanId: string, dendaAmount: number, notes: string) => void;
  onPrintReceipt: (loan: LoanTransaction) => void;
}

export const PengembalianBukuView: React.FC<PengembalianBukuViewProps> = ({
  loans,
  onReturnLoan,
  onPrintReceipt,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLoanId, setSelectedLoanId] = useState<string>('');
  const [returnNotes, setReturnNotes] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const handleExportSpreadsheet = () => {
    const headers = [
      'Kode TRX',
      'Nama Peminjam',
      'NIS/NIP',
      'Judul Buku',
      'ISBN',
      'Tgl Pinjam',
      'Tgl Jatuh Tempo',
      'Tgl Kembali',
      'Status',
      'Denda (Rp)',
      'Petugas',
    ];
    const rows = loans.map((l) => [
      l.kodeTransaksi,
      l.userName,
      l.userNomorInduk,
      l.bookJudul,
      l.bookIsbn,
      l.tanggalPinjam,
      l.tanggalJatuhTempo,
      l.tanggalKembali || '-',
      l.status,
      l.dendaAmount,
      l.petugas,
    ]);
    exportToCsv(`Laporan_Transaksi_Pinjam_Kembali_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  const activeLoans = loans.filter((l) => l.status === 'Dipinjam' || l.status === 'Terlambat');

  const filteredLoans = activeLoans.filter(
    (l) =>
      l.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.bookJudul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.kodeTransaksi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.userNomorInduk.includes(searchTerm)
  );

  const selectedLoan = activeLoans.find((l) => l.id === selectedLoanId);

  // Calculate late days and fine
  let daysLate = 0;
  let calculatedFine = 0;

  if (selectedLoan) {
    const today = new Date();
    const dueDate = new Date(selectedLoan.tanggalJatuhTempo);
    const diffTime = today.getTime() - dueDate.getTime();
    if (diffTime > 0) {
      daysLate = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      calculatedFine = daysLate * 1000; // Rp 1.000 / day
    }
  }

  const handleProcessReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) return;

    onReturnLoan(selectedLoan.id, calculatedFine, returnNotes || 'Pengembalian tepat waktu / denda dihitung');
    setSuccessMsg(`Buku "${selectedLoan.bookJudul}" berhasil dikembalikan!`);
    
    // Trigger receipt modal
    onPrintReceipt({
      ...selectedLoan,
      tanggalKembali: new Date().toISOString().split('T')[0],
      dendaAmount: calculatedFine,
      status: 'Dikembalikan',
    });

    setSelectedLoanId('');
    setReturnNotes('');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-emerald-600" />
            Pengembalian Buku & Perhitungan Denda
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Cari transaksi peminjaman aktif, hitung otomatis keterlambatan & denda (Rp 1.000/hari), lalu proses pengembalian.
          </p>
        </div>

        <button
          onClick={handleExportSpreadsheet}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] shrink-0"
          title="Export Semua Transaksi ke Spreadsheet / Excel"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Excel / CSV</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List of Loans */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-bold text-slate-800 text-base">Pilih Transaksi yang Akan Dikembalikan</h2>
              <p className="text-slate-500 text-xs mt-0.5">Klik salah satu transaksi untuk memproses</p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari kode, nama, NIS/NIP..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredLoans.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Tidak ada peminjaman aktif yang cocok dengan pencarian.
              </div>
            ) : (
              filteredLoans.map((loan) => {
                const isSelected = loan.id === selectedLoanId;
                const isLate = loan.status === 'Terlambat';

                return (
                  <div
                    key={loan.id}
                    onClick={() => setSelectedLoanId(loan.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-blue-50/90 border-blue-600 shadow-sm ring-1 ring-blue-600'
                        : isLate
                        ? 'bg-amber-50/70 border-amber-200 hover:bg-amber-100/60'
                        : 'bg-white border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{loan.userName}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">
                          {loan.kodeTransaksi}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-blue-700 truncate">"{loan.bookJudul}"</p>
                      <p className="text-[11px] text-slate-500">
                        Pinjam: {loan.tanggalPinjam} | Jatuh Tempo: <span className="font-bold text-slate-800">{loan.tanggalJatuhTempo}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      {isLate ? (
                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 font-bold text-[11px] px-2.5 py-1 rounded-lg">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> Terlambat
                        </span>
                      ) : (
                        <span className="inline-block bg-emerald-100 text-emerald-800 font-bold text-[11px] px-2.5 py-1 rounded-lg">
                          Tepat Waktu
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Action Panel */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-5">
          <h2 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
            <BookCheck className="w-5 h-5 text-emerald-600" /> Detail & Proses Pengembalian
          </h2>

          {!selectedLoan ? (
            <div className="py-16 text-center text-slate-400 text-xs space-y-2">
              <RotateCcw className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-600">Pilih salah satu transaksi dari daftar sebelah kiri</p>
            </div>
          ) : (
            <form onSubmit={handleProcessReturn} className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Peminjam</span>
                  <p className="font-bold text-slate-900 text-sm">{selectedLoan.userName}</p>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Judul Buku</span>
                  <p className="font-bold text-blue-700 text-xs">{selectedLoan.bookJudul}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Tanggal Pinjam</span>
                    <p className="font-mono text-slate-800 font-semibold">{selectedLoan.tanggalPinjam}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Jatuh Tempo</span>
                    <p className="font-mono text-slate-800 font-semibold">{selectedLoan.tanggalJatuhTempo}</p>
                  </div>
                </div>
              </div>

              {/* Denda Calculation Box */}
              <div
                className={`p-4 rounded-2xl border ${
                  daysLate > 0
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    {daysLate > 0 ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    )}
                    Keterlambatan:
                  </span>
                  <span className="font-bold font-mono text-sm">{daysLate} Hari</span>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60">
                  <span className="font-bold">Total Denda (Rp 1.000/hari):</span>
                  <span className="text-base font-black text-slate-900 font-mono">
                    Rp {calculatedFine.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Catatan Pengembalian */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Keterangan / Kondisi Buku</label>
                <input
                  type="text"
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="Contoh: Buku kembali rapi / denda lunas"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <span>Proses Pengembalian Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
