import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const url = new URL(request.url);
  const exerciseId = url.searchParams.get('exerciseId');

  const where: Record<string, unknown> = { userId };
  if (exerciseId) where.exerciseId = exerciseId;

  const records = await prisma.personalRecord.findMany({ where });
  return NextResponse.json(records);
}

export async function POST(request: NextRequest) {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const body = await request.json();
  const { exerciseId, exerciseName, weight, reps, date, sessionId } = body;

  const record = await prisma.personalRecord.create({
    data: { userId, exerciseId, exerciseName, weight, reps, date, sessionId },
  });

  return NextResponse.json(record);
}
