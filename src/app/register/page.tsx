import { setUserProfile } from '@/app/actions';
import { redirect } from 'next/navigation';

const logoUrl = 'https://sgtas.ua/storage/static_images/f72xl5wbFHlLEuzSKTonsbdizPdXlQkmNk39iHOD.svg';

export default function RegisterPage() {
  async function handleRegister(formData: FormData) {
    'use server';
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const omNumber = formData.get('omNumber') as string;
    const email = formData.get('email') as string;

    if (!/^\d{2}$/.test(omNumber)) {
      return;
    }

    const res = await setUserProfile({ firstName, lastName, omNumber, email });
    if (res.success) {
      redirect('/');
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#edf5ff] px-4 py-8 text-[#0d2348]">
      <div className="w-full max-w-2xl overflow-hidden rounded-[30px] border border-blue-100 bg-white/90 shadow-[0_24px_70px_rgba(42,116,255,0.12)]">
        <div className="flex items-center justify-center gap-4 border-b border-blue-100 bg-blue-50 px-6 py-5">
          <div className="flex h-26 w-36 items-center justify-center overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
            <img src={logoUrl} alt="SG TAS" className="h-16 w-16 object-contain" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-black text-[#0d2348]">Вас вітає тренінговий центр<br />
            <div className="text-sm text-blue-700/80">
              тут ви зможете бачити актуальний перелік лекцій та зареєструватися для участі
            </div>
            </h1>
          </div>
        </div>

        <div className="space-y-6 p-6 sm:p-8">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-black text-[#0d2348]">Реєстрація 👋</h2>
            <p className="text-sm text-blue-700/80">
              Введіть ваші дані
            </p>
          </div>

          <form action={handleRegister} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium tracking-[0.18em] text-blue-900">
                Ім'я <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                required
                placeholder="Тарас"
                className="w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-[#0d2348] placeholder:text-blue-500/60 focus:border-blue-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium tracking-[0.18em] text-blue-900">
                Прізвище <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                required
                placeholder="Шевченко"
                className="w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-[#0d2348] placeholder:text-blue-500/60 focus:border-blue-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium tracking-[0.18em] text-blue-900">
                Номер ОМ (тільки цифри) <span className="text-red-500">*</span>
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
                className="w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-[#0d2348] placeholder:text-blue-500/60 focus:border-blue-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium tracking-[0.18em] text-blue-900">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="example@mail.com"
                className="w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-[#0d2348] placeholder:text-blue-500/60 focus:border-blue-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-[#2a74ff] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-[#1f63e6]"
            >
              Зберегти та продовжити 🚀
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}