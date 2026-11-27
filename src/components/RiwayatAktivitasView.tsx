import React, { useState } from 'react';
import { History, Search, ShieldCheck, Filter, Clock } from 'lucide-react';
import { ActivityLog } from '../types';

interface RiwayatAktivitasViewProps {
  activities: ActivityLog[];
}

export const RiwayatAktivitasView: React.FC<RiwayatAktivitasViewProps> = ({ activities }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('Semua');

  const filteredActivities = activities.filter((act) => {
    const matchesSearch =
      act.detail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'Semua' || act.kategori === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
        <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <History className="w-6 h-6 text-blue-600" />
          Riwayat Aktivitas & Audit Trail
        </h1>
        <p className="text-slate-500 text-xs mt-1">
          Catatan lengkap setiap aksi transaksi, pendaftaran anggota, perombakan buku, dan aktivitas sistem.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari aktivitas atau nama user..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
            {['Semua', 'Buku', 'User', 'Transaksi', 'Denda', 'Sistem'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  categoryFilter === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredActivities.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Tidak ada catatan riwayat aktivitas yang sesuai pencarian.
            </div>
          ) : (
            filteredActivities.map((act) => (
              <div key={act.id} className="py-3.5 flex items-start justify-between gap-4 hover:bg-slate-50/50 p-2 rounded-xl transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl mt-0.5 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-xs">{act.detail}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                      <span>Oleh: <strong className="text-slate-700">{act.user}</strong></span>
                      <span>•</span>
                      <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        {act.kategori}
                      </span>
                      <span>•</span>
                      <span className="font-bold text-slate-600">Aksi: {act.action}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {act.timestamp}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
