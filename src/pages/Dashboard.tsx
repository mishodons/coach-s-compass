import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, ClipboardList, ArrowRight } from 'lucide-react';
import { LevelBadge, PlayerStatusBadge } from '@/components/StatusBadge';
import { format, startOfDay, addDays } from 'date-fns';

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ activePlayers: 0, sessionsThisWeek: 0 });
  const [recentPlayers, setRecentPlayers] = useState<any[]>([]);
  const [upcomingSchedule, setUpcomingSchedule] = useState<any[]>([]);

  useEffect(() => {
    if (!profile?.academy_id) return;

    const fetchData = async () => {
      // Active players count
      const { count } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true })
        .eq('academy_id', profile.academy_id!)
        .eq('status', 'active');
      
      // Recent players
      const { data: recent } = await supabase
        .from('players')
        .select('id, full_name, level, status, updated_at, head_coach_id, profiles:head_coach_id(full_name)')
        .eq('academy_id', profile.academy_id!)
        .order('updated_at', { ascending: false })
        .limit(5);

      // Sessions this week
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const { count: sessionCount } = await supabase
        .from('session_logs')
        .select('*', { count: 'exact', head: true })
        .gte('session_date', weekStart.toISOString().split('T')[0]);

      // Upcoming schedule (next 3 days)
      const today = startOfDay(new Date());
      const dayOfWeek = today.getDay();
      const nextDays = [dayOfWeek, (dayOfWeek + 1) % 7, (dayOfWeek + 2) % 7];
      const { data: schedule } = await supabase
        .from('schedule_entries')
        .select('*, players:player_id(full_name)')
        .in('day_of_week', nextDays)
        .order('day_of_week')
        .order('start_time')
        .limit(10);

      setStats({ activePlayers: count || 0, sessionsThisWeek: sessionCount || 0 });
      setRecentPlayers(recent || []);
      setUpcomingSchedule(schedule || []);
    };

    fetchData();
  }, [profile?.academy_id]);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {profile?.full_name || 'Coach'}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent">
                <Users className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.activePlayers}</p>
                <p className="text-sm text-muted-foreground">Active Players</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent">
                <ClipboardList className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.sessionsThisWeek}</p>
                <p className="text-sm text-muted-foreground">Sessions This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Link to="/players">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent">
                    <Users className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Players Directory</p>
                    <p className="text-xs text-muted-foreground">View all players</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Players */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Recent Players</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPlayers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No players yet</p>
            ) : (
              <div className="space-y-3">
                {recentPlayers.map((player) => (
                  <Link
                    key={player.id}
                    to={`/players/${player.id}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{player.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(player.profiles as any)?.full_name || 'Unassigned'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <LevelBadge level={player.level} />
                      <PlayerStatusBadge status={player.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Schedule */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Upcoming Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingSchedule.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No upcoming sessions</p>
            ) : (
              <div className="space-y-3">
                {upcomingSchedule.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-2 rounded-lg bg-accent/30">
                    <div>
                      <p className="text-sm font-medium">{(entry.players as any)?.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.session_type} · {entry.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{dayNames[entry.day_of_week]}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.start_time?.slice(0, 5)} - {entry.end_time?.slice(0, 5)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
