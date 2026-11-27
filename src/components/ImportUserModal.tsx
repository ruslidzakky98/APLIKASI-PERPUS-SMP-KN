import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Download, X, CheckCircle2, AlertCircle, Users, FileText } from 'lucide-react';
import { UserMember, UserRole } from '../types';
import { parseCsvContent, downloadCsvTemplate } from '../utils/csvHelper';

interface ImportUserModalProps {
  onClose: () => void;
  onImportUsers: (users: Omit<UserMember, 'id' | 'tanggalDaftar'>[]) => void;
}

export const ImportUserModal: React.FC<ImportUserModalProps> = ({ onClose, onImportUsers }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedData, setParsedData] = useState<Omit<UserMember, 'id' | 'tanggalDaftar'>[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const TEMPLATE_HEADERS = [
    'NIS_NIP',
    'Nama_Lengkap',
    'Kelas_Atau_Jabatan',
    'Role',
    'Kata_Sandi',
  ];

  const SAMPLE_ROWS = [
    ['2026105', 'Budi Santoso', 'IX-B', 'Siswa', 'siswa123'],
    ['198503102026', 'Dra. Endang Rahayu', 'Guru Bahasa Indonesia', 'Guru', 'guru123'],
    ['2026002', 'Siti Rahmawati', 'Petugas Perpustakaan', 'Petugas', 'petugas123'],
  ];

  const handleDownloadTemplate = () => {
    downloadCsvTemplate('Template_Import_Anggota_Perpus.csv', TEMPLATE_HEADERS, SAMPLE_ROWS);
  };

  const processCsvFile = (file: File) => {
    setError('');
    setFileName(file.name);

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setError('Mohon unggah file format CSV (.csv) sesuai dengan template!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = parseCsvContent(text);

        if (rows.length < 2) {
          setError('File CSV kosong atau tidak memiliki data anggota!');
          return;
        }

        // Skip header row
        const dataRows = rows.slice(1);
        const importedUsers: Omit<UserMember, 'id' | 'tanggalDaftar'>[] = [];

        for (let i = 0; i < dataRows.length; i++) {
          const row = dataRows[i];
          if (row.length < 2 || !row[1]) continue; // Skip empty rows or missing name

          const nomorInduk = row[0] || `NIS-${Date.now()}-${i}`;
          const nama = row[1];
          const kelasJurusan = row[2] || '-';

          // Validate Role
          let role: UserRole = 'Siswa';
          const roleStr = (row[3] || '').trim().toLowerCase();
          if (roleStr === 'admin') role = 'Admin';
          else if (roleStr === 'petugas') role = 'Petugas';
          else if (roleStr === 'guru') role = 'Guru';

          // Password with default if empty
          const password = row[4] && row[4].trim() !== '' ? row[4].trim() : 'siswa123';
          const email = `${nama.toLowerCase().replace(/[^a-z0-9]/g, '.')}@perpus.sch.id`;

          importedUsers.push({
            nomorInduk,
            nama,
            email,
            password,
            role,
            kelasJurusan,
            telepon: '-',
            status: 'Aktif',
          });
        }

        if (importedUsers.length === 0) {
          setError('Gagal membaca data dari CSV. Pastikan format kolom sesuai dengan template.');
        } else {
          setParsedData(importedUsers);
        }
      } catch (err) {
        console.error(err);
        setError('Terjadi kesalahan saat membaca file CSV.');
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processCsvFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processCsvFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (parsedData.length > 0) {
      onImportUsers(parsedData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 rounded-2xl">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Import Data Anggota via Excel / CSV</h3>
              <p className="text-xs text-slate-400">Tambah banyak data anggota sekaligus secara kolektif</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Step 1: Download Template */}
          <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">Langkah 1</span>
              <h4 className="font-bold text-xs text-slate-800">Unduh Format Template Excel/CSV</h4>
              <p className="text-[11px] text-slate-600">
                Gunakan template ini untuk mengisi NIS/NIP, Nama, Kelas/Jabatan, Role, dan Kata Sandi.
              </p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 shrink-0 transition-all active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Template</span>
            </button>
          </div>

          {/* Step 2: Upload File */}
          <div>
            <span className="text-[10px] font-black uppercase text-blue-800 tracking-wider block mb-1">
              Langkah 2: Unggah File CSV
            </span>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50/50'
                  : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <p className="font-bold text-xs text-slate-700">
                Klik atau seret file <span className="text-blue-600">.CSV</span> hasil simpan Excel ke sini
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Format yang disupport: CSV (Comma Separated Values)
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Preview Parsed Data */}
          {parsedData.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" /> Berhasil membaca {parsedData.length} data anggota ({fileName})
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl bg-slate-50 divide-y divide-slate-200 text-xs">
                {parsedData.map((u, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{u.nama}</p>
                      <p className="text-[11px] text-slate-500">
                        NIS/NIP: {u.nomorInduk} • Role: {u.role} • Kelas: {u.kelasJurusan}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-200 text-slate-700 rounded-md">
                      Pass: {u.password}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={parsedData.length === 0}
              onClick={handleConfirmImport}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98] flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              <span>Impor {parsedData.length > 0 ? `${parsedData.length} Data` : ''} Sekarang</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
