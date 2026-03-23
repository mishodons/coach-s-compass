import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LevelBadge, PlayerStatusBadge, StatusBadge } from '@/components/StatusBadge';
import { ArrowLeft } from 'lucide-react';
import { format, differenceInYears } from 'date-fns';
import { OverviewTab } from '@/components/player/OverviewTab';
import { TrainingPlanTab } from '@/components/player/TrainingPlanTab';
import { SessionsTab } from '@/components/player/SessionsTab';
import { ScheduleTab } from '@/components/player/ScheduleTab';
import { TournamentsTab } from '@/components/player/TournamentsTab';
import { LogSessionDialog } from '@/components/player/LogSessionDialog';

export default function PlayerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [player, setPlayer] = useState<any>(null);
  const [coaches, setCoaches] = useState<any[]>([]);
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

  useEffect(() => {
    fetchPlayer();
  }, [id]);

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
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
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

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="training">Training Plan</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <OverviewTab player={player} onUpdate={fetchPlayer} />
        </TabsContent>
        <TabsContent value="training" className="mt-4">
          <TrainingPlanTab playerId={player.id} />
        </TabsContent>
        <TabsContent value="sessions" className="mt-4">
          <SessionsTab playerId={player.id} onLogSession={() => setLogSessionOpen(true)} />
        </TabsContent>
        <TabsContent value="schedule" className="mt-4">
          <ScheduleTab playerId={player.id} />
        </TabsContent>
        <TabsContent value="tournaments" className="mt-4">
          <TournamentsTab playerId={player.id} />
        </TabsContent>
      </Tabs>

      <LogSessionDialog
        open={logSessionOpen}
        onOpenChange={setLogSessionOpen}
        playerId={player.id}
        onComplete={fetchPlayer}
      />
    </div>
  );
}
