import React, { useState, useEffect } from 'react';
import { NavTab, UserMember, Book, LoanTransaction, FineRecord, ActivityLog, LibraryState, SchoolIdentity } from './types';
import { INITIAL_USERS, INITIAL_BOOKS, INITIAL_LOANS, INITIAL_FINES, INITIAL_ACTIVITIES, INITIAL_SCHOOL_IDENTITY } from './data/initialData';

import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { LoginModal } from './components/LoginModal';
import { DashboardView } from './components/DashboardView';
import { DataUserView } from './components/DataUserView';
import { DatabaseBukuView } from './components/DatabaseBukuView';
import { PeminjamanBukuView } from './components/PeminjamanBukuView';
import { PengembalianBukuView } from './components/PengembalianBukuView';
import { MenuDendaView } from './components/MenuDendaView';
import { RiwayatAktivitasView } from './components/RiwayatAktivitasView';
import { IdentitasSekolahView } from './components/IdentitasSekolahView';
import { BackupResetView } from './components/BackupResetView';
import { ReceiptModal } from './components/ReceiptModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';

const LOCAL_STORAGE_KEY = 'PERPUS_SEKOLAH_DATA_V2';

export default function App() {
  // Load initial state from LocalStorage or Fallback
  const [state, setState] = useState<LibraryState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.error('Failed to parse localStorage:', err);
    }
    return {
      users: INITIAL_USERS,
      books: INITIAL_BOOKS,
      loans: INITIAL_LOANS,
      fines: INITIAL_FINES,
      activities: INITIAL_ACTIVITIES,
      currentUser: INITIAL_USERS[0], // Default logged-in as 'perpussmpkn'
      schoolIdentity: INITIAL_SCHOOL_IDENTITY,
    };
  });

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showChangePassModal, setShowChangePassModal] = useState<boolean>(false);
  const [selectedReceiptLoan, setSelectedReceiptLoan] = useState<LoanTransaction | null>(null);

  // Quick action modal triggers
  const [isOpenAddBookModal, setIsOpenAddBookModal] = useState<boolean>(false);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }
  }, [state]);

  // Enforce Non-Admin Role-Based Access Control (RBAC)
  useEffect(() => {
    if (state.currentUser && state.currentUser.role !== 'Admin') {
      if (currentTab !== 'denda' && currentTab !== 'riwayat') {
        setCurrentTab('denda');
      }
    }
  }, [state.currentUser, currentTab]);

  // Helper to append log
  const logActivity = (
    detail: string,
    action: ActivityLog['action'],
    kategori: ActivityLog['kategori']
  ) => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: state.currentUser?.nama || 'perpussmpkn',
      action,
      detail,
      kategori,
    };
    setState((prev) => ({
      ...prev,
      activities: [newLog, ...prev.activities],
    }));
  };

  // Auth Handlers
  const handleLogin = (user: UserMember) => {
    setState((prev) => ({ ...prev, currentUser: user }));
    setShowLoginModal(false);
    if (user.role !== 'Admin') {
      setCurrentTab('denda');
    }
    logActivity(`Login ke dalam sistem sebagai ${user.role} (${user.nama}).`, 'LOGIN', 'Sistem');
  };

  const handleLogout = () => {
    setShowLoginModal(true);
  };

  const handleUpdatePassword = (userId: string, newPass: string) => {
    setState((prev) => {
      const updatedUsers = prev.users.map((u) => (u.id === userId ? { ...u, password: newPass } : u));
      const updatedCurrentUser =
        prev.currentUser?.id === userId ? { ...prev.currentUser, password: newPass } : prev.currentUser;
      return {
        ...prev,
        users: updatedUsers,
        currentUser: updatedCurrentUser,
      };
    });
    logActivity(`Mengubah kata sandi akun user ID ${userId}.`, 'EDIT', 'User');
  };

  // User Handlers
  const handleAddUser = (newUser: Omit<UserMember, 'id' | 'tanggalDaftar'>) => {
    const created: UserMember = {
      ...newUser,
      id: `usr-${Date.now()}`,
      tanggalDaftar: new Date().toISOString().split('T')[0],
    };
    setState((prev) => ({ ...prev, users: [created, ...prev.users] }));
    logActivity(`Menambahkan anggota baru: ${created.nama} (${created.role}).`, 'TAMBAH', 'User');
  };

  const handleImportUsers = (newUsersList: Omit<UserMember, 'id' | 'tanggalDaftar'>[]) => {
    const today = new Date().toISOString().split('T')[0];
    const createdList: UserMember[] = newUsersList.map((u, idx) => ({
      ...u,
      id: `usr-${Date.now()}-${idx}`,
      tanggalDaftar: today,
    }));

    setState((prev) => ({ ...prev, users: [...createdList, ...prev.users] }));
    logActivity(`Mengimpor ${createdList.length} data anggota baru via Excel/CSV.`, 'TAMBAH', 'User');
  };

  const handleEditUser = (updatedUser: UserMember) => {
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
    }));
    logActivity(`Memperbarui data anggota: ${updatedUser.nama}.`, 'EDIT', 'User');
  };

  const handleDeleteUser = (id: string) => {
    const target = state.users.find((u) => u.id === id);
    if (!target) return;
    if (confirm(`Apakah Anda yakin ingin menghapus anggota ${target.nama}?`)) {
      setState((prev) => ({
        ...prev,
        users: prev.users.filter((u) => u.id !== id),
      }));
      logActivity(`Menghapus anggota: ${target.nama}.`, 'HAPUS', 'User');
    }
  };

  // Book Handlers
  const handleAddBook = (newBook: Omit<Book, 'id' | 'totalDipinjam'>) => {
    const created: Book = {
      ...newBook,
      id: `bk-${Date.now()}`,
      totalDipinjam: 0,
    };
    setState((prev) => ({ ...prev, books: [created, ...prev.books] }));
    logActivity(`Menambahkan judul buku baru: "${created.judul}".`, 'TAMBAH', 'Buku');
  };

  const handleImportBooks = (newBooksList: Omit<Book, 'id' | 'totalDipinjam'>[]) => {
    const createdList: Book[] = newBooksList.map((b, idx) => ({
      ...b,
      id: `bk-${Date.now()}-${idx}`,
      totalDipinjam: 0,
    }));

    setState((prev) => ({ ...prev, books: [...createdList, ...prev.books] }));
    logActivity(`Mengimpor ${createdList.length} judul buku baru via Excel/CSV.`, 'TAMBAH', 'Buku');
  };

  const handleEditBook = (updatedBook: Book) => {
    setState((prev) => ({
      ...prev,
      books: prev.books.map((b) => (b.id === updatedBook.id ? updatedBook : b)),
    }));
    logActivity(`Memperbarui katalog buku: "${updatedBook.judul}".`, 'EDIT', 'Buku');
  };

  const handleDeleteBook = (id: string) => {
    const target = state.books.find((b) => b.id === id);
    if (!target) return;
    if (confirm(`Hapus buku "${target.judul}" dari katalog perpustakaan?`)) {
      setState((prev) => ({
        ...prev,
        books: prev.books.filter((b) => b.id !== id),
      }));
      logActivity(`Menghapus buku dari katalog: "${target.judul}".`, 'HAPUS', 'Buku');
    }
  };

  // Loan Handlers
  const handleAddLoan = (newLoan: Omit<LoanTransaction, 'id'>) => {
    const created: LoanTransaction = {
      ...newLoan,
      id: `loan-${Date.now()}`,
    };

    setState((prev) => {
      // Decrease book stock and increase borrow count
      const updatedBooks = prev.books.map((b) => {
        if (b.id === newLoan.bookId) {
          return {
            ...b,
            stokTersedia: Math.max(0, b.stokTersedia - 1),
            totalDipinjam: b.totalDipinjam + 1,
          };
        }
        return b;
      });

      return {
        ...prev,
        books: updatedBooks,
        loans: [created, ...prev.loans],
      };
    });

    logActivity(
      `Memproses peminjaman buku "${newLoan.bookJudul}" untuk ${newLoan.userName}.`,
      'PINJAM',
      'Transaksi'
    );
  };

  // Return Loan Handler
  const handleReturnLoan = (loanId: string, dendaAmount: number, notes: string) => {
    const todayStr = new Date().toISOString().split('T')[0];

    setState((prev) => {
      const targetLoan = prev.loans.find((l) => l.id === loanId);
      if (!targetLoan) return prev;

      // Update Loan
      const updatedLoans = prev.loans.map((l) => {
        if (l.id === loanId) {
          return {
            ...l,
            status: 'Dikembalikan' as const,
            tanggalKembali: todayStr,
            dendaAmount,
            dendaLunas: dendaAmount === 0,
            catatan: notes,
          };
        }
        return l;
      });

      // Increase book available stock
      const updatedBooks = prev.books.map((b) => {
        if (b.id === targetLoan.bookId) {
          return {
            ...b,
            stokTersedia: Math.min(b.stokTotal, b.stokTersedia + 1),
          };
        }
        return b;
      });

      // Create fine record if late
      let updatedFines = prev.fines;
      if (dendaAmount > 0) {
        const newFineRecord: FineRecord = {
          id: `fn-${Date.now()}`,
          loanId: targetLoan.id,
          userName: targetLoan.userName,
          userNomorInduk: targetLoan.userNomorInduk,
          bookJudul: targetLoan.bookJudul,
          keterangan: `Denda keterlambatan pengembalian`,
          jumlahDenda: dendaAmount,
          tanggalDenda: todayStr,
          statusBayar: 'Belum Bayar',
        };
        updatedFines = [newFineRecord, ...prev.fines];
      }

      return {
        ...prev,
        loans: updatedLoans,
        books: updatedBooks,
        fines: updatedFines,
      };
    });

    logActivity(`Memproses pengembalian buku dari transaksi ${loanId}.`, 'KEMBALI', 'Transaksi');
  };

  // Fine Payment Handlers
  const handlePayFine = (fineId: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setState((prev) => ({
      ...prev,
      fines: prev.fines.map((f) =>
        f.id === fineId
          ? { ...f, statusBayar: 'Lunas' as const, tanggalBayar: todayStr }
          : f
      ),
    }));
    logActivity(`Menerima pembayaran denda ID ${fineId}.`, 'BAYAR_DENDA', 'Denda');
  };

  const handleForgiveFine = (fineId: string) => {
    setState((prev) => ({
      ...prev,
      fines: prev.fines.map((f) =>
        f.id === fineId ? { ...f, statusBayar: 'Dimaafkan' as const } : f
      ),
    }));
    logActivity(`Pembebasan denda untuk ID ${fineId}.`, 'BAYAR_DENDA', 'Denda');
  };

  // School Identity Handler
  const handleSaveSchoolIdentity = (updated: SchoolIdentity) => {
    setState((prev) => ({
      ...prev,
      schoolIdentity: updated,
    }));
    logActivity(`Memperbarui data identitas sekolah: "${updated.namaSekolah}".`, 'EDIT', 'Sistem');
  };

  // Backup & Restore
  const handleRestoreState = (newState: LibraryState) => {
    setState(newState);
    logActivity('Restore data perpustakaan dari file JSON.', 'BACKUP', 'Sistem');
  };

  const handleResetToDefault = () => {
    const resetState: LibraryState = {
      users: INITIAL_USERS,
      books: INITIAL_BOOKS,
      loans: INITIAL_LOANS,
      fines: INITIAL_FINES,
      activities: INITIAL_ACTIVITIES,
      currentUser: INITIAL_USERS[0],
      schoolIdentity: INITIAL_SCHOOL_IDENTITY,
    };
    setState(resetState);
    logActivity('Reset basis data perpustakaan ke awal sampel.', 'BACKUP', 'Sistem');
  };

  // Overdue Loans count for notification
  const overdueLoansList = state.loans.filter((l) => l.status === 'Terlambat');
  const activeSchoolIdentity = state.schoolIdentity || INITIAL_SCHOOL_IDENTITY;

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans antialiased text-slate-800 selection:bg-blue-600 selection:text-white">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentUser={state.currentUser}
        onLogout={handleLogout}
        overdueCount={overdueLoansList.length}
        schoolIdentity={activeSchoolIdentity}
      />

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <Navbar
          currentUser={state.currentUser}
          overdueLoans={overdueLoansList}
          onGlobalSearch={(term) => {
            if (term && currentTab === 'dashboard') {
              setCurrentTab('buku');
            }
          }}
          onNavigateToReturn={() => setCurrentTab('pengembalian')}
          onOpenChangePassword={() => setShowChangePassModal(true)}
        />

        {/* Dynamic Route Content */}
        <main className="flex-1 pb-12">
          {currentTab === 'dashboard' && (
            <DashboardView
              currentUser={state.currentUser}
              books={state.books}
              users={state.users}
              loans={state.loans}
              fines={state.fines}
              activities={state.activities}
              onNavigate={setCurrentTab}
              onQuickReturn={(loanId) => {
                setCurrentTab('pengembalian');
              }}
              onOpenAddBook={() => {
                setCurrentTab('buku');
                setIsOpenAddBookModal(true);
              }}
              onOpenNewLoan={() => setCurrentTab('peminjaman')}
            />
          )}

          {currentTab === 'user' && (
            <DataUserView
              users={state.users}
              onAddUser={handleAddUser}
              onImportUsers={handleImportUsers}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {currentTab === 'buku' && (
            <DatabaseBukuView
              books={state.books}
              onAddBook={handleAddBook}
              onImportBooks={handleImportBooks}
              onEditBook={handleEditBook}
              onDeleteBook={handleDeleteBook}
              isOpenModalImmediately={isOpenAddBookModal}
              onCloseImmediateModal={() => setIsOpenAddBookModal(false)}
            />
          )}

          {currentTab === 'peminjaman' && (
            <PeminjamanBukuView
              users={state.users}
              books={state.books}
              loans={state.loans}
              onAddLoan={handleAddLoan}
            />
          )}

          {currentTab === 'pengembalian' && (
            <PengembalianBukuView
              loans={state.loans}
              onReturnLoan={handleReturnLoan}
              onPrintReceipt={(loan) => setSelectedReceiptLoan(loan)}
            />
          )}

          {currentTab === 'denda' && (
            <MenuDendaView
              fines={state.fines}
              onPayFine={handlePayFine}
              onForgiveFine={handleForgiveFine}
            />
          )}

          {currentTab === 'riwayat' && <RiwayatAktivitasView activities={state.activities} />}

          {currentTab === 'identitas' && (
            <IdentitasSekolahView
              schoolIdentity={activeSchoolIdentity}
              onSaveIdentity={handleSaveSchoolIdentity}
            />
          )}

          {currentTab === 'backup' && (
            <BackupResetView
              state={state}
              onRestoreState={handleRestoreState}
              onResetToDefault={handleResetToDefault}
            />
          )}
        </main>
      </div>

      {/* Login Modal */}
      {showLoginModal && <LoginModal users={state.users} onLogin={handleLogin} />}

      {/* Change Password Modal */}
      {showChangePassModal && (
        <ChangePasswordModal
          currentUser={state.currentUser}
          onClose={() => setShowChangePassModal(false)}
          onUpdatePassword={handleUpdatePassword}
        />
      )}

      {/* Printable Receipt Modal */}
      <ReceiptModal
        loan={selectedReceiptLoan}
        onClose={() => setSelectedReceiptLoan(null)}
        schoolIdentity={activeSchoolIdentity}
      />
    </div>
  );
}
