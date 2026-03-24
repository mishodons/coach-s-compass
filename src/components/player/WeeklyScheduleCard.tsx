import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, MapPin } from 'lucide-react';

interface WeeklyScheduleCardProps {
  playerId: string;
}

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
// Map display index (0=Mon) to DB day_of_week (1=Mon...7=Sun in our mapping, or 0=Sun...6=Sat)
// The existing ScheduleTab uses 0=Sunday. We'll keep that but display Mon-Sun.
const dayMapping = [1, 2, 3, 4, 5, 6, 0]; // Mon=1, Tue=2...Sat=6, Sun=0

export function WeeklyScheduleCard({ playerId }: WeeklyScheduleCardProps) {
  const [entries, setEntries] = useState<any[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<any>(null);

  const fetchEntries = async () => {
    const { data } = await supabase
      .from('schedule_entries')
      .select('*')
      .eq('player_id', playerId)
      .order('day_of_week')
      .order('start_time');
    setEntries(data || []);
  };

  useEffect(() => { fetchEntries(); }, [playerId]);

  const openEdit = (entry?: any) => {
    setEditEntry(entry || { player_id: playerId, day_of_week: 1, start_time: '09:00', end_time: '10:00', session_type: '', location: '' });
    setEditOpen(true);
  };

  const saveEntry = async () => {
    if (!editEntry) return;
    if (editEntry.id) {
      await supabase.from('schedule_entries').update({
        day_of_week: editEntry.day_of_week,
        start_time: editEntry.start_time,
        end_time: editEntry.end_time,
        session_type: editEntry.session_type,
        location: editEntry.location,
      }).eq('id', editEntry.id);
    } else {
      await supabase.from('schedule_entries').insert(editEntry);
    }
    setEditOpen(false);
    fetchEntries();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Weekly Schedule</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {dayLabels.map((label, idx) => {
          const dayNum = dayMapping[idx];
          const dayEntries = entries.filter((e) => e.day_of_week === dayNum);
          if (dayEntries.length === 0) return null;
          return dayEntries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 rounded-md border px-3 py-2 cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => openEdit(entry)}
            >
              <span className="text-xs font-medium text-muted-foreground w-8">{label}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{entry.session_type || 'Session'}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{entry.start_time?.slice(0, 5)}–{entry.end_time?.slice(0, 5)}</span>
                  {entry.location && (
                    <span className="flex items-center gap-0.5">
                      <MapPin className="h-3 w-3" />
                      {entry.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ));
        })}

        {entries.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">No schedule entries yet.</p>
        )}

        <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => openEdit()}>
          <Plus className="h-4 w-4 mr-1" /> Add Slot
        </Button>
      </CardContent>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editEntry?.id ? 'Edit Slot' : 'Add Slot'}</DialogTitle>
          </DialogHeader>
          {editEntry && (
            <div className="space-y-3">
              <div>
                <Label>Day</Label>
                <Select
                  value={String(editEntry.day_of_week)}
                  onValueChange={(v) => setEditEntry({ ...editEntry, day_of_week: Number(v) })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {dayLabels.map((l, i) => (
                      <SelectItem key={i} value={String(dayMapping[i])}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Start</Label>
                  <Input type="time" value={editEntry.start_time} onChange={(e) => setEditEntry({ ...editEntry, start_time: e.target.value })} />
                </div>
                <div>
                  <Label>End</Label>
                  <Input type="time" value={editEntry.end_time} onChange={(e) => setEditEntry({ ...editEntry, end_time: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Type</Label>
                <Input value={editEntry.session_type || ''} onChange={(e) => setEditEntry({ ...editEntry, session_type: e.target.value })} placeholder="e.g. Private Lesson" />
              </div>
              <div>
                <Label>Location</Label>
                <Input value={editEntry.location || ''} onChange={(e) => setEditEntry({ ...editEntry, location: e.target.value })} placeholder="e.g. Court 3" />
              </div>
              <Button className="w-full" onClick={saveEntry}>Save</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
