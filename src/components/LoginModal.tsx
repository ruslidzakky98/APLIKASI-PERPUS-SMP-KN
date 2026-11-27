import React, { useState } from 'react';
import { BookmarkCheck, Lock, User, KeyRound, ArrowRight, ShieldCheck } from 'lucide-react';
import { UserMember } from '../types';

interface LoginModalProps {
  onLogin: (user: UserMember) => void;
  users: UserMember[];
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLogin, users }) => {
  const [username, setUsername] = useState<string>('perpussmpkn');
  const [password, setPassword] = useState<string>('admin123');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const found = users.find(
      (u) =>
        (u.nama.toLowerCase() === username.trim().toLowerCase() || u.nomorInduk === username.trim()) &&
        (u.password ? u.password === password : password === 'admin123' || password === 'siswa123' || password.length > 0)
    );

    if (found) {
      onLogin(found);
    } else {
      const userExists = users.some(
        (u) => u.nama.toLowerCase() === username.trim().toLowerCase() || u.nomorInduk === username.trim()
      );

      if (userExists) {
        setErrorMsg('Kata sandi yang Anda masukkan salah!');
      } else {
        // Fallback admin login if username is perpussmpkn or custom admin
        const adminFallback: UserMember = {
          id: 'usr-admin',
          nomorInduk: '2026001',
          nama: username.trim() || 'perpussmpkn',
          email: 'admin@smpkhairunna.sch.id',
          password: password,
          role: 'Admin',
          kelasJurusan: 'Pengelola Perpustakaan',
          status: 'Aktif',
          telepon: '081234567890',
          tanggalDaftar: new Date().toISOString().split('T')[0],
        };
        onLogin(adminFallback);
      }
    }
  };

  const setDemoUser = (usrName: string) => {
    setUsername(usrName);
    setPassword('admin123');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="w-14 h-14 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-white/20">
            <BookmarkCheck className="w-8 h-8 text-white stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Perpus Sekolah</h2>
          <p className="text-blue-100 text-xs mt-1">Smart Library System & Management Portal</p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-center">
            <h3 className="font-bold text-slate-800 text-base">Masuk ke Akun Admin / Petugas</h3>
            <p className="text-slate-500 text-xs mt-0.5">Silakan isi kredensial untuk melanjutkan</p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Username / Nomor Induk
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: perpussmpkn"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Kata Sandi</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all text-slate-800"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <span>Masuk Aplikasi</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Demo Schnell-Login */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2.5">
              Uji Coba Akun Demo
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDemoUser('perpussmpkn')}
                className="p-2.5 text-left border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 rounded-xl text-xs transition-all"
              >
                <div className="font-bold text-blue-900 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> perpussmpkn
                </div>
                <div className="text-[10px] text-blue-600 mt-0.5">Admin Utama</div>
              </button>

              <button
                onClick={() => setDemoUser('Ahmad Rizky Pratama')}
                className="p-2.5 text-left border border-slate-200 hover:bg-slate-50 rounded-xl text-xs transition-all"
              >
                <div className="font-bold text-slate-800">Ahmad Rizky</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Siswa IX-A</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
