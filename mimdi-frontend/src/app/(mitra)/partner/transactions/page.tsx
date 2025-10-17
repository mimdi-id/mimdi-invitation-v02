'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

// Tipe data untuk transaksi yang akan ditampilkan
type Transaction = {
  id: string;
  amount: number;
  status: string;
  itemId: string;
  createdAt: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PartnerTransactionsPage() {
  const { token, isLoading: isAuthLoading } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect untuk mengambil data transaksi
  useEffect(() => {
    if (token) {
      const fetchTransactions = async () => {
        try {
          setIsLoading(true);
          const response = await fetch(`${API_URL}/partners/transactions`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) {
            throw new Error('Gagal mengambil riwayat transaksi.');
          }

          const data: Transaction[] = await response.json();
          setTransactions(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        } finally {
          setIsLoading(false);
        }
      };
      fetchTransactions();
    }
  }, [token]);

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Memuat riwayat transaksi...</p>
      </div>
    );
  }
  
  return (
    <div className="p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-slate-900">Riwayat Transaksi Kuota</h1>
        <p className="mt-1 text-slate-600">Daftar semua pembelian kuota yang telah Anda lakukan.</p>

        {error && <p className="mt-4 text-red-600">{error}</p>}

        <div className="mt-8 overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Tanggal</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Deskripsi</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Jumlah</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {transactions.length > 0 ? (
                transactions.map((trx) => (
                  <tr key={trx.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{new Date(trx.createdAt).toLocaleString('id-ID')}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                      Pembelian Kuota ({trx.itemId.replace('quota_', '')} kuota)
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                      Rp {trx.amount.toLocaleString('id-ID')}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                        {trx.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                 <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-slate-500">
                    Anda belum memiliki riwayat transaksi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
