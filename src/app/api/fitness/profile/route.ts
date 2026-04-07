import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const profile = await prisma.fitnessProfile.findUnique({ where: { userId } });
  return NextResponse.json(profile);
}

export async function PUT(request: NextRequest) {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const body = await request.json();
  const { name, age, gender, heightCm, currentWeightLbs, targetWeightLbs, activityLevel, goal, experienceLevel, preferredSplit, healthSyncApiKey } = body;

  const profile = await prisma.fitnessProfile.upsert({
    where: { userId },
    update: {
      name, age, gender, heightCm, currentWeightLbs, targetWeightLbs,
      activityLevel, goal, experienceLevel, preferredSplit, healthSyncApiKey,
    },
    create: {
      userId, name, age, gender, heightCm, currentWeightLbs, targetWeightLbs,
      activityLevel, goal, experienceLevel, preferredSplit, healthSyncApiKey,
    },
  });

  return NextResponse.json(profile);
}
