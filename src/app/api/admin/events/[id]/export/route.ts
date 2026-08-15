import { db } from '@/db';
import { attendees, events } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;

    const event = await db.query.events.findFirst({
      where: eq(events.id, eventId),
    });

    if (!event) {
      return new NextResponse('Подію не знайдено', { status: 404 });
    }

    const eventAttendees = await db
      .select()
      .from(attendees)
      .where(eq(attendees.eventId, eventId));

    // Формуємо таблицю Excel
    const excelData = eventAttendees.map((person, index) => ({
      '№': index + 1,
      'Ім’я': person.firstName || '—',
      'Прізвище': person.lastName || '—',
      'ОМ (№ обласної мережі)': person.omNumber || '—',
      'Email': person.email || '—',
      'Дата запису': person.createdAt 
        ? new Date(person.createdAt).toLocaleString('uk-UA') 
        : '—',
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Учасники');

    // Налаштування ширини колонок
    worksheet['!cols'] = [
      { wch: 5 },  // №
      { wch: 18 }, // Ім'я
      { wch: 20 }, // Прізвище
      { wch: 25 }, // ОМ №
      { wch: 28 }, // Email
      { wch: 20 }, // Дата запису
    ];

    const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // 🔴 [ФОРМУВАННЯ НАЗВИ]: Форматуємо дату проведення події у "ДД.ММ.ГГГГ"
    const formattedDate = new Date(event.eventDate).toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    // Очищаємо назву події від некоректних символів для файлової системи
    const cleanTitle = event.title.replace(/[\\/:*?"<>|]/g, '_');

    // Збираємо назву: Тема_Дата.xlsx
    const rawFileName = `${cleanTitle}_${formattedDate}.xlsx`;
    const encodedFileName = encodeURIComponent(rawFileName);

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`,
      },
    });
  } catch (error) {
    console.error('Помилка генерації Excel:', error);
    return new NextResponse('Помилка при створенні Excel-файлу', { status: 500 });
  }
}