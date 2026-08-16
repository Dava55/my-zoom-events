import { db } from '@/db';
import { events, attendees } from '@/db/schema';
import { createEvent, deleteEvent } from '@/app/admin/actions';
import { desc, eq } from 'drizzle-orm';

const logoUrl = 'https://sgtas.ua/storage/static_images/f72xl5wbFHlLEuzSKTonsbdizPdXlQkmNk39iHOD.svg';

export default async function AdminPage() {
  const allEvents = await db
    .select()
    .from(events)
    .orderBy(desc(events.eventDate));

  const attendeeCounts = new Map<string, number>();
  for (const event of allEvents) {
    const eventAttendees = await db
      .select()
      .from(attendees)
      .where(eq(attendees.eventId, event.id));

    attendeeCounts.set(event.id, eventAttendees.length);
  }

  const now = new Date();
  const orderedEvents = [...allEvents].sort(
    (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
  );

  return (
    <div className="min-h-screen bg-[#edf5ff] px-4 py-8 text-[#0d2348] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="overflow-hidden rounded-[28px] border border-blue-100 bg-white/90 px-5 py-4 shadow-[0_18px_45px_rgba(42,116,255,0.09)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
                <img src={logoUrl} alt="SG TAS" className="h-12 w-12 object-contain" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-blue-600">
                   ADMIN
                </p>
                <h1 className="text-xl font-black text-[#0d2348]">Адміністративна панель</h1>
              </div>
            </div>

            <a
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-[#0d2348] hover:bg-blue-100"
            >
              ← На сайт
            </a>
          </div>
        </header>

        <div className="rounded-[28px] border border-blue-100 bg-white/90 p-6 shadow-[0_16px_40px_rgba(42,116,255,0.08)]">
          <h2 className="mb-4 text-xl font-bold text-[#0d2348]">✨ Створити нову подію</h2>

          <form
            action={async (formData: FormData) => {
              'use server';
              await createEvent(formData);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200/80">
                  Тема
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="напр. Каско"
                  className="w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-[#0d2348] placeholder:text-blue-500/60 focus:border-blue-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200/80">
                  Лектор
                </label>
                <input
                  type="text"
                  name="lecturer"
                  required
                  placeholder="напр. Прізвище Ім'я"
                  className="w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-[#0d2348] placeholder:text-blue-500/60 focus:border-blue-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200/80">
                  Дата та час проведення
                </label>
                <input
                  type="datetime-local"
                  name="eventDate"
                  required
                  className="w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-[#0d2348] focus:border-blue-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200/80">
                  Посилання на Zoom
                </label>
                <input
                  type="url"
                  name="zoomLink"
                  required
                  placeholder="https://zoom.us/j/..."
                  className="w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-[#0d2348] placeholder:text-blue-500/60 focus:border-blue-400 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-[#2a74ff] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-[#1f63e6]"
            >
              ➕ Створити подію
            </button>
          </form>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#0d2348]">Створені події 🗓️</h2>

          {orderedEvents.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-blue-200 bg-white/80 p-6 text-center text-sm text-blue-700">
              Подій поки немає. Створіть першу за допомогою форми вище!
            </div>
          ) : (
            <div className="space-y-3">
              {orderedEvents.map((event) => {
                const isPast = new Date(event.eventDate) < now;

                return (
                  <div
                    key={event.id}
                    className={`rounded-[26px] border p-5 shadow-[0_16px_40px_rgba(42,116,255,0.08)] transition ${
                      isPast
                        ? 'border-slate-200 bg-slate-50/90 text-slate-700 opacity-80'
                        : 'border-blue-100 bg-white/95 text-[#0d2348]'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-xl font-bold text-[#0d2348]">{event.title}</h3>

                      <span
                        className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap ${
                          isPast ? 'bg-slate-200 text-slate-700' : 'border border-blue-200 bg-blue-50 text-blue-700'
                        }`}
                      >
                        📅 {new Date(event.eventDate).toLocaleString('uk-UA', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      <div className="flex items-center gap-3">
                        <span className="text-sm text-blue-800/90">
                          👩‍🏫 Лектор:{' '}
                          <strong className="text-[#0d2348]">{event.lecturer}</strong>
                        </span>

                        <div
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            isPast ? 'bg-slate-200 text-slate-700' : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {attendeeCounts.get(event.id) ?? 0} зареєстровано
                        </div>

                        <form
                          action={async () => {
                            'use server';
                            await deleteEvent(event.id);
                          }}
                        >
                          <button
                            type="submit"
                            className={`flex items-center justify-center rounded-lg p-1.5 text-sm transition ${
                              isPast ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-500 hover:bg-red-50 hover:text-red-600'
                            }`}
                            title="Видалити подію"
                          >
                            🗑️
                          </button>
                        </form>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-blue-100 pt-3">
                      <a
                        href={`/api/admin/events/${event.id}/export`}
                        className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition ${
                          isPast ? 'bg-slate-500 hover:bg-slate-600' : 'bg-[#2a74ff] hover:bg-[#1f63e6]'
                        }`}
                      >
                        📊 Завантажити Excel список
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}