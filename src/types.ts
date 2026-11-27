export type NavTab = 
  | 'dashboard'
  | 'user'
  | 'buku'
  | 'peminjaman'
  | 'pengembalian'
  | 'denda'
  | 'riwayat'
  | 'identitas'
  | 'backup';

export interface SchoolIdentity {
  namaSekolah: string;
  logoUrl: string;
  alamat: string;
  noWa: string;
}

export type UserRole = 'Admin' | 'Petugas' | 'Siswa' | 'Guru';

export interface UserMember {
  id: string;
  nomorInduk: string; // NIS or NIP
  nama: string;
  email: string;
  password?: string;
  role: UserRole;
  kelasJurusan?: string;
  status: 'Aktif' | 'Nonaktif' | 'Tersuspend';
  telepon: string;
  tanggalDaftar: string;
  avatarUrl?: string;
}

export interface Book {
  id: string;
  kodeInduk: string; // Kode Induk Buku
  nomorInduk: string; // Nomor Induk Buku
  judul: string; // Judul Buku
  pengarang: string; // Penulis
  penerbit: string; // Penerbit
  asal: 'Beli' | 'Hibah'; // Asal Buku
  tanggalBeli: string; // Tanggal Beli (YYYY-MM-DD)
  isbn?: string;
  tahunTerbit?: number;
  kategori?: string;
  lokasiRak?: string;
  stokTotal: number;
  stokTersedia: number;
  deskripsi?: string;
  coverUrl?: string;
  totalDipinjam: number;
}

export type LoanStatus = 'Dipinjam' | 'Dikembalikan' | 'Terlambat';

export interface LoanTransaction {
  id: string;
  kodeTransaksi: string;
  userId: string;
  userName: string;
  userNomorInduk: string;
  bookId: string;
  bookJudul: string;
  bookIsbn: string;
  tanggalPinjam: string; // YYYY-MM-DD
  tanggalJatuhTempo: string; // YYYY-MM-DD
  tanggalKembali?: string; // YYYY-MM-DD
  status: LoanStatus;
  dendaAmount: number;
  dendaLunas: boolean;
  petugas: string;
  catatan?: string;
}

export interface FineRecord {
  id: string;
  loanId: string;
  userName: string;
  userNomorInduk: string;
  bookJudul: string;
  keterangan: string;
  jumlahDenda: number;
  tanggalDenda: string;
  statusBayar: 'Belum Bayar' | 'Lunas' | 'Dimaafkan';
  tanggalBayar?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: 'TAMBAH' | 'EDIT' | 'HAPUS' | 'PINJAM' | 'KEMBALI' | 'BAYAR_DENDA' | 'LOGIN' | 'BACKUP';
  detail: string;
  kategori: 'Buku' | 'User' | 'Transaksi' | 'Denda' | 'Sistem';
}

export interface LibraryState {
  users: UserMember[];
  books: Book[];
  loans: LoanTransaction[];
  fines: FineRecord[];
  activities: ActivityLog[];
  currentUser: UserMember | null;
  schoolIdentity?: SchoolIdentity;
}
