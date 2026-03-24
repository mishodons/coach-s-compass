import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Trophy, BarChart3, Clock } from 'lucide-react';

interface StatisticsCardProps {
  playerId: string;
}

export function StatisticsCard({ playerId }: StatisticsCardProps) {
  const [otaProfile, setOtaProfile] = useState<any>(null);
  const [latestRanking, setLatestRanking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [{ data: ota }, { data: ranking }] = await Promise.all([
        supabase
          .from('player_ota_profiles')
          .select('*')
          .eq('player_id', playerId)
          .maybeSingle(),
        supabase
          .from('player_ranking_history')
          .select('*')
          .eq('player_id', playerId)
          .order('recorded_date', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      setOtaProfile(ota);
      setLatestRanking(ranking);
      setLoading(false);
    };
    fetch();
  }, [playerId]);

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-16 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!otaProfile && !latestRanking) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No OTA data available</p>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    {
      icon: Target,
      value: otaProfile?.wtn_singles != null ? otaProfile.wtn_singles.toString() : '—',
      label: 'WTN Singles',
    },
    {
      icon: Trophy,
      value: latestRanking?.ranking != null ? `#${latestRanking.ranking}` : '—',
      label: 'Provincial Ranking',
    },
    {
      icon: BarChart3,
      value: otaProfile ? `${otaProfile.year_wins ?? 0}-${otaProfile.year_losses ?? 0}` : '—',
      label: 'YTD Win-Loss',
    },
    {
      icon: Clock,
      value: otaProfile
        ? `${otaProfile.career_wins ?? 0}-${otaProfile.career_losses ?? 0} (${otaProfile.career_total ?? 0})`
        : '—',
      label: 'Career Win-Loss',
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent">
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xl font-semibold leading-tight">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
