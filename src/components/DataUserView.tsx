import React, { useState } from 'react';
import { Users, UserPlus, Search, Edit3, Trash2, ShieldCheck, Mail, Phone, BookOpen, X, Check, Download, FileSpreadsheet, KeyRound, Upload } from 'lucide-react';
import { UserMember, UserRole } from '../types';
import { exportToCsv } from '../utils/exportCsv';
import { ImportUserModal } from './ImportUserModal';

interface DataUserViewProps {
  users: UserMember[];
  onAddUser: (newUser: Omit<UserMember, 'id' | 'tanggalDaftar'>) => void;
  onImportUsers?: (users: Omit<UserMember, 'id' | 'tanggalDaftar'>[]) => void;
  onEditUser: (user: UserMember) => void;
  onDeleteUser: (id: string) => void;
}

export const DataUserView: React.FC<DataUserViewProps> = ({
  users,
  onAddUser,
  onImportUsers,
  onEditUser,
  onDeleteUser,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('Semua');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserMember | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    nomorInduk: '',
    nama: '',
    email: '',
    password: '',
    role: 'Siswa' as UserRole,
    kelasJurusan: '',
    telepon: '',
    status: 'Aktif' as 'Aktif' | 'Nonaktif' | 'Tersuspend',
  });

  const handleExportSpreadsheet = () => {
    const headers = ['ID', 'NIS/NIP', 'Nama', 'Role', 'Email', 'Kelas/Jabatan', 'No Telepon', 'Status', 'Tanggal Daftar'];
    const rows = filteredUsers.map((u) => [
      u.id,
      u.nomorInduk,
      u.nama,
      u.role,
      u.email,
      u.kelasJurusan || '-',
      u.telepon,
      u.status,
      u.tanggalDaftar,
    ]);
    exportToCsv(`Data_Anggota_Perpus_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.nomorInduk.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'Semua' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({
      nomorInduk: '',
      nama: '',
      email: '',
      password: 'siswa123',
      role: 'Siswa',
      kelasJurusan: '',
      telepon: '',
      status: 'Aktif',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (u: UserMember) => {
    setEditingUser(u);
    setFormData({
      nomorInduk: u.nomorInduk,
      nama: u.nama,
      email: u.email,
      password: u.password || 'admin123',
      role: u.role,
      kelasJurusan: u.kelasJurusan || '',
      telepon: u.telepon,
      status: u.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalEmail = formData.email || `${formData.nama.toLowerCase().replace(/[^a-z0-9]/g, '.')}@perpus.sch.id`;
    const finalPassword = formData.password || 'siswa123';
    const finalData = {
      ...formData,
      email: finalEmail,
      password: finalPassword,
      telepon: formData.telepon || '-',
    };

    if (editingUser) {
      onEditUser({
        ...editingUser,
        ...finalData,
      });
    } else {
      onAddUser(finalData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Data User & Anggota Perpustakaan
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Kelola data siswa, guru, petugas, dan hak akses anggota perpustakaan.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {onImportUsers && (
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              title="Import Banyak Anggota via Excel / CSV"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Import Excel / CSV</span>
            </button>
          )}

          <button
            onClick={handleExportSpreadsheet}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            title="Export Data ke Spreadsheet / Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel / CSV</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Anggota Baru</span>
          </button>
        </div>
      </div>

      {/* Controls & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama, NIS/NIP, atau email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 placeholder-slate-400"
          />
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['Semua', 'Admin', 'Petugas', 'Guru', 'Siswa'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                roleFilter === r
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-5">Nama & NIS/NIP</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Kelas / Jabatan</th>
                <th className="py-3.5 px-4">Kontak</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada data user yang sesuai pencarian.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                          {u.nama.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{u.nama}</p>
                          <p className="text-[11px] text-slate-400 font-mono">NIS/NIP: {u.nomorInduk}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                          u.role === 'Admin'
                            ? 'bg-blue-100 text-blue-800'
                            : u.role === 'Guru'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'Petugas'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-800 font-medium">
                      {u.kelasJurusan || '-'}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="text-slate-800 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" /> {u.email}
                      </p>
                      <p className="text-slate-500 text-[11px] flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> {u.telepon}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          u.status === 'Aktif'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : 'bg-red-50 text-red-700 border border-red-200/60'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Aktif' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {u.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteUser(u.id)}
                          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus User"
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                {editingUser ? 'Edit Data User' : 'Tambah Anggota Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NIS / NIP / ID</label>
                  <input
                    type="text"
                    required
                    value={formData.nomorInduk}
                    onChange={(e) => setFormData({ ...formData, nomorInduk: e.target.value })}
                    placeholder="Contoh: 2026105"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role Anggota</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Siswa">Siswa</option>
                    <option value="Guru">Guru</option>
                    <option value="Petugas">Petugas</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Ahmad Rizky Pratama"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@sekolah.sch.id"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-blue-600" /> Kata Sandi Akun
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Kata sandi login"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500/20 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kelas / Jabatan</label>
                <input
                  type="text"
                  value={formData.kelasJurusan}
                  onChange={(e) => setFormData({ ...formData, kelasJurusan: e.target.value })}
                  placeholder="Contoh: IX-A atau Guru IPA"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. Telepon / WhatsApp</label>
                  <input
                    type="text"
                    required
                    value={formData.telepon}
                    onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                    placeholder="08123456789"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Keanggotaan</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                    <option value="Tersuspend">Tersuspend</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/20"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Import User */}
      {isImportModalOpen && onImportUsers && (
        <ImportUserModal
          onClose={() => setIsImportModalOpen(false)}
          onImportUsers={(newUsers) => {
            onImportUsers(newUsers);
            setIsImportModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
