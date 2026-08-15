import { db } from '@/db';
import { events, attendees } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { registerAttendee, cancelRegistration } from '@/app/actions';
import { notFound } from 'next/navigation';

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();

  const event = await db.query.events.findFirst({
    where: eq(events.id, id),
  });

  if (!event) {
    notFound();
  }

  const userToken = cookieStore.get(`event_token_${id}`)?.value;

  let isRegistered = false;
  if (userToken) {
    const existing = await db
      .select()
      .from(attendees)
      .where(
        and(
          eq(attendees.eventId, id),
          eq(attendees.userToken, userToken)
        )
      );
    isRegistered = existing.length > 0;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-white border border-indigo-100 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">{event.title}</h1>
          <p className="text-sm text-slate-600">👩‍🏫 Лектор: {event.lecturer}</p>
          <p className="text-sm text-slate-600">
            📅 {new Date(event.eventDate).toLocaleString('uk-UA')}
          </p>
        </div>

        {isRegistered ? (
          <div className="space-y-4">
            <a
              href={event.zoomLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded-xl transition text-sm shadow-md"
            >
              🎥 Приєднатися до Zoom
            </a>

            <form
              action={async () => {
                'use server';
                await cancelRegistration(id);
              }}
            >
              <button
                type="submit"
                className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2.5 rounded-xl transition text-sm"
              >
                Скасувати запис
              </button>
            </form>
          </div>
        ) : (
          <form
            action={async () => {
              'use server';
              await registerAttendee(id);
            }}
          >
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition text-sm shadow-md"
            >
              Зареєструватися на подію
            </button>
          </form>
        )}
      </div>
    </div>
  );
}