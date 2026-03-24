import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrainingPlanTab } from './TrainingPlanTab';

interface TrainingPlanCardProps {
  playerId: string;
}

export function TrainingPlanCard({ playerId }: TrainingPlanCardProps) {
  const [completion, setCompletion] = useState<{ complete: number; total: number } | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('player_skill_items')
        .select('status')
        .eq('player_id', playerId)
        .eq('is_active', true);
      if (data) {
        setCompletion({
          total: data.length,
          complete: data.filter((d: any) => d.status === 3).length,
        });
      }
    };
    fetch();
  }, [playerId]);

  const pct = completion && completion.total > 0
    ? Math.round((completion.complete / completion.total) * 100)
    : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Training Plan</CardTitle>
          {completion && (
            <span className="text-sm text-muted-foreground">{pct}% complete</span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <TrainingPlanTab playerId={playerId} />
      </CardContent>
    </Card>
  );
}
