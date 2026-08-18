import { db } from '@/db';
import { topicRequests } from '@/db/schema';
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    const requests = await db.select().from(topicRequests).orderBy(topicRequests.createdAt);

    const excelData = requests.map(
      (
        request: {
          firstName?: string | null;
          lastName?: string | null;
          omNumber?: string | null;
          email?: string | null;
          message?: string | null;
          createdAt?: Date | string | null;
        },
        index: number
      ) => ({
        '№': index + 1,
        'Ім’я': request.firstName || '—',
        'Прізвище': request.lastName || '—',
        'ОМ': request.omNumber || '—',
        'Email': request.email || '—',
        'Повідомлення': request.message || '—',
        'Дата': request.createdAt ? new Date(request.createdAt).toLocaleString('uk-UA') : '—',
      })
    );

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Запити');

    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 18 },
      { wch: 20 },
      { wch: 10 },
      { wch: 28 },
      { wch: 60 },
      { wch: 22 },
    ];

    const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="topic-requests.xlsx"; filename*=UTF-8''topic-requests.xlsx`,
      },
    });
  } catch (error) {
    console.error('Помилка генерації Excel для запитів:', error);
    return new NextResponse('Помилка при створенні Excel-файлу', { status: 500 });
  }
}
