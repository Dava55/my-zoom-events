import { setUserProfile } from '@/app/actions';
import { redirect } from 'next/navigation';

export default function RegisterPage() {
  async function handleRegister(formData: FormData) {
    'use server';
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const omNumber = formData.get('omNumber') as string;
    const email = formData.get('email') as string;

    // Перевірка на сервері: чи складається ОМ рівно з 2 цифр
    if (!/^\d{2}$/.test(omNumber)) {
      return; // Якщо це не 2 цифри, реєстрація не пройде
    }

    const res = await setUserProfile({ firstName, lastName, omNumber, email });
    if (res.success) {
      redirect('/');
    }
  }

  return (
    <main className="min-h-screen bg-white text-blue-950 flex items-center justify-center p-6">
      <div className="bg-indigo-100 border border-slate-700 rounded-2xl p-8 max-w-2xl w-full space-y-6 shadow-2xl">
        <div>
          <h1 className="text-2xl font-bold text-center">Вас вітає тренінговий центр СГ ТАС</h1>
          <h1 className="text-lg font-bold text-center">Тут ви зможете бачити та відвідувати лекції на різні теми.</h1>
        </div>
        <div className="space-y-2 pt-5 text-center border-t border-slate-700/80">
          <h1 className="text-2xl font-bold">Реєстрація 👋</h1>
          <p className="text-sm font-bold">
            Введіть ваші дані для участі в подіях
          </p>
        </div>

        <form action={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-800 mb-1">
              Ім'я <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              required
              placeholder="Тарас"
              className="w-full px-4 py-2.5 border bg-white border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-800 mb-1">
              Прізвище <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              required
              placeholder="Шевченко"
              className="w-full px-4 py-2.5  border bg-white border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-800 mb-1">
              Номер ОМ (тільки цифри) <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="omNumber"
              required
              maxLength={2}
              pattern="[0-9]{2}"
              inputMode="numeric"
              placeholder="12"
              title="Будь ласка, вкажіть 2 цифри"
              className="w-full px-4 py-2.5  border bg-white border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-800 mb-1">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="example@mail.com"
              className="w-full px-4 py-2.5  border bg-white border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600 font-semibold py-3 rounded-xl transition shadow-lg shadow-indigo-600/30 mt-2"
          >
            Зберегти та продовжити 🚀
          </button>
        </form>
      </div>
    </main>
  );
}