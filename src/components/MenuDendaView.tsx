import React, { useState } from 'react';
import { Receipt, CheckCircle, AlertCircle, Search, ShieldCheck, DollarSign, Wallet, FileSpreadsheet } from 'lucide-react';
import { FineRecord } from '../types';
import { exportToCsv } from '../utils/exportCsv';

interface MenuDendaViewProps {
  fines: FineRecord[];
  onPayFine: (fineId: string) => void;
  onForgiveFine: (fineId: string) => void;
}

export const MenuDendaView: React.FC<MenuDendaViewProps> = ({ fines, onPayFine, onForgiveFine }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');

  const handleExportSpreadsheet = () => {
    const headers = ['ID Denda', 'Nama Anggota', 'NIS/NIP', 'Judul Buku', 'Keterangan', 'Jumlah Denda (Rp)', 'Tanggal', 'Status Bayar', 'Tgl Bayar'];
    const rows = filteredFines.map((f) => [
      f.id,
      f.userName,
      f.userNomorInduk,
      f.bookJudul,
      f.keterangan,
      f.jumlahDenda,
      f.tanggalDenda,
      f.statusBayar,
      f.tanggalBayar || '-',
    ]);
    exportToCsv(`Laporan_Denda_Perpus_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  const pendingTotal = fines
    .filter((f) => f.statusBayar === 'Belum Bayar')
    .reduce((sum, f) => sum + f.jumlahDenda, 0);

  const collectedTotal = fines
    .filter((f) => f.statusBayar === 'Lunas')
    .reduce((sum, f) => sum + f.jumlahDenda, 0);

  const filteredFines = fines.filter((f) => {
    const matchesSearch =
      f.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.bookJudul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.userNomorInduk.includes(searchTerm);
    const matchesStatus = statusFilter === 'Semua' || f.statusBayar === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-amber-600" />
            Menu Denda & Keuangan Perpustakaan
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Pantau catatan denda keterlambatan pengembalian buku, proses pembayaran kas, dan bebas denda.
          </p>
        </div>

        <button
          onClick={handleExportSpreadsheet}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] shrink-0"
          title="Export Laporan Denda ke Spreadsheet / Excel"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Excel / CSV</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-amber-50/80 p-5 rounded-2xl border border-amber-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Total Denda Belum Bayar</span>
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-900 font-mono mt-2">
            Rp {pendingTotal.toLocaleString('id-ID')}
          </p>
        </div>

        <div className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Total Denda Terkumpul (Kas)</span>
            <Wallet className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-900 font-mono mt-2">
            Rp {collectedTotal.toLocaleString('id-ID')}
          </p>
        </div>

        <div className="bg-blue-50/80 p-5 rounded-2xl border border-blue-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Total Transaksi Denda</span>
            <Receipt className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-900 font-mono mt-2">
            {fines.length} Catatan
          </p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden p-6 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari peminjam / judul buku..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            {['Semua', 'Belum Bayar', 'Lunas', 'Dimaafkan'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Anggota</th>
                <th className="py-3.5 px-4">Judul Buku</th>
                <th className="py-3.5 px-4">Keterangan</th>
                <th className="py-3.5 px-4">Jumlah Denda</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredFines.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada catatan denda yang cocok.
                  </td>
                </tr>
              ) : (
                filteredFines.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{f.userName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">NIS: {f.userNomorInduk}</p>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800">{f.bookJudul}</td>

                    <td className="py-3.5 px-4 text-slate-500">{f.keterangan}</td>

                    <td className="py-3.5 px-4 font-black font-mono text-slate-900">
                      Rp {f.jumlahDenda.toLocaleString('id-ID')}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                          f.statusBayar === 'Lunas'
                            ? 'bg-emerald-100 text-emerald-800'
                            : f.statusBayar === 'Dimaafkan'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {f.statusBayar}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {f.statusBayar === 'Belum Bayar' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onPayFine(f.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px]"
                          >
                            Tandai Lunas
                          </button>
                          <button
                            onClick={() => onForgiveFine(f.id)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px]"
                          >
                            Free Denda
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">Selesai</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
