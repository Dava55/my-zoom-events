import { db } from '@/db';
import { events, attendees } from '@/db/schema';
import { asc, eq, and } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { registerAttendee, cancelRegistration } from '@/app/actions';

export default async function HomePage() {
  const allEvents = await db
    .select()
    .from(events)
    .orderBy(asc(events.eventDate));

  const cookieStore = await cookies();

  // Отримуємо списки токенів користувача для всіх подій
  const registeredEventIds = new Set<string>();
  for (const event of allEvents) {
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
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center text-slate-900">
          Актуальні події 🗓️
        </h1>

        {allEvents.length === 0 ? (
          <p className="text-center text-slate-500 text-sm">Подій немає</p>
        ) : (
          <div className="space-y-4">
            {allEvents.map((event) => {
              const isRegistered = registeredEventIds.has(event.id);

              return (
                <div
                  key={event.id}
                  className="bg-white border border-indigo-100 rounded-2xl p-5 shadow-sm space-y-3"
                >
                  <h2 className="text-xl font-bold text-slate-900">
                    {event.title}
                  </h2>
                  <p className="text-sm text-slate-600">
                    👩‍🏫 Лектор: {event.lecturer}
                  </p>
                  <p className="text-xs text-indigo-900 bg-indigo-50 inline-block px-3 py-1 rounded-full">
                    📅 {new Date(event.eventDate).toLocaleString('uk-UA')}
                  </p>

                  <div className="pt-2">
                    {isRegistered ? (
                      <div className="flex gap-2">
                        <a
                          href={event.zoomLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center bg-green-600 hover:bg-green-500 text-white font-semibold py-2 rounded-xl text-sm transition"
                        >
                          🎥 Zoom
                        </a>
                        <form
                          action={async () => {
                            'use server';
                            await cancelRegistration(event.id);
                          }}
                        >
                          <button
                            type="submit"
                            className="bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-4 py-2 rounded-xl text-sm transition"
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
                          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded-xl text-sm transition"
                        >
                          Записатися
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
  );
}