import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LevelBadge, PlayerStatusBadge } from '@/components/StatusBadge';
import { Plus, Search } from 'lucide-react';
import { format } from 'date-fns';

export default function Players() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCoach, setFilterCoach] = useState('all');

  useEffect(() => {
    if (!profile?.academy_id) return;

    const fetchCoaches = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('academy_id', profile.academy_id!);
      setCoaches(data || []);
    };

    fetchCoaches();
  }, [profile?.academy_id]);

  useEffect(() => {
    if (!profile?.academy_id) return;

    const fetchPlayers = async () => {
      let query = supabase
        .from('players')
        .select(`
          id, full_name, level, status, updated_at,
          head_coach:head_coach_id(id, full_name),
          session_logs(session_date)
        `)
        .eq('academy_id', profile.academy_id!)
        .order('updated_at', { ascending: false });

      if (filterLevel !== 'all') query = query.eq('level', filterLevel as any);
      if (filterStatus !== 'all') query = query.eq('status', filterStatus as any);
      if (filterCoach !== 'all') query = query.eq('head_coach_id', filterCoach);

      const { data } = await query;
      setPlayers(data || []);
    };

    fetchPlayers();
  }, [profile?.academy_id, filterLevel, filterStatus, filterCoach]);

  const filtered = players.filter((p) =>
    p.full_name.toLowerCase().includes(search.toLowerCase())
  );

  const getLastSession = (player: any) => {
    const sessions = player.session_logs || [];
    if (sessions.length === 0) return '—';
    const sorted = sessions.sort((a: any, b: any) => b.session_date.localeCompare(a.session_date));
    return format(new Date(sorted[0].session_date), 'MMM d, yyyy');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Players</h1>
        <Button onClick={() => navigate('/players/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Player
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterLevel} onValueChange={setFilterLevel}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCoach} onValueChange={setFilterCoach}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Coach" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Coaches</SelectItem>
            {coaches.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Head Coach</TableHead>
              <TableHead>Last Session</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No players found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((player) => (
                <TableRow
                  key={player.id}
                  className="cursor-pointer hover:bg-accent/50"
                  onClick={() => navigate(`/players/${player.id}`)}
                >
                  <TableCell className="font-medium">{player.full_name}</TableCell>
                  <TableCell><LevelBadge level={player.level} /></TableCell>
                  <TableCell className="text-muted-foreground">
                    {(player.head_coach as any)?.full_name || 'Unassigned'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{getLastSession(player)}</TableCell>
                  <TableCell><PlayerStatusBadge status={player.status} /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
