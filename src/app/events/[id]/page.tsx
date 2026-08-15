import { db } from '@/db';
import { attendees, events } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { registerAttendee, cancelRegistration } from '@/app/actions';
import Link from 'next/link';

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: eventId } = await params;

  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  });

  if (!event) {
    notFound();
  }

  const eventAttendees = await db
    .select()
    .from(attendees)
    .where(eq(attendees.eventId, eventId));

  const cookieStore = await cookies();
  const currentUserName = cookieStore.get('user_name')?.value;
  const userToken = cookieStore.get(`event_token_${eventId}`)?.value;
  
  const currentAttendee = eventAttendees.find((a) => a.userToken === userToken);

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6 sm:p-12">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <Link 
          href="/" 
          className="inline-flex items-center text-sm text-slate-400 hover:text-white transition"
        >
          ← Назад до всіх подій
        </Link>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          
          <div className="space-y-3">
            <span className="inline-block text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full">
              📅 {new Date(event.eventDate).toLocaleString('uk-UA', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
            <h1 className="text-3xl font-extrabold text-white">{event.title}</h1>
            
            {/* Відображення лектора */}
            <p className="text-slate-300 text-sm">
              👨‍🏫 Лектор: <span className="font-semibold text-white">{event.lecturer}</span>
            </p>
          </div>

          <div className="border-t border-slate-700/80 pt-6">
            {currentAttendee ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center space-y-4">
                <div className="space-y-1">
                  <p className="text-emerald-400 font-semibold text-lg">
                    🎉 Ви успішно записані!
                  </p>
                  <p className="text-slate-300 text-xs">
                    Учасник: <span className="font-bold text-white">{currentAttendee.userName}</span>
                  </p>
                </div>

                {/* Посилання на Zoom стає активним після запису */}
                <a
                  href={event.zoomLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-blue-600/30 text-sm"
                >
                  📹 Приєднатися до Zoom
                </a>

                <form action={cancelRegistration.bind(null, eventId)}>
                  <button
                    type="submit"
                    className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-2.5 rounded-xl text-xs font-medium transition mt-2"
                  >
                    Скасувати запис
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center sm:text-left">
                  <h3 className="font-bold text-lg">Бажаєте приєднатися?</h3>
                </div>

                <form action={registerAttendee.bind(null, eventId)}>
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 rounded-xl transition duration-200 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                  >
                    <span>Підтвердити участь</span>
                    <span>🚀</span>
                  </button>
                </form>
              </div>
            )}
          </div>

        </div>

      </div>
    </main>
  );
}