import { db } from '@/db';
import { events } from '@/db/schema';
import { createEvent, deleteEvent } from '@/app/admin/actions';
import { asc } from 'drizzle-orm';

export default async function AdminPage() {
  // Отримуємо всі події, відсортовані від найближчої
  const allEvents = await db
    .select()
    .from(events)
    .orderBy(asc(events.eventDate));

  const now = new Date();

  return (
    <div className="min-h-screen bg-white text-blue-950 p-6">
      <div className="max-w-4xl  mx-auto p-6 space-y-8">
        {/* 🔴 ФОРМА СТВОРЕННЯ ПОДІЇ */}
        <div className="bg-indigo-100 border border-indigo-500/30 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-bold  flex items-center gap-2">
            ✨ Створити нову подію
          </h2>

          <form action={createEvent} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Назва події */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-indigo-300">
                  Тема
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="Каско"
                  className="w-full bg-white border border-indigo-500/30 rounded-xl px-4 py-2.5 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              {/* Лектор */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-indigo-300">
                  Лектор
                </label>
                <input
                  type="text"
                  name="lecturer"
                  required
                  placeholder="Прізвище Ім'я"
                  className="w-full bg-white border border-indigo-500/30 rounded-xl px-4 py-2.5 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Дата та час проведення */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-indigo-300">
                  Дата та час проведення
                </label>
                <input
                  type="datetime-local"
                  name="eventDate"
                  required
                  className="w-full bg-white border border-indigo-500/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition [color-scheme:dark]"
                />
              </div>

              {/* Посилання на Zoom */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-indigo-300">
                  Посилання на Zoom
                </label>
                <input
                  type="url"
                  name="zoomLink"
                  required
                  placeholder="https://zoom.us/j/..."
                  className="w-full bg-white border border-indigo-500/30 rounded-xl px-4 py-2.5 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            {/* Кнопка створення */}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-indigo-600/30 text-sm mt-2"
            >
              ➕ Створити подію
            </button>
          </form>
        </div>

        {/* 🔴 СПИСОК СТВОРЕНИХ ПОДІЙ */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">
            Створені події 🗓️
          </h2>

          {allEvents.length === 0 ? (
            <div className="bg-indigo-100 border border-slate-700 rounded-2xl p-6 text-center text-slate-400 text-sm">
              Подій поки немає. Створіть першу за допомогою форми вище!
            </div>
          ) : (
            <div className="space-y-3">
              {allEvents.map((event) => {
                const isPast = new Date(event.eventDate) < now;

                return (
                  <div
                    key={event.id}
                    className={`border rounded-2xl p-5 space-y-4 shadow-sm transition ${isPast
                        ? 'bg-indigo-500 border-slate-700/40 opacity-50 grayscale'
                        : 'bg-indigo-100 border-indigo-500/30 hover:border-indigo-500/50'
                      }`}
                  >
                    {/* Верхня панель */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-xl font-bold ">
                        {event.title}
                      </h3>

                      <span className="text-xs font-semibold text-blue-950 bg-indigo-300 px-3.5 py-1.5 rounded-full whitespace-nowrap">
                        📅 {new Date(event.eventDate).toLocaleString('uk-UA', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      <div className="flex items-center gap-4">
                        <span className="text-blue-950 text-sm">
                          👩‍🏫 Лектор: <strong className="font-semibold text-blue-950">{event.lecturer}</strong>
                        </span>

                        {/* Кнопка видалення */}
                        <form action={deleteEvent.bind(null, event.id)}>
                          <button
                            type="submit"
                            className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition text-sm flex items-center justify-center"
                            title="Видалити подію"
                          >
                            🗑️
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* Кнопка Excel */}
                    <div className="pt-3 border-t border-indigo-500/20">
                      <a
                        href={`/api/admin/events/${event.id}/export`}
                        className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl transition shadow-lg text-sm"
                      >
                        📊 Завантажити Excel список
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}