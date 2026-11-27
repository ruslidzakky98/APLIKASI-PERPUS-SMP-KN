import React from 'react';
import { 
  BookOpen, 
  Users, 
  Handshake, 
  RotateCcw, 
  Receipt, 
  AlertTriangle, 
  PlusCircle, 
  CheckCircle2, 
  TrendingUp, 
  BookCheck, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Sparkles,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { Book, UserMember, LoanTransaction, FineRecord, ActivityLog, NavTab } from '../types';

interface DashboardViewProps {
  currentUser: UserMember | null;
  books: Book[];
  users: UserMember[];
  loans: LoanTransaction[];
  fines: FineRecord[];
  activities: ActivityLog[];
  onNavigate: (tab: NavTab) => void;
  onQuickReturn: (loanId: string) => void;
  onOpenAddBook: () => void;
  onOpenNewLoan: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  books,
  users,
  loans,
  fines,
  activities,
  onNavigate,
  onQuickReturn,
  onOpenAddBook,
  onOpenNewLoan,
}) => {
  // Calculations for stats
  const totalBookTitles = books.length;
  const totalBookCopies = books.reduce((sum, b) => sum + b.stokTotal, 0);
  const availableCopies = books.reduce((sum, b) => sum + b.stokTersedia, 0);
  
  const totalUsers = users.length;
  const activeLoans = loans.filter((l) => l.status === 'Dipinjam' || l.status === 'Terlambat');
  const overdueLoans = loans.filter((l) => l.status === 'Terlambat');
  
  const pendingFinesTotal = fines
    .filter((f) => f.statusBayar === 'Belum Bayar')
    .reduce((sum, f) => sum + f.jumlahDenda, 0);
  
  const collectedFinesTotal = fines
    .filter((f) => f.statusBayar === 'Lunas')
    .reduce((sum, f) => sum + f.jumlahDenda, 0);

  // Chart 1: 7-Day Loan Trend Data
  const loanTrendData = [
    { hari: 'Senin', Peminjaman: 12, Pengembalian: 10 },
    { hari: 'Selasa', Peminjaman: 18, Pengembalian: 14 },
    { hari: 'Rabu', Peminjaman: 15, Pengembalian: 12 },
    { hari: 'Kamis', Peminjaman: 22, Pengembalian: 19 },
    { hari: 'Jumat', Peminjaman: 28, Pengembalian: 24 },
    { hari: 'Sabtu', Peminjaman: 8, Pengembalian: 6 },
    { hari: 'Minggu', Peminjaman: 0, Pengembalian: 0 },
  ];

  // Chart 2: Category Distribution
  const categoryCounts: { [cat: string]: number } = {};
  books.forEach((b) => {
    const cat = b.kategori || 'Umum';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const categoryPieData = Object.keys(categoryCounts).map((cat) => ({
    name: cat,
    value: categoryCounts[cat],
  }));

  const COLORS = ['#2563eb', '#0d9488', '#d97706', '#7c3aed', '#ec4899', '#4b5563'];

  // Top Borrowed Books
  const topBooks = [...books].sort((a, b) => b.totalDipinjam - a.totalDipinjam).slice(0, 4);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* 1. Welcome Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-blue-600/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-blue-100 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Smart Library System Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Selamat Datang, {currentUser?.nama || 'perpussmpkn'}! 👋
            </h1>
            <p className="text-blue-100/90 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Sistem informasi dan otomatisasi perpustakaan sekolah berjalan normal. Pantau sirkulasi buku, peminjaman, dan denda dalam satu halaman terpadu.
            </p>
          </div>

          {/* Action Quick Bar */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenNewLoan}
              className="px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-blue-600" />
              <span>Peminjaman Baru</span>
            </button>
            <button
              onClick={onOpenAddBook}
              className="px-4 py-2.5 bg-blue-500/30 hover:bg-blue-500/40 text-white font-bold text-xs rounded-xl border border-white/20 backdrop-blur-md transition-all active:scale-[0.98] flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Tambah Buku</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Buku */}
        <div 
          onClick={() => onNavigate('buku')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <BookOpen className="w-6 h-6 stroke-[2]" />
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
              {availableCopies} Tersedia
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500">Total Koleksi Buku</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-2xl font-black text-slate-800">{totalBookCopies}</h2>
              <span className="text-xs text-slate-500 font-medium">({totalBookTitles} Judul)</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total User / Anggota */}
        <div 
          onClick={() => onNavigate('user')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Users className="w-6 h-6 stroke-[2]" />
            </div>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              Siswa & Guru
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500">Anggota Terdaftar</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-2xl font-black text-slate-800">{totalUsers}</h2>
              <span className="text-xs text-emerald-600 font-bold">Aktif</span>
            </div>
          </div>
        </div>

        {/* Card 3: Peminjaman Aktif */}
        <div 
          onClick={() => onNavigate('peminjaman')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Handshake className="w-6 h-6 stroke-[2]" />
            </div>
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
              Sedang Dipinjam
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500">Peminjaman Aktif</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-2xl font-black text-slate-800">{activeLoans.length}</h2>
              <span className="text-xs text-slate-500 font-medium">Transaksi</span>
            </div>
          </div>
        </div>

        {/* Card 4: Overdue & Late Fines Alert */}
        <div 
          onClick={() => onNavigate('pengembalian')}
          className={`p-5 rounded-2xl border shadow-xs hover:shadow-md transition-all cursor-pointer group ${
            overdueLoans.length > 0
              ? 'bg-amber-50/80 border-amber-200/80'
              : 'bg-white border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
              overdueLoans.length > 0
                ? 'bg-amber-500 text-white'
                : 'bg-slate-100 text-slate-600'
            }`}>
              <AlertTriangle className="w-6 h-6 stroke-[2]" />
            </div>
            {overdueLoans.length > 0 ? (
              <span className="text-[11px] font-bold text-amber-900 bg-amber-200/80 px-2.5 py-1 rounded-lg animate-pulse">
                Perlu Tindakan
              </span>
            ) : (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                Lancar
              </span>
            )}
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-600">Peminjaman Terlambat</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className={`text-2xl font-black ${overdueLoans.length > 0 ? 'text-amber-900' : 'text-slate-800'}`}>
                {overdueLoans.length}
              </h2>
              <span className="text-xs font-bold text-amber-800">
                (Denda Rp {pendingFinesTotal.toLocaleString('id-ID')})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Quick Action Buttons Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
          Pintasan Menu Cepat (Quick Actions)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <button
            onClick={onOpenNewLoan}
            className="p-3 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/80 rounded-xl text-blue-900 font-bold text-xs flex items-center gap-2.5 transition-all active:scale-[0.98]"
          >
            <Handshake className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="truncate">Peminjaman</span>
          </button>

          <button
            onClick={() => onNavigate('pengembalian')}
            className="p-3 bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200/80 rounded-xl text-emerald-900 font-bold text-xs flex items-center gap-2.5 transition-all active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">Pengembalian</span>
          </button>

          <button
            onClick={onOpenAddBook}
            className="p-3 bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-200/80 rounded-xl text-indigo-900 font-bold text-xs flex items-center gap-2.5 transition-all active:scale-[0.98]"
          >
            <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="truncate">Katalog Buku</span>
          </button>

          <button
            onClick={() => onNavigate('user')}
            className="p-3 bg-violet-50/80 hover:bg-violet-100/80 border border-violet-200/80 rounded-xl text-violet-900 font-bold text-xs flex items-center gap-2.5 transition-all active:scale-[0.98]"
          >
            <Users className="w-4 h-4 text-violet-600 shrink-0" />
            <span className="truncate">Data User</span>
          </button>

          <button
            onClick={() => onNavigate('denda')}
            className="p-3 bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200/80 rounded-xl text-amber-900 font-bold text-xs flex items-center gap-2.5 transition-all active:scale-[0.98]"
          >
            <Receipt className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="truncate">Menu Denda</span>
          </button>

          <button
            onClick={() => onNavigate('backup')}
            className="p-3 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-xl text-slate-800 font-bold text-xs flex items-center gap-2.5 transition-all active:scale-[0.98]"
          >
            <Clock className="w-4 h-4 text-slate-600 shrink-0" />
            <span className="truncate">Backup & Reset</span>
          </button>
        </div>
      </div>

      {/* 4. Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Chart: Tren Peminjaman 7 Hari */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Grafik Sirkulasi Peminjaman & Pengembalian
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">Statistik transaksi mingguan perpustakaan</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span>
                <span className="text-slate-600">Dipinjam</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                <span className="text-slate-600">Dikembalikan</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={loanTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPinjam" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorKembali" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="hari" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px', border: 'none' }} 
                />
                <Area type="monotone" dataKey="Peminjaman" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorPinjam)" />
                <Area type="monotone" dataKey="Pengembalian" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorKembali)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Category Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-indigo-600" />
              Kategori Koleksi Buku
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">Proporsi buku berdasarkan bidang studi</p>
          </div>

          <div className="h-52 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryPieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '10px', color: '#fff', fontSize: '12px', border: 'none' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-1">
            {categoryPieData.map((cat, idx) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span 
                    className="w-2.5 h-2.5 rounded-full shrink-0" 
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }} 
                  />
                  <span className="text-slate-700 truncate">{cat.name}</span>
                </div>
                <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                  {cat.value} judul
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Interactive Alert Section & Top Borrowed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Loans Table Alert */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <h3 className="font-bold text-slate-800 text-base">
                Peminjaman Terlambat ({overdueLoans.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigate('pengembalian')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {overdueLoans.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto stroke-[1.5]" />
              <p className="font-bold text-slate-700 text-sm">Semua Peminjaman Sesuai Jadwal</p>
              <p className="text-slate-400">Tidak ada peminjaman yang melewati tanggal jatuh tempo.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {overdueLoans.map((loan) => (
                <div
                  key={loan.id}
                  className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-center justify-between gap-3 hover:bg-amber-100/60 transition-all"
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-bold text-slate-900 text-xs truncate">{loan.userName}</p>
                    <p className="text-slate-700 text-xs font-medium truncate">"{loan.bookJudul}"</p>
                    <div className="flex items-center gap-2 text-[11px] text-red-600 font-semibold mt-1">
                      <span>Jatuh Tempo: {loan.tanggalJatuhTempo}</span>
                      <span>•</span>
                      <span>Denda: Rp {loan.dendaAmount.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onQuickReturn(loan.id)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs shrink-0 transition-all active:scale-[0.98]"
                  >
                    Proses Kembali
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Borrowed Books */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <BookCheck className="w-5 h-5 text-blue-600" />
              Buku Terpopuler
            </h3>
            <button
              onClick={() => onNavigate('buku')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Katalog Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {topBooks.map((b, idx) => (
              <div
                key={b.id}
                className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-center justify-between gap-3 hover:bg-slate-100/80 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-xs truncate">{b.judul}</p>
                    <p className="text-[11px] text-slate-500 truncate">{b.pengarang} • {b.kategori}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                    {b.totalDipinjam}x dipinjam
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Stok: {b.stokTersedia}/{b.stokTotal}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Recent Activity Log Trail */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-600" />
            Aktivitas Terkini Perpustakaan
          </h3>
          <button
            onClick={() => onNavigate('riwayat')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Lihat Semua Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {activities.slice(0, 5).map((act) => (
            <div key={act.id} className="py-3 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="p-2 bg-slate-100 rounded-xl text-slate-600 mt-0.5 shrink-0">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-800">{act.detail}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Oleh: <span className="font-bold text-slate-600">{act.user}</span> • Kategori:{' '}
                    <span className="font-semibold text-blue-600">{act.kategori}</span>
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-400 shrink-0">{act.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
