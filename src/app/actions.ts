'use server';

import { db } from '@/db';
import { attendees, events, topicRequests } from '@/db/schema';
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

export async function setUserProfile(profile: UserProfile) {
  const { firstName, lastName, omNumber, email } = profile;

  if (!firstName.trim() || !lastName.trim() || !omNumber.trim() || !email.trim()) {
    return { success: false, error: 'Заповніть усі обов’язкові поля' };
  }

  if (!/^\d{2}$/.test(omNumber.trim())) {
    return { success: false, error: 'ОМ має складатися рівно з 2 цифр' };
  }

  const cookieStore = await cookies();
  const maxAge = 60 * 60 * 24 * 365;

  cookieStore.set('user_first_name', firstName.trim(), { httpOnly: true, path: '/', maxAge });
  cookieStore.set('user_last_name', lastName.trim(), { httpOnly: true, path: '/', maxAge });
  cookieStore.set('user_om_number', omNumber.trim(), { httpOnly: true, path: '/', maxAge });
  cookieStore.set('user_email', email.trim(), { httpOnly: true, path: '/', maxAge });

  return { success: true };
}

export async function registerAttendee(eventId: string): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies();

  const firstName = cookieStore.get('user_first_name')?.value;
  const lastName = cookieStore.get('user_last_name')?.value;
  const omNumber = cookieStore.get('user_om_number')?.value;
  const email = cookieStore.get('user_email')?.value;

  if (!firstName || !lastName || !omNumber || !email) {
    return { success: false, error: 'Спочатку заповніть ваші дані' };
  }

  const event = await db.query.events.findFirst({ where: eq(events.id, eventId) });
  if (!event) {
    return { success: false, error: 'Подію не знайдено' };
  }

  const capacity = Number(event.capacity || 90);
  const eventAttendees = await db
    .select()
    .from(attendees)
    .where(eq(attendees.eventId, eventId));

  if (eventAttendees.length >= capacity) {
    cookieStore.set('registration_error', 'вільних місць немає. Невдовзі зможете записатись на інший час', {
      httpOnly: true,
      path: '/',
      maxAge: 30,
    });
    return { success: false, error: 'вільних місць немає. Невдовзі зможете записатись на інший час' };
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
  return { success: true };
}

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

export async function submitTopicRequest(formData: FormData) {
  const cookieStore = await cookies();

  const firstName = String(cookieStore.get('user_first_name')?.value || '').trim();
  const lastName = String(cookieStore.get('user_last_name')?.value || '').trim();
  const omNumber = String(cookieStore.get('user_om_number')?.value || '').trim();
  const email = String(cookieStore.get('user_email')?.value || '').trim();
  const message = String(formData.get('message') || '').trim();

  if (!firstName || !lastName || !omNumber || !email || !message) {
    return { success: false, error: 'Заповніть повідомлення та переконайтесь, що ваші дані внесені' };
  }

  await db.insert(topicRequests).values({
    firstName,
    lastName,
    omNumber,
    email,
    message,
  });

  cookieStore.set('topic_request_success', 'Дякуємо! Ваше повідомлення було передано адміністратору.', {
    httpOnly: true,
    path: '/',
    maxAge: 30,
  });

  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}

export async function createEvent(formData: FormData): Promise<void> {
  const title = formData.get('title') as string;
  const lecturer = formData.get('lecturer') as string;
  const description = (formData.get('description') as string | null)?.trim() || '';
  const eventDateStr = formData.get('eventDate') as string;
  const zoomLink = formData.get('zoomLink') as string;
  const capacityRaw = Number(formData.get('capacity') ?? 90);
  const capacity = Number.isFinite(capacityRaw) ? Math.min(Math.max(capacityRaw, 1), 90) : 90;
  const showAvailability = formData.get('showAvailability') === 'on';

  if (!title || !lecturer || !eventDateStr || !zoomLink) {
    return;
  }

  await db.insert(events).values({
    title,
    lecturer,
    description,
    eventDate: new Date(eventDateStr),
    zoomLink,
    capacity,
    showAvailability,
  });

  revalidatePath('/admin');
  revalidatePath('/');
}

export async function deleteEvent(id: string): Promise<void> {
  await db.delete(events).where(eq(events.id, id));

  revalidatePath('/admin');
  revalidatePath('/');
}