'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Plus, X, Globe, BookOpen } from 'lucide-react';
import { foods, searchFoods } from '@/lib/data/foods';
import type { FoodItem, MealType } from '@/types';
import { cn } from '@/lib/utils';

interface FoodSearchProps {
  meal: MealType;
  onSelect: (food: FoodItem, servings: number) => void;
  onClose: () => void;
}

export function FoodSearch({ meal, onSelect, onClose }: FoodSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [servings, setServings] = useState(1);
  const [tab, setTab] = useState<'local' | 'usda'>('local');
  const [usdaResults, setUsdaResults] = useState<FoodItem[]>([]);
  const [usdaLoading, setUsdaLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const localResults = useMemo(() => {
    if (!query.trim()) return foods.slice(0, 20);
    return searchFoods(query);
  }, [query]);

  // Debounced USDA search
  useEffect(() => {
    if (tab !== 'usda' || !query.trim() || query.length < 2) {
      setUsdaResults([]);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setUsdaLoading(true);
      try {
        const res = await fetch(`/api/food-search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          setUsdaResults(await res.json());
        }
      } catch {
        setUsdaResults([]);
      } finally {
        setUsdaLoading(false);
      }
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [query, tab]);

  const results = tab === 'local' ? localResults : usdaResults;

  const handleConfirm = () => {
    if (selectedFood) {
      onSelect(selectedFood, servings);
      setSelectedFood(null);
      setServings(1);
      setQuery('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
        <h2 className="font-semibold capitalize">Add to {meal}</h2>
      </div>

      {/* Search */}
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tab === 'local' ? 'Search common foods...' : 'Search 300k+ foods (USDA)...'}
            className="flex-1 bg-transparent py-2 text-sm outline-none"
            autoFocus
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => { setTab('local'); setSelectedFood(null); }}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors',
            tab === 'local'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <BookOpen className="h-3.5 w-3.5" />
          Common Foods
        </button>
        <button
          onClick={() => { setTab('usda'); setSelectedFood(null); }}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors',
            tab === 'usda'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Globe className="h-3.5 w-3.5" />
          USDA Database
        </button>
      </div>

      {/* Selected Food Detail */}
      {selectedFood && (
        <div className="border-b border-border bg-primary/5 p-4">
          <h3 className="font-semibold text-sm">{selectedFood.name}</h3>
          <div className="mt-2 flex items-center gap-3">
            <label className="text-sm text-muted-foreground">Servings:</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setServings(Math.max(0.25, servings - 0.25))}
                className="rounded border border-border px-2 py-1 text-sm hover:bg-accent"
              >
                -
              </button>
              <input
                type="number"
                value={servings}
                onChange={(e) => setServings(Math.max(0.25, Number(e.target.value)))}
                step="0.25"
                className="w-16 rounded border border-border bg-background px-2 py-1 text-center text-sm outline-none"
              />
              <button
                onClick={() => setServings(servings + 0.25)}
                className="rounded border border-border px-2 py-1 text-sm hover:bg-accent"
              >
                +
              </button>
              <span className="text-xs text-muted-foreground">
                ({Math.round(selectedFood.servingSizeG * servings)}g)
              </span>
            </div>
          </div>
          <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
            <span>{Math.round(selectedFood.caloriesPer100g * selectedFood.servingSizeG * servings / 100)} cal</span>
            <span>{Math.round(selectedFood.proteinPer100g * selectedFood.servingSizeG * servings / 100)}g P</span>
            <span>{Math.round(selectedFood.carbsPer100g * selectedFood.servingSizeG * servings / 100)}g C</span>
            <span>{Math.round(selectedFood.fatPer100g * selectedFood.servingSizeG * servings / 100)}g F</span>
          </div>
          <button
            onClick={handleConfirm}
            className="mt-3 w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Add to {meal}
          </button>
        </div>
      )}

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'usda' && usdaLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="ml-2 text-sm text-muted-foreground">Searching USDA database...</span>
          </div>
        )}

        {tab === 'usda' && !usdaLoading && query.length >= 2 && results.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No results found. Try a different search term.
          </div>
        )}

        {tab === 'usda' && !query.trim() && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Type at least 2 characters to search the USDA food database.
          </div>
        )}

        {results.map((food) => (
          <button
            key={food.id}
            onClick={() => { setSelectedFood(food); setServings(1); }}
            className={cn(
              'flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-accent',
              selectedFood?.id === food.id && 'bg-primary/5'
            )}
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{food.name}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {food.servingLabel} ({food.servingSizeG}g) &middot;{' '}
                {Math.round(food.caloriesPer100g * food.servingSizeG / 100)} cal
              </div>
            </div>
            <div className="flex gap-3 text-xs text-muted-foreground shrink-0">
              <span className="text-blue-500">{Math.round(food.proteinPer100g * food.servingSizeG / 100)}P</span>
              <span className="text-amber-500">{Math.round(food.carbsPer100g * food.servingSizeG / 100)}C</span>
              <span className="text-red-400">{Math.round(food.fatPer100g * food.servingSizeG / 100)}F</span>
            </div>
            <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
