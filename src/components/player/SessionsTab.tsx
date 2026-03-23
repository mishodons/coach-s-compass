import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';

interface SessionsTabProps {
  playerId: string;
  onLogSession: () => void;
}

export function SessionsTab({ playerId, onLogSession }: SessionsTabProps) {
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('session_logs')
        .select(`
          id, session_date, note, duration_minutes,
          coach:coach_id(full_name),
          session_log_skill_items(
            player_skill_items:player_skill_item_id(
              skill_items:skill_item_id(name)
            )
          )
        `)
        .eq('player_id', playerId)
        .order('session_date', { ascending: false });
      setSessions(data || []);
    };
    fetch();
  }, [playerId]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={onLogSession}>
          <Plus className="h-4 w-4 mr-2" /> Log Session
        </Button>
      </div>

      {sessions.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No sessions logged yet</p>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <Card key={s.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {format(new Date(s.session_date), 'MMM d, yyyy')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        by {(s.coach as any)?.full_name}
                      </span>
                      {s.duration_minutes && (
                        <span className="text-xs text-muted-foreground">
                          · {s.duration_minutes} min
                        </span>
                      )}
                    </div>
                    {s.note && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{s.note}</p>}
                    {s.session_log_skill_items?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {s.session_log_skill_items.map((si: any, i: number) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-accent rounded-full">
                            {si.player_skill_items?.skill_items?.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
