import { NextRequest, NextResponse } from 'next/server';

// In-memory store for server-side (in production, use a real database)
// For now, the API route accepts health data and returns it
// The client will poll or the Shortcut will push data

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { apiKey, date, steps, activeCalories, restingHeartRate, weight } = body;

    if (!apiKey || !date) {
      return NextResponse.json(
        { error: 'Missing required fields: apiKey, date' },
        { status: 400 }
      );
    }

    // Validate data types
    const healthData = {
      date: String(date),
      steps: Number(steps) || 0,
      activeCalories: Number(activeCalories) || 0,
      restingHeartRate: restingHeartRate ? Number(restingHeartRate) : undefined,
      weight: weight ? Number(weight) : undefined,
      receivedAt: new Date().toISOString(),
    };

    // In a real deployment, you'd:
    // 1. Validate the API key against a database
    // 2. Store the data in a server-side database
    // 3. The client would then fetch from this API
    //
    // For the local-first version, the Shortcut can save to a
    // JSON file in iCloud Drive that the app reads via file picker,
    // or use this endpoint when deployed.

    console.log('Health sync received:', healthData);

    return NextResponse.json({
      success: true,
      message: 'Health data received',
      data: healthData,
    });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Apple Health Sync API is active',
    usage: 'POST with { apiKey, date, steps, activeCalories, restingHeartRate?, weight? }',
  });
}
