import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LevelBadge, PlayerStatusBadge } from '@/components/StatusBadge';
import { ArrowLeft } from 'lucide-react';
import { format, differenceInYears } from 'date-fns';
import { StatisticsCard } from '@/components/player/StatisticsCard';
import { RankingProgressionCard } from '@/components/player/RankingProgressionCard';
import { RecentActivityCard } from '@/components/player/RecentActivityCard';
import { TrainingPlanCard } from '@/components/player/TrainingPlanCard';
import { WeeklyScheduleCard } from '@/components/player/WeeklyScheduleCard';
import { SkillSessionsCard } from '@/components/player/SkillSessionsCard';
import { LogSessionDialog } from '@/components/player/LogSessionDialog';

export default function PlayerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [player, setPlayer] = useState<any>(null);
  const [assistantCoaches, setAssistantCoaches] = useState<any[]>([]);
  const [logSessionOpen, setLogSessionOpen] = useState(false);

  const fetchPlayer = async () => {
    if (!id) return;
    const { data } = await supabase
      .from('players')
      .select('*, head_coach:head_coach_id(id, full_name)')
      .eq('id', id)
      .single();
    setPlayer(data);

    const { data: ac } = await supabase
      .from('player_assistant_coaches')
      .select('coach_id, profiles:coach_id(full_name)')
      .eq('player_id', id);
    setAssistantCoaches(ac || []);
  };

  useEffect(() => { fetchPlayer(); }, [id]);

  const toggleStatus = async () => {
    if (!player) return;
    const newStatus = player.status === 'active' ? 'inactive' : 'active';
    await supabase.from('players').update({ status: newStatus }).eq('id', player.id);
    setPlayer({ ...player, status: newStatus });
  };

  if (!player) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const age = player.date_of_birth
    ? differenceInYears(new Date(), new Date(player.date_of_birth))
    : null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header — full width */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/players')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">{player.full_name}</h1>
              <LevelBadge level={player.level} />
              <PlayerStatusBadge status={player.status} />
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              {age !== null && <span>{age} years old</span>}
              <span>Coach: {(player.head_coach as any)?.full_name || 'Unassigned'}</span>
              {assistantCoaches.length > 0 && (
                <span>
                  Assistants: {assistantCoaches.map((ac: any) => (ac.profiles as any)?.full_name).join(', ')}
                </span>
              )}
              {player.start_date && <span>Started: {format(new Date(player.start_date), 'MMM d, yyyy')}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={toggleStatus}>
            {player.status === 'active' ? 'Deactivate' : 'Activate'}
          </Button>
          <Button size="sm" onClick={() => setLogSessionOpen(true)}>
            Log Session
          </Button>
        </div>
      </div>

      {/* Two-column dashboard layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* Left/Center column */}
        <div className="space-y-6">
          <StatisticsCard playerId={player.id} />
          <RankingProgressionCard playerId={player.id} />
          <RecentActivityCard playerId={player.id} />
          <TrainingPlanCard playerId={player.id} />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <WeeklyScheduleCard playerId={player.id} />
          <SkillSessionsCard playerId={player.id} />
        </div>
      </div>

      <LogSessionDialog
        open={logSessionOpen}
        onOpenChange={setLogSessionOpen}
        playerId={player.id}
        onComplete={fetchPlayer}
      />
    </div>
  );
}
