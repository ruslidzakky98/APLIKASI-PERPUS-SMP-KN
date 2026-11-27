import React, { useState } from 'react';
import { Database, Download, Upload, RefreshCw, CheckCircle2, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { LibraryState } from '../types';

interface BackupResetViewProps {
  state: LibraryState;
  onRestoreState: (newState: LibraryState) => void;
  onResetToDefault: () => void;
}

export const BackupResetView: React.FC<BackupResetViewProps> = ({
  state,
  onRestoreState,
  onResetToDefault,
}) => {
  const [successMsg, setSuccessMsg] = useState<string>('');

  const handleDownloadBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `backup_perpus_sekolah_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setSuccessMsg('File backup JSON berhasil diunduh ke komputer Anda!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.books && parsed.users) {
          onRestoreState(parsed);
          setSuccessMsg('Data perpustakaan berhasil dipulihkan dari file backup!');
          setTimeout(() => setSuccessMsg(''), 4000);
        } else {
          alert('Format file backup JSON tidak valid.');
        }
      } catch (err) {
        alert('Gagal membaca file JSON backup.');
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmReset = () => {
    if (confirm('Apakah Anda yakin ingin mengembalikan seluruh data perpustakaan ke set awal demo? Data baru akan ditimpa.')) {
      onResetToDefault();
      setSuccessMsg('Data telah dikembalikan ke kondisi awal bawaan sistem.');
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
        <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <Database className="w-6 h-6 text-blue-600" />
          Backup, Restore, & Reset Data Perpustakaan
        </h1>
        <p className="text-slate-500 text-xs mt-1">
          Amankan seluruh basis data (katalog buku, anggota, transaksi, denda) dalam bentuk JSON, restore kapan saja, atau atur ulang data.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Download Backup */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center mb-3">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Unduh Backup Data</h3>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed">
              Simpan salinan cadangan seluruh data perpustakaan ke penyimpanan lokal komputer dalam format file `.json`.
            </p>
            <div className="mt-3 p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 space-y-1">
              <p>• {state.books.length} Judul Buku</p>
              <p>• {state.users.length} Anggota User</p>
              <p>• {state.loans.length} Transaksi Peminjaman</p>
            </div>
          </div>

          <button
            onClick={handleDownloadBackup}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>Unduh JSON Backup</span>
          </button>
        </div>

        {/* Card 2: Restore Backup */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Pulihkan (Restore) Data</h3>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed">
              Upload file backup JSON yang telah Anda unduh sebelumnya untuk memulihkan seluruh data perpustakaan.
            </p>
          </div>

          <label className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]">
            <Upload className="w-4 h-4" />
            <span>Upload File JSON</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {/* Card 3: Reset Data */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-red-100 text-red-700 rounded-2xl flex items-center justify-center mb-3">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Reset Data Awal</h3>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed">
              Kembalikan basis data ke sampel awal Sistem Informasi Perpustakaan SMP Khairunna (Demo Mode).
            </p>
          </div>

          <button
            onClick={handleConfirmReset}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Ke Data Bawaan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
