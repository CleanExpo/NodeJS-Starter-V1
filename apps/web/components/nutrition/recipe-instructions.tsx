import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

interface RecipeInstructionsProps {
  instructions: string[];
  fndNotes?: string | null;
}

export function RecipeInstructions({ instructions, fndNotes }: RecipeInstructionsProps) {
  return (
    <div className="space-y-4">
      <ol className="space-y-3">
        {instructions.map((step, i) => (
          <li key={i} className="flex gap-3">
            <span className="bg-primary text-primary-foreground flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium">
              {i + 1}
            </span>
            <p className="pt-0.5 text-sm leading-relaxed">{step}</p>
          </li>
        ))}
      </ol>

      {fndNotes && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
          <CardContent className="flex gap-3 p-4">
            <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Energy-Saving Tip
              </p>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">{fndNotes}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
