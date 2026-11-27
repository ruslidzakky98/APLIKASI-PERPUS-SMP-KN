import React, { useState } from 'react';
import { Building2, Save, Upload, Link, CheckCircle, Phone, MapPin, Image as ImageIcon, Trash2, ExternalLink, RefreshCw } from 'lucide-react';
import { SchoolIdentity } from '../types';

interface IdentitasSekolahViewProps {
  schoolIdentity: SchoolIdentity;
  onSaveIdentity: (updated: SchoolIdentity) => void;
}

export const IdentitasSekolahView: React.FC<IdentitasSekolahViewProps> = ({
  schoolIdentity,
  onSaveIdentity,
}) => {
  const [formData, setFormData] = useState<SchoolIdentity>({
    namaSekolah: schoolIdentity.namaSekolah || 'SMP Khairunna',
    logoUrl: schoolIdentity.logoUrl || '',
    alamat: schoolIdentity.alamat || '',
    noWa: schoolIdentity.noWa || '',
  });

  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Handle image file upload (convert to Base64 data URL)
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Silakan pilih file gambar yang valid (PNG, JPG, JPEG, WebP, SVG).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file logo disarankan tidak melebihi 2MB.');
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setFormData((prev) => ({ ...prev, logoUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveIdentity(formData);
    setSuccessMsg('Identitas sekolah berhasil diperbarui!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleResetToDefault = () => {
    if (confirm('Kembalikan data identitas sekolah ke standar awal?')) {
      const defaultData: SchoolIdentity = {
        namaSekolah: 'SMP Khairunna',
        logoUrl: '',
        alamat: 'Jl. Raya Pendidikan No. 12, Kertasari, Kec. Suradadi, Kabupaten Tegal, Jawa Tengah',
        noWa: '081234567890',
      };
      setFormData(defaultData);
      onSaveIdentity(defaultData);
      setSuccessMsg('Identitas sekolah dikembalikan ke standar.');
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  // Format WA number for wa.me URL
  const cleanWaNumber = formData.noWa.replace(/[^0-9]/g, '');
  const waFormatted = cleanWaNumber.startsWith('0')
    ? '62' + cleanWaNumber.slice(1)
    : cleanWaNumber;

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-blue-600" />
            Pengaturan Identitas Sekolah
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Kelola Logo Sekolah, Nama Sekolah, Alamat, dan Nomor WhatsApp resmi untuk dicetak pada cetakan struk transaksi & header sistem.
          </p>
        </div>

        <button
          onClick={handleResetToDefault}
          type="button"
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 transition-all shrink-0 self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset Identitas</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs animate-in slide-in-from-top-2">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Form & Live Card Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Container */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-6">
          <h2 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" /> Form Identitas Sekolah
          </h2>

          {/* 1. Logo Sekolah Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-700 text-xs flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-blue-600" /> Logo Sekolah
              </label>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setInputMode('upload')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    inputMode === 'upload' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Unggah File
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('url')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    inputMode === 'url' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Link URL
                </button>
              </div>
            </div>

            {inputMode === 'upload' ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all ${
                  isDragOver ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="font-bold text-slate-700 text-xs">Tarik file logo ke sini atau klik pilih file</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Format PNG, JPG, WebP, SVG (Maks. 2MB)</p>
                <label className="inline-block mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs transition-all">
                  <span>Pilih File Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>
            ) : (
              <div>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    placeholder="https://domain.com/logo-sekolah.png"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium"
                  />
                  <Link className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}

            {formData.logoUrl && (
              <div className="flex items-center gap-3 p-3 bg-blue-50/60 border border-blue-200/80 rounded-2xl">
                <img
                  src={formData.logoUrl}
                  alt="Logo Sekolah"
                  className="w-12 h-12 object-contain rounded-xl bg-white p-1 border border-slate-200 shadow-2xs"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/100x100?text=Logo';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-xs truncate">Logo Sekolah Aktif</p>
                  <p className="text-[10px] text-slate-500 truncate">Selesai diunggah/diatur</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, logoUrl: '' })}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  title="Hapus Logo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* 2. Nama Sekolah */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700 text-xs">
              Nama Sekolah <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.namaSekolah}
              onChange={(e) => setFormData({ ...formData, namaSekolah: e.target.value })}
              placeholder="Contoh: SMP Khairunna"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* 3. Alamat Sekolah */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700 text-xs flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" /> Alamat Lengkap Sekolah
            </label>
            <textarea
              rows={3}
              value={formData.alamat}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              placeholder="Jl. Pendidikan No. 12, Desa Kertasari, Kec. Suradadi..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* 4. Nomor WhatsApp Sekolah */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700 text-xs flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-600" /> Nomor WhatsApp Resmi Sekolah
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.noWa}
                onChange={(e) => setFormData({ ...formData, noWa: e.target.value })}
                placeholder="081234567890"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-bold focus:ring-2 focus:ring-emerald-500/20"
              />
              {cleanWaNumber && (
                <a
                  href={`https://wa.me/${waFormatted}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1 shrink-0 transition-colors"
                  title="Buka Chat WhatsApp"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Uji WA</span>
                </a>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Gunakan format lokal (misal: 081234567890) atau internasional (6281234567890).
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all active:scale-[0.98]"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Identitas Sekolah</span>
            </button>
          </div>
        </form>

        {/* Live Preview Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Pratinjau Struk & Header</span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/30">
                Live Preview
              </span>
            </div>

            {/* Header Preview Box */}
            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1 shrink-0 shadow-2xs">
                {formData.logoUrl ? (
                  <img
                    src={formData.logoUrl}
                    alt="Logo"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/100x100?text=Logo';
                    }}
                  />
                ) : (
                  <Building2 className="w-7 h-7 text-blue-600" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-extrabold text-sm text-white truncate">
                  {formData.namaSekolah || 'Nama Sekolah'}
                </h3>
                <p className="text-[11px] text-blue-300 font-medium">Perpustakaan Digital Sekolah</p>
              </div>
            </div>

            {/* Receipt Preview Box */}
            <div className="p-4 bg-white text-slate-800 rounded-2xl shadow-inner font-mono text-[11px] space-y-3">
              <div className="text-center border-b border-dashed border-slate-300 pb-2">
                {formData.logoUrl && (
                  <img
                    src={formData.logoUrl}
                    alt="Receipt Logo"
                    className="w-8 h-8 object-contain mx-auto mb-1"
                  />
                )}
                <p className="font-black text-xs text-slate-900 font-sans uppercase">{formData.namaSekolah || 'NAMA SEKOLAH'}</p>
                <p className="text-[10px] text-slate-500 font-sans mt-0.5 leading-tight">{formData.alamat || 'Alamat Sekolah...'}</p>
                <p className="text-[10px] text-slate-600 font-sans font-bold mt-1">WA: {formData.noWa || '-'}</p>
              </div>

              <div className="space-y-1 text-[10px]">
                <div className="flex justify-between text-slate-500">
                  <span>STRUK TRANSAKSI</span>
                  <span>TRX-SAMPLE-01</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-bold text-emerald-600">DIPINJAM</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center italic">
              *Tampilan identitas ini akan diterapkan otomatis di Sidebar, Navbar, dan Cetakan Struk Transaksi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
