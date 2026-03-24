import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

interface RankingProgressionCardProps {
  playerId: string;
}

export function RankingProgressionCard({ playerId }: RankingProgressionCardProps) {
  const [rankingData, setRankingData] = useState<any[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [{ data: rankings }, { data: tourns }] = await Promise.all([
        supabase
          .from('player_ranking_history')
          .select('*')
          .eq('player_id', playerId)
          .order('recorded_date', { ascending: true }),
        supabase
          .from('player_tournaments')
          .select('*')
          .eq('player_id', playerId)
          .order('start_date', { ascending: true }),
      ]);
      setRankingData(rankings || []);
      setTournaments(tourns || []);
      setLoading(false);
    };
    fetch();
  }, [playerId]);

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Ranking Progression</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (rankingData.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Ranking Progression</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Ranking data will appear here once tournament results are recorded.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Build tournament date map for markers
  const tournamentMap = new Map<string, any>();
  tournaments.forEach((t) => {
    if (t.start_date) {
      tournamentMap.set(t.start_date, t);
    }
  });

  const chartData = rankingData.map((r) => ({
    date: r.recorded_date,
    points: Number(r.points) || 0,
    tournament: tournamentMap.get(r.recorded_date) || null,
  }));

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload.tournament) return null;

    const isWinner = payload.tournament.result_summary?.toLowerCase() === 'winner';

    return (
      <g>
        {isWinner ? (
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={14}>
            🏆
          </text>
        ) : (
          <>
            <line x1={cx - 5} y1={cy - 5} x2={cx + 5} y2={cy + 5} stroke="hsl(var(--info))" strokeWidth={2} />
            <line x1={cx + 5} y1={cy - 5} x2={cx - 5} y2={cy + 5} stroke="hsl(var(--info))" strokeWidth={2} />
          </>
        )}
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-card px-3 py-2 text-xs shadow-md">
        <p className="font-medium">{format(new Date(data.date), 'MMM d, yyyy')}</p>
        <p className="text-muted-foreground">Points: {data.points}</p>
        {data.tournament && (
          <p className="text-info mt-1">
            {data.tournament.tournament_name}
            {data.tournament.result_summary ? ` — ${data.tournament.result_summary}` : ''}
          </p>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Ranking Progression</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tickFormatter={(val) => format(new Date(val), 'MMM')}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="points"
                stroke="hsl(var(--info))"
                strokeWidth={2}
                dot={<CustomDot />}
                activeDot={{ r: 4, fill: 'hsl(var(--info))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
