import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Handshake, 
  RotateCcw, 
  Receipt, 
  History, 
  Database, 
  LogOut,
  BookmarkCheck,
  UserCheck,
  Building2
} from 'lucide-react';
import { NavTab, UserMember, SchoolIdentity } from '../types';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentUser: UserMember | null;
  onLogout: () => void;
  overdueCount?: number;
  schoolIdentity?: SchoolIdentity;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onLogout,
  overdueCount = 0,
  schoolIdentity,
}) => {
  const allMenuItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'user', label: 'Data User', icon: <Users className="w-5 h-5" /> },
    { id: 'buku', label: 'Database Buku', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'peminjaman', label: 'Peminjaman Buku', icon: <Handshake className="w-5 h-5" /> },
    { id: 'pengembalian', label: 'Pengembalian Buku', icon: <RotateCcw className="w-5 h-5" />, badge: overdueCount },
    { id: 'denda', label: 'Menu Denda', icon: <Receipt className="w-5 h-5" /> },
    { id: 'riwayat', label: 'Riwayat Aktivitas', icon: <History className="w-5 h-5" /> },
    { id: 'identitas', label: 'Identitas Sekolah', icon: <Building2 className="w-5 h-5" /> },
    { id: 'backup', label: 'Backup & Reset', icon: <Database className="w-5 h-5" /> },
  ];

  const isNotAdmin = currentUser && currentUser.role !== 'Admin';

  const menuItems = isNotAdmin
    ? allMenuItems.filter((item) => item.id === 'denda' || item.id === 'riwayat')
    : allMenuItems;

  const schoolName = schoolIdentity?.namaSekolah || 'Perpus Sekolah';

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 z-30 shrink-0 select-none shadow-xs">
      {/* Top Header */}
      <div>
        <div className="p-5 flex items-center gap-3 border-b border-slate-100">
          <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20 overflow-hidden shrink-0">
            {schoolIdentity?.logoUrl ? (
              <img
                src={schoolIdentity.logoUrl}
                alt="Logo Sekolah"
                className="w-full h-full object-contain bg-white p-0.5"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <BookmarkCheck className="w-6 h-6 stroke-[2.5]" />
            )}
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-slate-900 text-base leading-tight tracking-tight truncate" title={schoolName}>
              {schoolName}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                {currentUser?.role || 'Admin'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Menu List */}
        <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-170px)]">
          {menuItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 active:scale-[0.98]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-slate-500'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white text-blue-700' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Profile Section */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0 border border-slate-300">
              {currentUser?.nama ? currentUser.nama.charAt(0).toUpperCase() : 'P'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-800 truncate">
                {currentUser?.nama || 'perpussmpkn'}
              </p>
              <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-emerald-600" />
                {currentUser?.role || 'Admin'}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Keluar dari Aplikasi"
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
