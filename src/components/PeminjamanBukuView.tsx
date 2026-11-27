import React, { useState } from 'react';
import { Handshake, Search, BookOpen, User, CheckCircle, ArrowRight, Plus, QrCode, X, ShoppingBag, Gift, Sparkles } from 'lucide-react';
import { Book, UserMember, LoanTransaction } from '../types';

interface PeminjamanBukuViewProps {
  users: UserMember[];
  books: Book[];
  loans: LoanTransaction[];
  onAddLoan: (newLoan: Omit<LoanTransaction, 'id'>) => void;
  isOpenModalImmediately?: boolean;
  onCloseImmediateModal?: () => void;
}

export const PeminjamanBukuView: React.FC<PeminjamanBukuViewProps> = ({
  users,
  books,
  loans,
  onAddLoan,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [loanDurationDays, setLoanDurationDays] = useState<number>(7);
  const [catatan, setCatatan] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Book scan/search input state
  const [bookQuery, setBookQuery] = useState<string>('');
  const [showBookDropdown, setShowBookDropdown] = useState<boolean>(false);

  // User search/scan input state
  const [userQuery, setUserQuery] = useState<string>('');
  const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);

  const selectedUser = users.find((u) => u.id === selectedUserId);
  const selectedBook = books.find((b) => b.id === selectedBookId);

  // Auto calculate dates
  const today = new Date();
  const tanggalPinjam = today.toISOString().split('T')[0];

  const dueDateObj = new Date();
  dueDateObj.setDate(today.getDate() + loanDurationDays);
  const tanggalJatuhTempo = dueDateObj.toISOString().split('T')[0];

  // Quick book search by Kode Induk, Nomor Induk, or Judul
  const matchingBooks = books.filter((b) => {
    if (!bookQuery.trim()) return true;
    const q = bookQuery.trim().toLowerCase();
    return (
      (b.kodeInduk && b.kodeInduk.toLowerCase().includes(q)) ||
      (b.nomorInduk && b.nomorInduk.toLowerCase().includes(q)) ||
      b.judul.toLowerCase().includes(q) ||
      b.pengarang.toLowerCase().includes(q)
    );
  });

  // Handle book scan / enter press
  const handleBookQuerySubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!bookQuery.trim()) return;

    const q = bookQuery.trim().toLowerCase();
    // Try exact match on Kode Induk or Nomor Induk first
    const exactMatch = books.find(
      (b) =>
        (b.kodeInduk && b.kodeInduk.toLowerCase() === q) ||
        (b.nomorInduk && b.nomorInduk.toLowerCase() === q)
    );

    if (exactMatch) {
      setSelectedBookId(exactMatch.id);
      setShowBookDropdown(false);
      setBookQuery('');
      return;
    }

    // Otherwise if matchingBooks has results
    if (matchingBooks.length === 1) {
      setSelectedBookId(matchingBooks[0].id);
      setShowBookDropdown(false);
      setBookQuery('');
    } else {
      setShowBookDropdown(true);
    }
  };

  // Quick user search by NIS/NIP or Nama
  const matchingUsers = users.filter((u) => {
    if (!userQuery.trim()) return true;
    const q = userQuery.trim().toLowerCase();
    return (
      u.nomorInduk.toLowerCase().includes(q) ||
      u.nama.toLowerCase().includes(q) ||
      (u.kelasJurusan && u.kelasJurusan.toLowerCase().includes(q))
    );
  });

  const handleUserQuerySubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userQuery.trim()) return;

    const q = userQuery.trim().toLowerCase();
    const exactMatch = users.find((u) => u.nomorInduk.toLowerCase() === q);

    if (exactMatch) {
      setSelectedUserId(exactMatch.id);
      setShowUserDropdown(false);
      setUserQuery('');
      return;
    }

    if (matchingUsers.length === 1) {
      setSelectedUserId(matchingUsers[0].id);
      setShowUserDropdown(false);
      setUserQuery('');
    } else {
      setShowUserDropdown(true);
    }
  };

  const handleProcessLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedBook) return;

    if (selectedBook.stokTersedia <= 0) {
      alert('Stok buku ini sedang habis. Silakan pilih judul lain.');
      return;
    }

    const kodeTrx = `TRX-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

    onAddLoan({
      kodeTransaksi: kodeTrx,
      userId: selectedUser.id,
      userName: selectedUser.nama,
      userNomorInduk: selectedUser.nomorInduk,
      bookId: selectedBook.id,
      bookJudul: selectedBook.judul,
      bookIsbn: selectedBook.kodeInduk || selectedBook.nomorInduk || 'N/A',
      tanggalPinjam,
      tanggalJatuhTempo,
      status: 'Dipinjam',
      dendaAmount: 0,
      dendaLunas: true,
      petugas: 'perpussmpkn',
      catatan,
    });

    setSuccessMsg(`Peminjaman berhasil dicatat! Kode: ${kodeTrx}`);
    setSelectedBookId('');
    setCatatan('');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const activeLoansList = loans.filter((l) => l.status === 'Dipinjam' || l.status === 'Terlambat');

  const filteredActiveLoans = activeLoansList.filter(
    (l) =>
      l.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.bookJudul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.kodeTransaksi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
        <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <Handshake className="w-6 h-6 text-blue-600" />
          Transaksi Peminjaman Buku
        </h1>
        <p className="text-slate-500 text-xs mt-1">
          Cari atau scan buku menggunakan Kode Induk atau Nomor Induk, pilih peminjam, dan atur durasi pinjam.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Loan Form + Active Loan Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Panel */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-5">
          <h2 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" /> Form Peminjaman Baru
          </h2>

          <form onSubmit={handleProcessLoan} className="space-y-4 text-xs">
            {/* User Selector */}
            <div className="relative">
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" /> Pilih Peminjam (Siswa / Guru)
              </label>

              {selectedUser ? (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-blue-900">{selectedUser.nama}</p>
                    <p className="text-[11px] text-blue-700">
                      {selectedUser.role} • NIS/NIP: <span className="font-mono font-bold">{selectedUser.nomorInduk}</span> • {selectedUser.kelasJurusan || '-'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUserId('');
                      setUserQuery('');
                    }}
                    className="p-1 text-slate-400 hover:text-red-600 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="relative">
                    <input
                      type="text"
                      value={userQuery}
                      onChange={(e) => {
                        setUserQuery(e.target.value);
                        setShowUserDropdown(true);
                      }}
                      onFocus={() => setShowUserDropdown(true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleUserQuerySubmit();
                        }
                      }}
                      placeholder="Ketik / Scan NIS, NIP, atau Nama peminjam..."
                      className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-blue-500/20"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    {userQuery && (
                      <button
                        type="button"
                        onClick={() => setUserQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {showUserDropdown && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
                      {matchingUsers.length === 0 ? (
                        <div className="p-3 text-center text-slate-400">Tidak ada peminjam ditemukan</div>
                      ) : (
                        matchingUsers.map((u) => (
                          <div
                            key={u.id}
                            onClick={() => {
                              setSelectedUserId(u.id);
                              setShowUserDropdown(false);
                              setUserQuery('');
                            }}
                            className="p-2.5 hover:bg-blue-50 cursor-pointer transition-colors"
                          >
                            <p className="font-bold text-slate-800">{u.nama}</p>
                            <p className="text-[11px] text-slate-500">
                              {u.role} • No. Induk: <span className="font-mono text-blue-600 font-bold">{u.nomorInduk}</span> • {u.kelasJurusan || '-'}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Book Selector with Scan & Call by Kode Induk / Nomor Induk */}
            <div className="relative">
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Pemanggilan Buku (Kode / Nomor Induk)
              </label>

              {selectedBook ? (
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900 text-xs">{selectedBook.judul}</p>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-600">
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 font-bold rounded">
                        Kode: {selectedBook.kodeInduk || '-'}
                      </span>
                      <span className="px-1.5 py-0.5 bg-slate-200 text-slate-800 font-bold rounded">
                        No: {selectedBook.nomorInduk || '-'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium pt-0.5">
                      Penulis: {selectedBook.pengarang} • Penerbit: {selectedBook.penerbit}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBookId('');
                      setBookQuery('');
                    }}
                    className="p-1 text-slate-400 hover:text-red-600 rounded-lg shrink-0 ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="relative">
                    <input
                      type="text"
                      value={bookQuery}
                      onChange={(e) => {
                        setBookQuery(e.target.value);
                        setShowBookDropdown(true);
                      }}
                      onFocus={() => setShowBookDropdown(true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleBookQuerySubmit();
                        }
                      }}
                      placeholder="Scan / Ketik Kode Induk / Nomor Induk / Judul..."
                      className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-blue-500/20"
                    />
                    <QrCode className="w-4 h-4 text-blue-600 absolute left-3 top-1/2 -translate-y-1/2" />
                    {bookQuery && (
                      <button
                        type="button"
                        onClick={() => setBookQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {showBookDropdown && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-56 overflow-y-auto divide-y divide-slate-100">
                      {matchingBooks.length === 0 ? (
                        <div className="p-3 text-center text-slate-400">Tidak ada buku sesuai Kode/Nomor Induk</div>
                      ) : (
                        matchingBooks.map((b) => (
                          <div
                            key={b.id}
                            onClick={() => {
                              setSelectedBookId(b.id);
                              setShowBookDropdown(false);
                              setBookQuery('');
                            }}
                            className="p-2.5 hover:bg-blue-50 cursor-pointer transition-colors space-y-0.5"
                          >
                            <p className="font-bold text-slate-800">{b.judul}</p>
                            <div className="flex items-center gap-2 text-[11px] font-mono">
                              <span className="text-blue-600 font-bold">Kode: {b.kodeInduk || '-'}</span>
                              <span className="text-slate-600 font-bold">No: {b.nomorInduk || '-'}</span>
                              {b.asal === 'Hibah' ? (
                                <span className="text-purple-600 font-bold">Hibah</span>
                              ) : (
                                <span className="text-emerald-600 font-bold">Beli</span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500">
                              {b.pengarang} ({b.penerbit})
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Duration & Due Date */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-2xl">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Durasi Pinjam</label>
                <select
                  value={loanDurationDays}
                  onChange={(e) => setLoanDurationDays(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-blue-200 rounded-xl text-slate-800 font-bold"
                >
                  <option value={3}>3 Hari</option>
                  <option value={7}>7 Hari (Standar)</option>
                  <option value={14}>14 Hari (Khusus Guru)</option>
                  <option value={30}>30 Hari (Referensi)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jatuh Tempo</label>
                <div className="p-2 bg-white border border-blue-200 rounded-xl text-slate-900 font-bold font-mono text-center">
                  {tanggalJatuhTempo}
                </div>
              </div>
            </div>

            {/* Catatan */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan</label>
              <input
                type="text"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Contoh: Tugas kelompok / bahan bacaan"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>

            <button
              type="submit"
              disabled={!selectedUserId || !selectedBookId}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <span>Proses Peminjaman</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Active Loan Table Panel */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-bold text-slate-800 text-base">Daftar Peminjaman Aktif</h2>
              <p className="text-slate-500 text-xs mt-0.5">Total {activeLoansList.length} buku sedang dipinjam</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari peminjam/buku..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Kode & Peminjam</th>
                  <th className="py-3 px-4">Buku & Kode Induk</th>
                  <th className="py-3 px-4">Tgl Pinjam</th>
                  <th className="py-3 px-4">Jatuh Tempo</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredActiveLoans.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">
                      Tidak ada data peminjaman aktif.
                    </td>
                  </tr>
                ) : (
                  filteredActiveLoans.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{l.userName}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{l.kodeTransaksi}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-800">{l.bookJudul}</p>
                        <p className="text-[11px] font-mono text-blue-600 font-bold">{l.bookIsbn}</p>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">{l.tanggalPinjam}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{l.tanggalJatuhTempo}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                            l.status === 'Terlambat'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
