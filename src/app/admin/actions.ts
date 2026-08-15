'use server'

import { db } from '@/db';
import { events } from '@/db/schema';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';

// 🔑 1. Функція входу в адмінку (яку зараз шукає login/page.tsx)
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

// ➕ 2. Функція створення події
export async function createEvent(formData: FormData) {
  const title = String(formData.get('title') || '').trim();
  const lecturer = String(formData.get('lecturer') || '').trim();
  const eventDate = String(formData.get('eventDate') || '').trim();
  const zoomLink = String(formData.get('zoomLink') || '').trim();

  if (!title) {
    return { success: false, error: 'Вкажіть назву події' };
  }

  if (!lecturer || !eventDate || !zoomLink) {
    return { success: false, error: 'Заповніть усі поля' };
  }

  await db.insert(events).values({
    title,
    lecturer,
    eventDate: new Date(eventDate),
    zoomLink,
  });

  revalidatePath('/');
  revalidatePath('/admin');
  redirect('/admin');
}


// 3. ВИДАЛЕННЯ ПОДІЇ (для адмінів)
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