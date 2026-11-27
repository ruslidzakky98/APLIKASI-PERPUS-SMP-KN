import React, { useState } from 'react';
import { BookOpen, Plus, Search, Edit3, Trash2, FileSpreadsheet, Upload, X, QrCode, Tag, Calendar, ShoppingBag, Gift } from 'lucide-react';
import { Book } from '../types';
import { exportToCsv } from '../utils/exportCsv';
import { ImportBookModal } from './ImportBookModal';

interface DatabaseBukuViewProps {
  books: Book[];
  onAddBook: (newBook: Omit<Book, 'id' | 'totalDipinjam'>) => void;
  onImportBooks?: (books: Omit<Book, 'id' | 'totalDipinjam'>[]) => void;
  onEditBook: (book: Book) => void;
  onDeleteBook: (id: string) => void;
  isOpenModalImmediately?: boolean;
  onCloseImmediateModal?: () => void;
}

export const DatabaseBukuView: React.FC<DatabaseBukuViewProps> = ({
  books,
  onAddBook,
  onImportBooks,
  onEditBook,
  onDeleteBook,
  isOpenModalImmediately = false,
  onCloseImmediateModal,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedAsalFilter, setSelectedAsalFilter] = useState<string>('Semua');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(isOpenModalImmediately);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Form states matching user requirement
  const [formData, setFormData] = useState({
    kodeInduk: '',
    nomorInduk: '',
    judul: '',
    pengarang: '',
    penerbit: '',
    asal: 'Beli' as 'Beli' | 'Hibah',
    tanggalBeli: todayStr,
  });

  const handleExportSpreadsheet = () => {
    const headers = ['Kode Induk Buku', 'Nomor Induk Buku', 'Judul Buku', 'Penulis', 'Penerbit', 'Asal', 'Tanggal Beli'];
    const rows = filteredBooks.map((b) => [
      b.kodeInduk || '-',
      b.nomorInduk || '-',
      b.judul,
      b.pengarang,
      b.penerbit,
      b.asal || 'Beli',
      b.tanggalBeli || todayStr,
    ]);
    exportToCsv(`Database_Buku_Perpus_${todayStr}.csv`, headers, rows);
  };

  const filteredBooks = books.filter((b) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (b.kodeInduk && b.kodeInduk.toLowerCase().includes(term)) ||
      (b.nomorInduk && b.nomorInduk.toLowerCase().includes(term)) ||
      b.judul.toLowerCase().includes(term) ||
      b.pengarang.toLowerCase().includes(term) ||
      b.penerbit.toLowerCase().includes(term);

    const matchesAsal =
      selectedAsalFilter === 'Semua' || (b.asal || 'Beli') === selectedAsalFilter;

    return matchesSearch && matchesAsal;
  });

  const openAddModal = () => {
    setEditingBook(null);
    const nextSeq = books.length + 1;
    setFormData({
      kodeInduk: `KIB-2025-${String(nextSeq).padStart(3, '0')}`,
      nomorInduk: `NIB-${1000 + nextSeq}`,
      judul: '',
      pengarang: '',
      penerbit: '',
      asal: 'Beli',
      tanggalBeli: todayStr,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (b: Book) => {
    setEditingBook(b);
    setFormData({
      kodeInduk: b.kodeInduk || '',
      nomorInduk: b.nomorInduk || '',
      judul: b.judul || '',
      pengarang: b.pengarang || '',
      penerbit: b.penerbit || '',
      asal: b.asal || 'Beli',
      tanggalBeli: b.tanggalBeli || todayStr,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    if (onCloseImmediateModal) onCloseImmediateModal();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBook) {
      onEditBook({
        ...editingBook,
        kodeInduk: formData.kodeInduk,
        nomorInduk: formData.nomorInduk,
        judul: formData.judul,
        pengarang: formData.pengarang,
        penerbit: formData.penerbit,
        asal: formData.asal,
        tanggalBeli: formData.tanggalBeli,
      });
    } else {
      onAddBook({
        kodeInduk: formData.kodeInduk,
        nomorInduk: formData.nomorInduk,
        judul: formData.judul,
        pengarang: formData.pengarang,
        penerbit: formData.penerbit,
        asal: formData.asal,
        tanggalBeli: formData.tanggalBeli,
        stokTotal: 1,
        stokTersedia: 1,
      });
    }
    closeModal();
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            Database & Katalog Buku
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Kelola data buku berdasarkan Kode Induk, Nomor Induk, Judul, Penulis, Penerbit, Asal, dan Tanggal Beli.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {onImportBooks && (
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              title="Import Data Buku via Excel / CSV"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Import Excel / CSV</span>
            </button>
          )}

          <button
            onClick={handleExportSpreadsheet}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            title="Export Data Buku ke Excel / CSV"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel / CSV</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Buku Baru</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari Kode Induk, Nomor Induk, Judul, Penulis, Penerbit..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 placeholder-slate-400 font-medium"
          />
        </div>

        {/* Filter Asal Buku */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-500">Filter Asal:</span>
          {['Semua', 'Beli', 'Hibah'].map((asal) => (
            <button
              key={asal}
              onClick={() => setSelectedAsalFilter(asal)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedAsalFilter === asal
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {asal}
            </button>
          ))}
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-5">Kode & Nomor Induk</th>
                <th className="py-3.5 px-5">Judul Buku</th>
                <th className="py-3.5 px-4">Penulis (Pengarang)</th>
                <th className="py-3.5 px-4">Penerbit</th>
                <th className="py-3.5 px-4">Asal Buku</th>
                <th className="py-3.5 px-4">Tanggal Beli</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada data buku yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredBooks.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-mono">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-200/50">
                          <QrCode className="w-3 h-3 text-blue-500" />
                          {b.kodeInduk || '-'}
                        </span>
                        <p className="text-[11px] text-slate-500 font-semibold pl-1">
                          No: <span className="text-slate-800">{b.nomorInduk || '-'}</span>
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-5">
                      <p className="font-bold text-slate-900 text-xs">{b.judul}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800">{b.pengarang}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="text-slate-700 font-medium">{b.penerbit}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      {b.asal === 'Hibah' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 font-bold text-[11px] border border-purple-200">
                          <Gift className="w-3 h-3 text-purple-600" />
                          Hibah
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                          <ShoppingBag className="w-3 h-3 text-emerald-600" />
                          Beli
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="text-slate-600 font-mono flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {b.tanggalBeli || '-'}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(b)}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Buku"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteBook(b.id)}
                          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Buku"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Book Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <h3 className="font-bold text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                {editingBook ? 'Edit Data Buku' : 'Tambah Buku Baru'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kode Induk Buku</label>
                  <input
                    type="text"
                    required
                    value={formData.kodeInduk}
                    onChange={(e) => setFormData({ ...formData, kodeInduk: e.target.value })}
                    placeholder="Contoh: KIB-2025-001"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor Induk Buku</label>
                  <input
                    type="text"
                    required
                    value={formData.nomorInduk}
                    onChange={(e) => setFormData({ ...formData, nomorInduk: e.target.value })}
                    placeholder="Contoh: NIB-1001"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Buku</label>
                <input
                  type="text"
                  required
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  placeholder="Masukkan judul buku lengkap"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500/20 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Penulis (Pengarang)</label>
                <input
                  type="text"
                  required
                  value={formData.pengarang}
                  onChange={(e) => setFormData({ ...formData, pengarang: e.target.value })}
                  placeholder="Nama penulis"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Penerbit</label>
                <input
                  type="text"
                  required
                  value={formData.penerbit}
                  onChange={(e) => setFormData({ ...formData, penerbit: e.target.value })}
                  placeholder="Nama penerbit"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Asal Buku</label>
                  <select
                    value={formData.asal}
                    onChange={(e) => setFormData({ ...formData, asal: e.target.value as 'Beli' | 'Hibah' })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold"
                  >
                    <option value="Beli">Beli</option>
                    <option value="Hibah">Hibah</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Beli / Pengadaan</label>
                  <input
                    type="date"
                    required
                    value={formData.tanggalBeli}
                    onChange={(e) => setFormData({ ...formData, tanggalBeli: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/20"
                >
                  Simpan Buku
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Import Book */}
      {isImportModalOpen && onImportBooks && (
        <ImportBookModal
          onClose={() => setIsImportModalOpen(false)}
          onImportBooks={(newBooks) => {
            onImportBooks(newBooks);
            setIsImportModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
