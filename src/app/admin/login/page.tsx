'use client'

import { useState } from 'react';
import { loginAdmin } from '@/app/admin/actions';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await loginAdmin(password);
    if (res.success) {
      router.push('/admin');
    } else {
      setError(res.error || 'Невірний пароль');
    }
  };

  return (
    <main className="min-h-screen bg-white text-blue-950 flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-indigo-100 border border-slate-700 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Вхід в адмінку 🔐</h1>
          <p className="text-slate-400">Введіть пароль адміністратора</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            required
            className="w-full px-4 py-3 bg-white border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500  text-center"
          />

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 rounded-xl transition"
          >
            Увійти
          </button>
        </form>
      </div>
    </main>
  );
}