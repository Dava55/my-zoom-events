import { db } from '@/db';
import { attendees, events } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { registerAttendee, cancelRegistration } from '@/app/actions';
import { asc } from 'drizzle-orm';
import Link from 'next/link';

export default async function HomePage() {
  const cookieStore = await cookies();
  const firstName = cookieStore.get('user_first_name')?.value;
  const lastName = cookieStore.get('user_last_name')?.value;

  // Якщо профіль не заповнений — направляємо на реєстрацію
  if (!firstName || !lastName) {
    redirect('/register');
  }

  const allEvents = await db
    .select()
    .from(events)
    .orderBy(asc(events.eventDate));

  const now = new Date();

  const upcomingEvents = allEvents.filter(
    (event) => new Date(event.eventDate) >= now
  );

  const allAttendees = await db.select().from(attendees);

  return (
    <main className="min-h-screen bg-white text-blue-950 p-6 sm:p-12">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Привітання користувача */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-indigo-100 border border-slate-700/80 rounded-2xl p-6 shadow-xl">
          <div>
            <h1 className="text-2xl font-bold">Вітаємо, {firstName} {lastName}! 👋</h1>
            <p className=" text-sm mt-1">
              Обирайте зустрічі та реєструйтеся на Zoom-конференції
            </p>
          </div>
          <img src="https://sgtas.ua/storage/static_images/f72xl5wbFHlLEuzSKTonsbdizPdXlQkmNk39iHOD.svg" alt="Logo" className="w-50" />
          <Link
            href="/register"
            className="text-xs  hover:text-indigo-300 underline font-medium"
          >
            Змінити свої дані
          </Link>
        </div>

        {/* Список усіх подій */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold ">Доступні зустрічі 📅</h2>

          {upcomingEvents.length === 0 ? (
            <div className="bg-indigo-100 border border-slate-700 rounded-2xl p-8 text-center text-blue-950 text-sm">
              Наразі немає запланованих зустрічей. Завітайте пізніше!
            </div>
          ) : (
            <div className="grid gap-6">
              {upcomingEvents.map((event) => {
                const userToken = cookieStore.get(`event_token_${event.id}`)?.value;
                const isRegistered = allAttendees.some(
                  (a) => a.eventId === event.id && a.userToken === userToken
                );

                return (
                  <div
                    key={event.id}
                    className="bg-indigo-100 border border-slate-700 rounded-2xl p-1 space-y-2 shadow-xl hover:border-slate-600 transition"
                  >
                    {/* Деталі події */}
                    <div className="flex items-center justify-between pt-2 ">
                      <h3 className="text-2xl font-bold text-blue-950">
                        {event.title}
                      </h3>
                      <span className="inline-block text-l font-semibold text-blue-950 bg-indigo-300 px-3 py-1 rounded-full">
                        📅 {new Date(event.eventDate).toLocaleString('uk-UA', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <p className="text-blue-950 text-sm">
                        👨‍🏫 Лектор: <span className="font-semibold text-blue-950">{event.lecturer}</span>
                      </p>
                    </div>

                    {/* Блок запису / Входу в Zoom */}
                    <div className="pt-0.5 border-t border-slate-700/80">
                      {isRegistered ? (
                        <div className="rounded-xl p-4 pt-2 text-center space-y-3">
                          <div className="w-full flex gap-4 items-center">
                            <p className="text-emerald-500 text-base font-semibold flex-1">
                              🎉 Ви зареєстровані!
                            </p>
                            <p className="text-l flex-2 text-left">
                              Приєднатися до зустрічі можна через кнопку нижче,<br />
                              таке ж посилання надійде на пошту за 30 хвилин до початку зустрічі.
                            </p>
                          </div>
                          <div className="w-full flex gap-4 items-center mb-0.5">
                            <a
                              href={event.zoomLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-blue-600 text-white text-center font-semibold py-2 rounded-xl transition shadow-lg shadow-blue-600/30 text-l"
                            >
                              📹 Приєднатися до Zoom
                            </a>

                            <form action={cancelRegistration.bind(null, event.id)}>
                              <button
                                type="submit"
                                className="mx-2 w-full bg-red-400 text-white text-center font-semibold py-2 rounded-xl transition shadow-lg shadow-red-300 text-xs"
                              >
                                Скасувати запис
                              </button>
                            </form>
                          </div>
                        </div>
                      ) : (
                        <form action={registerAttendee.bind(null, event.id)}>
                          <button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                          >
                            <span>Записатися на зустріч</span>
                            <span>🚀</span>
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}