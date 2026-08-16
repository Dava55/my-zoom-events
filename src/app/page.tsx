import { db } from '@/db';
import { events, attendees } from '@/db/schema';
import { desc, eq, and } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { registerAttendee, cancelRegistration } from '@/app/actions';

const logoUrl = 'https://sgtas.ua/storage/static_images/f72xl5wbFHlLEuzSKTonsbdizPdXlQkmNk39iHOD.svg';

export default async function HomePage() {
  const cookieStore = await cookies();
  const firstName = cookieStore.get('user_first_name')?.value ?? '';
  const lastName = cookieStore.get('user_last_name')?.value ?? '';
  const userName = [firstName, lastName].filter(Boolean).join(' ') || 'Користувач';

  const hasProfile = Boolean(
    firstName &&
    lastName &&
    cookieStore.get('user_om_number')?.value &&
    cookieStore.get('user_email')?.value
  );

  if (!hasProfile) {
    redirect('/register');
  }

  const allEvents = await db
    .select()
    .from(events)
    .orderBy(desc(events.eventDate));

  const upcomingEvents = [...allEvents]
    .filter((event) => new Date(event.eventDate).getTime() >= Date.now())
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

  const registeredEventIds = new Set<string>();
  for (const event of upcomingEvents) {
    const userToken = cookieStore.get(`event_token_${event.id}`)?.value;
    if (userToken) {
      const existing = await db
        .select()
        .from(attendees)
        .where(
          and(
            eq(attendees.eventId, event.id),
            eq(attendees.userToken, userToken)
          )
        );
      if (existing.length > 0) {
        registeredEventIds.add(event.id);
      }
    }
  }

  return (
    <main className="min-h-screen px-4 py-8 text-[#0d2348] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="overflow-hidden rounded-[28px] border border-blue-100 bg-white/90 shadow-[0_20px_60px_rgba(42,116,255,0.12)] backdrop-blur-sm">
          <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
                <img src={logoUrl} alt="SG TAS" className="h-20 w-20 object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-[#0d2348] sm:text-3xl">
                  Актуальні лекції
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-[#0d2348] shadow-sm">
                <span className="text-xs font-semibold tracking-[0.18em] text-blue-600">
                  Користувач
                </span>
                <span className="font-semibold">{userName}</span>
              </div>
              <a
                href="/register"
                className="inline-flex items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-[#0d2348] hover:bg-blue-100"
              >
                Змінити дані
              </a>
              <a
                href="/admin/login"
                className="inline-flex items-center justify-center rounded-xl bg-[#2a74ff] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-[#1f63e6]"
              >
                Адмінка
              </a>
            </div>
          </div>
        </header>

        <section className="space-y-4">
          {upcomingEvents.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-blue-200 bg-white/80 p-8 text-center shadow-[0_16px_40px_rgba(42,116,255,0.08)]">
              <p className="text-xl font-bold text-[#0d2348]">Наразі немає активних лекцій</p>
              <p className="mt-2 text-sm text-blue-700/80">
                Коли адміністратор додасть нову лекцію, вона з’явиться тут автоматично.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((event) => {
                const isRegistered = registeredEventIds.has(event.id);

                return (
                  <article
                    key={event.id}
                    className="rounded-[26px] border border-blue-100 bg-white/90 p-5 shadow-[0_18px_42px_rgba(42,116,255,0.08)] backdrop-blur-sm sm:p-3"
                  >
                    <div className="grid w-full grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(180px,0.9fr)_minmax(0,1fr)] lg:items-center">
                      <h2 className="min-w-0 text-lg font-bold text-[#0d2348] sm:text-xl">
                        {event.title}
                      </h2>

                      <span className="inline-flex w-full items-center justify-start rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-x font-bold text-blue-700 lg:justify-center">
                        📅 {new Date(event.eventDate).toLocaleString('uk-UA', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      <p className="text-x text-blue-700/90 lg:text-right">
                        👩‍🏫 <span className="font-semibold text-[#0d2348]">{event.lecturer}</span>
                      </p>
                    </div>

                    {isRegistered && (
                      <div className="mt-2 flex items-center gap-4 rounded-2xl border border-blue-200 bg-blue-50/80 px-2 py-1 text-sm text-blue-800">
                        <div className="font-bold">📌 Ви зареєстровані.</div>
                        <div className=" text-blue-700/90">
                          Щоб зайти на лекцію, натисніть кнопку нижче. Також це посилання надійде вам на пошту за 30 хвилин до початку лекції. 
                        </div>
                      </div>
                    )}

                    <div className="mt-3 pt-1">
                      {isRegistered ? (
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <a
                            href={event.zoomLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 rounded-xl bg-[#2cc97a] px-4 py-3 text-center text-sm font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-[#2bbd74]"
                          >
                            Натисни, щоб приєднатися до лекції
                          </a>
                          <form
                            action={async () => {
                              'use server';
                              await cancelRegistration(event.id);
                            }}
                          >
                            <button
                              type="submit"
                              className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-100 sm:w-auto"
                            >
                              Скасувати
                            </button>
                          </form>
                        </div>
                      ) : (
                        <form
                          action={async () => {
                            'use server';
                            await registerAttendee(event.id);
                          }}
                        >
                          <button
                            type="submit"
                            className="w-full rounded-xl bg-[#2a74ff] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-[#1f63e6]"
                          >
                            Записатися
                          </button>
                        </form>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}