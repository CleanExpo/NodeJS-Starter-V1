'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardCopy, ShoppingCart, Check } from 'lucide-react';
import type { ShoppingListItem } from '@/lib/nutrition/shopping-list';

interface ShoppingListPanelProps {
  planId: string | null;
}

export function ShoppingListPanel({ planId }: ShoppingListPanelProps) {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!planId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/nutrition/shopping-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meal_plan_id: planId }),
      });
      const json = await res.json();
      setItems(json.data || []);
      setGenerated(true);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    const text = items
      .map((item) => {
        const qty = item.total_quantity
          ? `${Math.round(item.total_quantity * 10) / 10} ${item.unit || ''}`
          : '';
        return `- ${item.ingredient_name}${qty ? ` (${qty.trim()})` : ''}`;
      })
      .join('\n');

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!generated) {
    return (
      <Button
        onClick={generate}
        disabled={!planId || loading}
        loading={loading}
        variant="outline"
        leftIcon={<ShoppingCart className="h-4 w-4" />}
      >
        Generate Shopping List
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle as="h3" className="text-lg">
          Shopping List ({items.length} items)
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={copyToClipboard}>
          {copied ? <Check className="mr-1 h-4 w-4" /> : <ClipboardCopy className="mr-1 h-4 w-4" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">Add recipes to your meal plan first.</p>
        ) : (
          <ul className="space-y-1.5">
            {items.map((item, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span>{item.ingredient_name}</span>
                <span className="text-muted-foreground">
                  {item.total_quantity
                    ? `${Math.round(item.total_quantity * 10) / 10} ${item.unit || ''}`
                    : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
