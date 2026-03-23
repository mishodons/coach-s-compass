import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';

interface ScheduleTabProps {
  playerId: string;
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function ScheduleTab({ playerId }: ScheduleTabProps) {
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('schedule_entries')
        .select('*')
        .eq('player_id', playerId)
        .order('day_of_week')
        .order('start_time');
      setEntries(data || []);
    };
    fetch();
  }, [playerId]);

  const byDay = dayNames.map((name, i) => ({
    name,
    entries: entries.filter((e) => e.day_of_week === i),
  }));

  return (
    <div className="grid grid-cols-7 gap-2">
      {byDay.map((day) => (
        <div key={day.name}>
          <p className="text-xs font-medium text-muted-foreground mb-2 text-center">{day.name}</p>
          <div className="space-y-1 min-h-[100px]">
            {day.entries.map((entry) => (
              <Card key={entry.id} className="shadow-none">
                <CardContent className="p-2">
                  <p className="text-xs font-medium">{entry.session_type}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.start_time?.slice(0, 5)}–{entry.end_time?.slice(0, 5)}
                  </p>
                  {entry.location && (
                    <p className="text-xs text-muted-foreground">{entry.location}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
