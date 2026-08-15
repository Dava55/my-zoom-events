'use server';

import { db } from '@/db';
import { attendees, events } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

export interface UserProfile {
  firstName: string;
  lastName: string;
  omNumber: string;
  email: string;
}

// 🔴 Додаємо збереження профілю в cookies
export async function setUserProfile(profile: UserProfile) {
  const { firstName, lastName, omNumber, email } = profile;

  if (!firstName.trim() || !lastName.trim() || !omNumber.trim() || !email.trim()) {
    return { success: false, error: 'Заповніть усі обов’язкові поля' };
  }

  if (!/^\d{2}$/.test(omNumber.trim())) {
    return { success: false, error: 'ОМ має складатися рівно з 2 цифр' };
  }

  const cookieStore = await cookies();
  const maxAge = 60 * 60 * 24 * 365; // 1 рік

  cookieStore.set('user_first_name', firstName.trim(), { httpOnly: true, path: '/', maxAge });
  cookieStore.set('user_last_name', lastName.trim(), { httpOnly: true, path: '/', maxAge });
  cookieStore.set('user_om_number', omNumber.trim(), { httpOnly: true, path: '/', maxAge });
  cookieStore.set('user_email', email.trim(), { httpOnly: true, path: '/', maxAge });

  return { success: true };
}

// Реєстрація учасника на подію
export async function registerAttendee(eventId: string): Promise<void> {
  const cookieStore = await cookies();
  
  const firstName = cookieStore.get('user_first_name')?.value;
  const lastName = cookieStore.get('user_last_name')?.value;
  const omNumber = cookieStore.get('user_om_number')?.value;
  const email = cookieStore.get('user_email')?.value;

  if (!firstName || !lastName || !omNumber || !email) {
    return;
  }

  let userToken = cookieStore.get(`event_token_${eventId}`)?.value;
  if (!userToken) {
    userToken = crypto.randomUUID();
    cookieStore.set(`event_token_${eventId}`, userToken, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  const existing = await db
    .select()
    .from(attendees)
    .where(
      and(
        eq(attendees.eventId, eventId),
        eq(attendees.userToken, userToken)
      )
    );

  if (existing.length === 0) {
    await db.insert(attendees).values({
      eventId,
      firstName,
      lastName,
      omNumber,
      email,
      userName: `${firstName} ${lastName}`,
      userToken,
    });
  }

  revalidatePath('/');
}

// Скасування запису
export async function cancelRegistration(eventId: string): Promise<void> {
  const cookieStore = await cookies();
  const userToken = cookieStore.get(`event_token_${eventId}`)?.value;

  if (userToken) {
    await db
      .delete(attendees)
      .where(
        and(
          eq(attendees.eventId, eventId),
          eq(attendees.userToken, userToken)
        )
      );
  }

  revalidatePath('/');
}

// Створення події в адмінці
export async function createEvent(formData: FormData): Promise<void> {
  const title = formData.get('title') as string;
  const lecturer = formData.get('lecturer') as string;
  const eventDateStr = formData.get('eventDate') as string;
  const zoomLink = formData.get('zoomLink') as string;

  if (!title || !lecturer || !eventDateStr || !zoomLink) {
    return;
  }

  await db.insert(events).values({
    title,
    lecturer,
    eventDate: new Date(eventDateStr),
    zoomLink,
  });

  revalidatePath('/admin');
  revalidatePath('/');
}

// Видалення події в адмінці
export async function deleteEvent(id: string): Promise<void> {
  await db.delete(events).where(eq(events.id, id));

  revalidatePath('/admin');
  revalidatePath('/');
}