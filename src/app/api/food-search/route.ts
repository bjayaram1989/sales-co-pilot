import { NextRequest, NextResponse } from 'next/server';

const USDA_API_KEY = process.env.USDA_API_KEY || 'DEMO_KEY';
const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1';

interface USDAFood {
  fdcId: number;
  description: string;
  brandName?: string;
  brandOwner?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  householdServingFullText?: string;
  foodNutrients: Array<{
    nutrientId?: number;
    nutrientName?: string;
    value?: number;
    unitName?: string;
  }>;
}

function extractNutrient(food: USDAFood, nutrientId: number): number {
  const n = food.foodNutrients.find((fn) => fn.nutrientId === nutrientId);
  return n?.value ?? 0;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');
  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const res = await fetch(
      `${USDA_BASE}/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(query)}&pageSize=25&dataType=Foundation,SR Legacy,Branded`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      return NextResponse.json([], { status: 200 });
    }

    const data = await res.json();
    const foods = (data.foods || []) as USDAFood[];

    const results = foods.map((food) => {
      const calories = extractNutrient(food, 1008);
      const protein = extractNutrient(food, 1003);
      const carbs = extractNutrient(food, 1005);
      const fat = extractNutrient(food, 1004);
      const fiber = extractNutrient(food, 1079);

      const servingSizeG = food.servingSize && food.servingSizeUnit?.toLowerCase() === 'g'
        ? food.servingSize
        : 100;

      const servingLabel = food.householdServingFullText || `${servingSizeG}g`;
      const brand = food.brandName || food.brandOwner;

      return {
        id: `usda-${food.fdcId}`,
        name: brand ? `${food.description} (${brand})` : food.description,
        caloriesPer100g: calories,
        proteinPer100g: protein,
        carbsPer100g: carbs,
        fatPer100g: fat,
        fiberPer100g: fiber,
        servingSizeG,
        servingLabel,
        category: 'usda' as const,
      };
    });

    return NextResponse.json(results);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
