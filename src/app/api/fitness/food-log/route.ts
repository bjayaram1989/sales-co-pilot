import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const url = new URL(request.url);
  const date = url.searchParams.get('date');
  const startDate = url.searchParams.get('startDate');
  const endDate = url.searchParams.get('endDate');

  const where: Record<string, unknown> = { userId };
  if (date) {
    where.date = date;
  } else if (startDate && endDate) {
    where.date = { gte: startDate, lte: endDate };
  }

  const entries = await prisma.foodLogEntry.findMany({ where });
  return NextResponse.json(entries);
}

export async function POST(request: NextRequest) {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const body = await request.json();
  const { date, foodItemId, foodName, servings, servingSizeG, meal, calories, protein, carbs, fat, fiber } = body;

  const entry = await prisma.foodLogEntry.create({
    data: { userId, date, foodItemId, foodName, servings, servingSizeG, meal, calories, protein, carbs, fat, fiber },
  });

  return NextResponse.json(entry);
}

export async function PUT(request: NextRequest) {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const body = await request.json();
  const { id, ...data } = body;

  const entry = await prisma.foodLogEntry.updateMany({
    where: { id, userId },
    data,
  });

  return NextResponse.json(entry);
}

export async function DELETE(request: NextRequest) {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  await prisma.foodLogEntry.deleteMany({ where: { id, userId } });
  return NextResponse.json({ success: true });
}
