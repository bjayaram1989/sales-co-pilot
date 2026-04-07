import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const adjustments = await prisma.nutritionAdjustment.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  });

  return NextResponse.json(adjustments);
}

export async function POST(request: NextRequest) {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const body = await request.json();
  const { date, previousCalories, newCalories, reason, weeklyWeightChange } = body;

  const adjustment = await prisma.nutritionAdjustment.create({
    data: { userId, date, previousCalories, newCalories, reason, weeklyWeightChange },
  });

  return NextResponse.json(adjustment);
}
