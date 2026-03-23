import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';

interface TournamentsTabProps {
  playerId: string;
}

export function TournamentsTab({ playerId }: TournamentsTabProps) {
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('tournament_records')
        .select('*')
        .eq('player_id', playerId)
        .order('start_date', { ascending: false });
      setRecords(data || []);
    };
    fetch();
  }, [playerId]);

  return (
    <div className="space-y-3">
      {records.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No tournament records</p>
      ) : (
        records.map((r) => (
          <Card key={r.id}>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{r.tournament_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.start_date && format(new Date(r.start_date), 'MMM d')}
                    {r.end_date && ` – ${format(new Date(r.end_date), 'MMM d, yyyy')}`}
                  </p>
                </div>
                {r.result && (
                  <span className="text-sm font-medium">{r.result}</span>
                )}
              </div>
              {r.notes && <p className="text-sm text-muted-foreground mt-1">{r.notes}</p>}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
