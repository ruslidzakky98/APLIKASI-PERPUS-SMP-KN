import React, { useState, useEffect } from 'react';
import { Search, Bell, Clock, Calendar, CheckCircle, AlertTriangle, X, KeyRound } from 'lucide-react';
import { UserMember, LoanTransaction } from '../types';

interface NavbarProps {
  currentUser: UserMember | null;
  overdueLoans: LoanTransaction[];
  onGlobalSearch: (term: string) => void;
  onNavigateToReturn: () => void;
  onOpenChangePassword?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  overdueLoans,
  onGlobalSearch,
  onNavigateToReturn,
  onOpenChangePassword,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    onGlobalSearch(val);
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      {/* Search Input */}
      <div className="relative w-72 sm:w-96">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Cari buku, ISBN, atau anggota..."
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder-slate-400 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              onGlobalSearch('');
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Date & Live Clock */}
        <div className="hidden md:flex items-center gap-3 text-xs text-slate-600 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl font-medium">
          <div className="flex items-center gap-1.5 text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>{currentDate}</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 text-slate-800 font-mono font-semibold">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>{currentTime}</span>
          </div>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            title="Notifikasi"
          >
            <Bell className="w-5 h-5" />
            {overdueLoans.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-800">Pemberitahuan Sistem</h3>
                  {overdueLoans.length > 0 && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                      {overdueLoans.length}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {overdueLoans.length === 0 ? (
                <div className="py-6 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                  <CheckCircle className="w-8 h-8 text-emerald-500 stroke-[1.5]" />
                  <p>Tidak ada peminjaman terlambat saat ini.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <p className="text-xs font-semibold text-red-600 flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="w-4 h-4" /> Peminjaman Melewati Jatuh Tempo:
                  </p>
                  {overdueLoans.map((loan) => (
                    <div
                      key={loan.id}
                      className="p-3 bg-red-50/60 border border-red-100 rounded-xl text-xs flex items-start justify-between gap-2"
                    >
                      <div>
                        <p className="font-bold text-slate-800">{loan.userName}</p>
                        <p className="text-slate-600 line-clamp-1">"{loan.bookJudul}"</p>
                        <p className="text-red-600 text-[11px] font-medium mt-1">
                          Jatuh Tempo: {loan.tanggalJatuhTempo} | Denda: Rp {loan.dendaAmount.toLocaleString('id-ID')}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          onNavigateToReturn();
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white font-medium px-2.5 py-1 rounded-lg text-[11px] shrink-0"
                      >
                        Proses
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-200">
            {currentUser?.nama ? currentUser.nama.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <span className="block text-xs font-bold text-slate-800 truncate max-w-[120px]">
              {currentUser?.nama || 'perpussmpkn'}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">{currentUser?.role || 'Admin'}</span>
          </div>
          {onOpenChangePassword && (
            <button
              onClick={onOpenChangePassword}
              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors ml-1"
              title="Ganti Password"
            >
              <KeyRound className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
