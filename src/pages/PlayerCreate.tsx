import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function PlayerCreate() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);

  // Form state
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [level, setLevel] = useState<string>('beginner');
  const [headCoachId, setHeadCoachId] = useState('');
  const [assistantCoachIds, setAssistantCoachIds] = useState<string[]>([]);
  const [templateId, setTemplateId] = useState('');

  // Schedule entries
  const [scheduleEntries, setScheduleEntries] = useState<Array<{
    day_of_week: number; start_time: string; end_time: string; session_type: string; location: string;
  }>>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.academy_id) return;
      const [coachRes, templateRes] = await Promise.all([
        supabase.from('profiles').select('id, full_name').eq('academy_id', profile.academy_id!),
        supabase.from('training_templates').select('id, name, level_tag'),
      ]);
      setCoaches(coachRes.data || []);
      setTemplates(templateRes.data || []);
    };
    fetchData();
  }, [profile?.academy_id]);

  const addScheduleEntry = () => {
    setScheduleEntries([...scheduleEntries, {
      day_of_week: 1, start_time: '09:00', end_time: '10:00', session_type: 'Training', location: '',
    }]);
  };

  const handleSave = async () => {
    if (!profile?.academy_id) return;
    setLoading(true);

    try {
      // Create player
      const { data: player, error: playerError } = await supabase
        .from('players')
        .insert({
          academy_id: profile.academy_id,
          full_name: fullName,
          date_of_birth: dob || null,
          level: level as any,
          head_coach_id: headCoachId || null,
        })
        .select()
        .single();

      if (playerError) throw playerError;

      // Assistant coaches
      if (assistantCoachIds.length > 0) {
        await supabase.from('player_assistant_coaches').insert(
          assistantCoachIds.map((cid) => ({ player_id: player.id, coach_id: cid }))
        );
      }

      // Copy template items
      if (templateId) {
        const { data: templateItems } = await supabase
          .from('training_template_items')
          .select('skill_item_id, planned_order, default_status')
          .eq('template_id', templateId);

        if (templateItems && templateItems.length > 0) {
          await supabase.from('player_skill_items').insert(
            templateItems.map((ti) => ({
              player_id: player.id,
              skill_item_id: ti.skill_item_id,
              planned_order: ti.planned_order,
              status: ti.default_status,
            }))
          );
        }
      }

      // Schedule entries
      if (scheduleEntries.length > 0) {
        await supabase.from('schedule_entries').insert(
          scheduleEntries.map((se) => ({ ...se, player_id: player.id }))
        );
      }

      toast({ title: 'Player created successfully' });
      navigate(`/players/${player.id}`);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/players')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold">Add Player</h1>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-foreground' : 'bg-border'}`} />
        ))}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Player name" />
            </div>
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Level</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Assign Coaches</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Head Coach</Label>
              <Select value={headCoachId} onValueChange={setHeadCoachId}>
                <SelectTrigger><SelectValue placeholder="Select head coach" /></SelectTrigger>
                <SelectContent>
                  {coaches.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assistant Coaches (optional)</Label>
              <div className="space-y-2">
                {coaches.filter((c) => c.id !== headCoachId).map((c) => (
                  <label key={c.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={assistantCoachIds.includes(c.id)}
                      onChange={(e) => {
                        if (e.target.checked) setAssistantCoachIds([...assistantCoachIds, c.id]);
                        else setAssistantCoachIds(assistantCoachIds.filter((id) => id !== c.id));
                      }}
                      className="rounded border-input"
                    />
                    {c.full_name}
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Training Template</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select a training template</Label>
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger><SelectValue placeholder="Choose template" /></SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">This will populate the player's skill items from the selected template.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Weekly Schedule (optional)</CardTitle>
              <Button variant="outline" size="sm" onClick={addScheduleEntry}>Add Entry</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {scheduleEntries.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No schedule entries. You can add them later.</p>
            )}
            {scheduleEntries.map((entry, i) => (
              <div key={i} className="grid grid-cols-2 gap-3 p-3 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-xs">Day</Label>
                  <Select
                    value={String(entry.day_of_week)}
                    onValueChange={(v) => {
                      const updated = [...scheduleEntries];
                      updated[i].day_of_week = Number(v);
                      setScheduleEntries(updated);
                    }}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {dayNames.map((d, idx) => (
                        <SelectItem key={idx} value={String(idx)}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Type</Label>
                  <Input
                    value={entry.session_type}
                    onChange={(e) => {
                      const updated = [...scheduleEntries];
                      updated[i].session_type = e.target.value;
                      setScheduleEntries(updated);
                    }}
                    placeholder="Training"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Start</Label>
                  <Input
                    type="time"
                    value={entry.start_time}
                    onChange={(e) => {
                      const updated = [...scheduleEntries];
                      updated[i].start_time = e.target.value;
                      setScheduleEntries(updated);
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">End</Label>
                  <Input
                    type="time"
                    value={entry.end_time}
                    onChange={(e) => {
                      const updated = [...scheduleEntries];
                      updated[i].end_time = e.target.value;
                      setScheduleEntries(updated);
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        {step < 4 ? (
          <Button onClick={() => setStep(step + 1)} disabled={step === 1 && !fullName}>
            Next <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSave} disabled={loading || !fullName}>
            {loading ? 'Creating...' : 'Create Player'}
          </Button>
        )}
      </div>
    </div>
  );
}
