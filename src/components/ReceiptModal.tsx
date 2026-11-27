import React from 'react';
import { BookmarkCheck, Printer, X, CheckCircle2 } from 'lucide-react';
import { LoanTransaction, SchoolIdentity } from '../types';

interface ReceiptModalProps {
  loan: LoanTransaction | null;
  onClose: () => void;
  schoolIdentity?: SchoolIdentity;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ loan, onClose, schoolIdentity }) => {
  if (!loan) return null;

  const handlePrint = () => {
    window.print();
  };

  const schoolName = schoolIdentity?.namaSekolah || 'PERPUSTAKAAN SEKOLAH';
  const schoolAddress = schoolIdentity?.alamat || '';
  const schoolWa = schoolIdentity?.noWa || '';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150 print:m-0 print:border-none print:shadow-none">
        {/* Receipt Header */}
        <div className="p-6 bg-blue-600 text-white text-center relative print:bg-white print:text-black">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white/80 hover:text-white print:hidden"
          >
            <X className="w-5 h-5" />
          </button>
          
          {schoolIdentity?.logoUrl ? (
            <img
              src={schoolIdentity.logoUrl}
              alt="Logo"
              className="w-12 h-12 object-contain mx-auto mb-2 bg-white p-1 rounded-xl shadow-2xs print:border print:border-slate-300"
            />
          ) : (
            <BookmarkCheck className="w-8 h-8 mx-auto mb-2 text-white print:text-blue-600" />
          )}

          <h2 className="font-extrabold text-base uppercase tracking-tight">{schoolName}</h2>
          {schoolAddress && (
            <p className="text-[11px] text-blue-100 mt-0.5 print:text-slate-600 line-clamp-2 leading-tight">
              {schoolAddress}
            </p>
          )}
          {schoolWa && (
            <p className="text-[10px] font-mono text-blue-200 mt-0.5 print:text-slate-700 font-bold">
              WA: {schoolWa}
            </p>
          )}
          <p className="text-blue-100 text-[11px] font-bold mt-1.5 pt-1.5 border-t border-blue-500/50 print:text-slate-700 print:border-slate-200">
            Bukti Transaksi Perpustakaan
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs font-mono">
          <div className="border-b border-dashed border-slate-300 pb-3 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Kode TRX:</span>
              <span className="font-bold text-slate-800">{loan.kodeTransaksi}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Petugas:</span>
              <span className="font-bold text-slate-800">{loan.petugas}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tanggal:</span>
              <span className="font-bold text-slate-800">{loan.tanggalKembali || loan.tanggalPinjam}</span>
            </div>
          </div>

          <div className="space-y-2 border-b border-dashed border-slate-300 pb-3">
            <div>
              <span className="text-slate-400 text-[10px] uppercase">Peminjam</span>
              <p className="font-bold text-slate-900 font-sans text-sm">{loan.userName}</p>
              <p className="text-[11px] text-slate-500">NIS/NIP: {loan.userNomorInduk}</p>
            </div>

            <div className="pt-2">
              <span className="text-slate-400 text-[10px] uppercase">Judul Buku</span>
              <p className="font-bold text-blue-700 font-sans text-xs">"{loan.bookJudul}"</p>
              <p className="text-[11px] text-slate-500">ISBN: {loan.bookIsbn}</p>
            </div>
          </div>

          <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-3">
            <div className="flex justify-between">
              <span className="text-slate-500">Tgl Pinjam:</span>
              <span className="font-bold">{loan.tanggalPinjam}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Jatuh Tempo:</span>
              <span className="font-bold">{loan.tanggalJatuhTempo}</span>
            </div>
            {loan.tanggalKembali && (
              <div className="flex justify-between">
                <span className="text-slate-500">Tgl Kembali:</span>
                <span className="font-bold text-emerald-600">{loan.tanggalKembali}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 text-sm">
              <span className="font-bold text-slate-700">Total Denda:</span>
              <span className="font-black text-slate-900">
                Rp {loan.dendaAmount.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <div className="text-center pt-2 space-y-1">
            <p className="font-sans font-bold text-emerald-600 text-xs flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Transaksi Berhasil Di-proses
            </p>
            <p className="text-[10px] text-slate-400 font-sans">
              Terima kasih telah memanfaatkan fasilitas perpustakaan sekolah.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 print:hidden">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl font-sans"
            >
              Tutup
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-1.5 font-sans"
            >
              <Printer className="w-4 h-4" /> Cetak Struk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
