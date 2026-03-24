import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface RecentActivityCardProps {
  playerId: string;
}

export function RecentActivityCard({ playerId }: RecentActivityCardProps) {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('player_matches')
        .select('*, player_tournaments:tournament_id(tournament_name)')
        .eq('player_id', playerId)
        .order('match_date', { ascending: false })
        .limit(10);
      setMatches(data || []);
      setLoading(false);
    };
    fetch();
  }, [playerId]);

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (matches.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No match results yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-xs text-muted-foreground">
              <th className="text-left font-medium px-6 py-2">Opponent</th>
              <th className="text-left font-medium px-3 py-2">Score</th>
              <th className="text-left font-medium px-3 py-2">Result</th>
              <th className="text-left font-medium px-3 py-2">Tournament</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((m) => (
              <tr key={m.id} className="border-b last:border-0">
                <td className="px-6 py-2.5 font-medium">{m.opponent_name || '—'}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{m.score || '—'}</td>
                <td className="px-3 py-2.5">
                  {m.result && (
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        m.result === 'W'
                          ? 'bg-success/15 text-success border-success/30'
                          : 'bg-destructive/15 text-destructive border-destructive/30'
                      )}
                    >
                      {m.result}
                    </Badge>
                  )}
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {(m.player_tournaments as any)?.tournament_name || 'Practice Match'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
