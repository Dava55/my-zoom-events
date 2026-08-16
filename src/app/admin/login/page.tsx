'use client';

import { useState } from 'react';
import { loginAdmin } from '@/app/admin/actions';
import { useRouter } from 'next/navigation';

const logoUrl = 'https://sgtas.ua/storage/static_images/f72xl5wbFHlLEuzSKTonsbdizPdXlQkmNk39iHOD.svg';

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
    <main className="flex min-h-screen items-center justify-center bg-[#edf5ff] px-4 py-8 text-[#0d2348]">
      <div className="w-full max-w-md overflow-hidden rounded-[30px] border border-blue-100 bg-white/90 shadow-[0_24px_70px_rgba(42,116,255,0.12)]">
        <div className="flex items-center justify-center gap-4 border-b border-blue-100 bg-blue-50 px-6 py-5">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
            <img src={logoUrl} alt="SG TAS" className="h-12 w-12 object-contain" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-black text-[#0d2348]">Вхід в адмінку</h1>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 text-center">
              <p className="text-sm text-blue-700/80">Введіть пароль адміністратора</p>
            </div>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              required
              className="w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-center text-[#0d2348] placeholder:text-blue-500/60 focus:border-blue-400 focus:outline-none"
            />

            {error && <p className="text-center text-xs font-medium text-red-500">{error}</p>}

            <button
              type="submit"
              className="w-full rounded-xl bg-[#2a74ff] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-[#1f63e6]"
            >
              Увійти
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}