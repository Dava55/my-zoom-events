'use server'

import { db } from '@/db';
import { events, topicRequests } from '@/db/schema';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';

export async function updateEvent(eventId: string, formData: FormData) {
  const token = (await cookies()).get('admin_token')?.value;

  if (token !== process.env.ADMIN_SECRET_TOKEN) {
    return { success: false, error: 'Немає доступу' };
  }

  const title = String(formData.get('title') || '').trim();
  const lecturer = String(formData.get('lecturer') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const eventDate = String(formData.get('eventDate') || '').trim();
  const zoomLink = String(formData.get('zoomLink') || '').trim();
  const capacityRaw = Number(formData.get('capacity') ?? 90);
  const capacity = Number.isFinite(capacityRaw) ? Math.min(Math.max(capacityRaw, 1), 90) : 90;
  const showAvailability = formData.get('showAvailability') === 'on';

  if (!title || !lecturer || !eventDate || !zoomLink) {
    return { success: false, error: 'Заповніть усі поля' };
  }

  await db.update(events)
    .set({
      title,
      lecturer,
      description,
      eventDate: new Date(eventDate),
      zoomLink,
      capacity,
      showAvailability,
    })
    .where(eq(events.id, eventId));

  revalidatePath('/admin');
  revalidatePath('/');
  return { success: true };
}

export async function loginAdmin(password: string) {
  if (password === process.env.ADMIN_PASSWORD) {
    const cookieStore = await cookies();

    cookieStore.set('admin_token', process.env.ADMIN_SECRET_TOKEN || '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return { success: true };
  }

  return { success: false, error: 'Невірний пароль' };
}

export async function createEvent(formData: FormData) {
  const title = String(formData.get('title') || '').trim();
  const lecturer = String(formData.get('lecturer') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const eventDate = String(formData.get('eventDate') || '').trim();
  const zoomLink = String(formData.get('zoomLink') || '').trim();
  const capacityRaw = Number(formData.get('capacity') ?? 90);
  const capacity = Number.isFinite(capacityRaw) ? Math.min(Math.max(capacityRaw, 1), 90) : 90;
  const showAvailability = formData.get('showAvailability') === 'on';

  if (!title) {
    return { success: false, error: 'Вкажіть назву події' };
  }

  if (!lecturer || !eventDate || !zoomLink) {
    return { success: false, error: 'Заповніть усі поля' };
  }

  await db.insert(events).values({
    title,
    lecturer,
    description,
    eventDate: new Date(eventDate),
    zoomLink,
    capacity,
    showAvailability,
  });

  revalidatePath('/');
  revalidatePath('/admin');
  redirect('/admin');
}

export async function deleteEvent(eventId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (token !== process.env.ADMIN_SECRET_TOKEN) {
    return { success: false, error: 'Немає доступу' };
  }

  try {
    await db.delete(events).where(eq(events.id, eventId));

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    console.error('Помилка видалення:', err);
    return { success: false, error: 'Не вдалося видалити подію' };
  }
}

export async function deleteTopicRequest(requestId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (token !== process.env.ADMIN_SECRET_TOKEN) {
    return { success: false, error: 'Немає доступу' };
  }

  try {
    await db.delete(topicRequests).where(eq(topicRequests.id, requestId));
    revalidatePath('/admin');
    return { success: true };
  } catch (err) {
    console.error('Помилка видалення коментаря:', err);
    return { success: false, error: 'Не вдалося видалити коментар' };
  }
}