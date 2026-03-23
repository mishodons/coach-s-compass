import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LogSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerId: string;
  onComplete: () => void;
}

interface SkillItem {
  id: string;
  skill_item_id: string;
  name: string;
  subcategory: string;
  category: string;
  category_id: string;
  subcategory_id: string;
  status: number;
}

export function LogSessionDialog({ open, onOpenChange, playerId, onComplete }: LogSessionDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [skillItems, setSkillItems] = useState<SkillItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [statusUpdates, setStatusUpdates] = useState<Record<string, number>>({});
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [duration, setDuration] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('player_skill_items')
        .select(`
          id, status, skill_item_id,
          skill_items:skill_item_id(
            name,
            skill_subcategories:subcategory_id(
              id, name,
              skill_categories:category_id(id, name)
            )
          )
        `)
        .eq('player_id', playerId)
        .eq('is_active', true);

      setSkillItems((data || []).map((d: any) => ({
        id: d.id,
        skill_item_id: d.skill_item_id,
        name: d.skill_items?.name || '',
        subcategory: d.skill_items?.skill_subcategories?.name || '',
        subcategory_id: d.skill_items?.skill_subcategories?.id || '',
        category: d.skill_items?.skill_subcategories?.skill_categories?.name || '',
        category_id: d.skill_items?.skill_subcategories?.skill_categories?.id || '',
        status: d.status,
      })));
    };
    fetch();
    setSelectedIds(new Set());
    setStatusUpdates({});
    setNote('');
    setDuration('');
  }, [open, playerId]);

  const toggleItem = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      // Create session log
      const { data: session, error } = await supabase
        .from('session_logs')
        .insert({
          player_id: playerId,
          coach_id: user.id,
          session_date: sessionDate,
          note,
          duration_minutes: duration ? parseInt(duration) : null,
        })
        .select()
        .single();

      if (error) throw error;

      // Associate skill items
      const selectedItems = Array.from(selectedIds);
      if (selectedItems.length > 0) {
        await supabase.from('session_log_skill_items').insert(
          selectedItems.map((psiId) => ({
            session_log_id: session.id,
            player_skill_item_id: psiId,
            status_after_session: statusUpdates[psiId] || null,
          }))
        );

        // Update player_skill_items: increment times_logged, update last_trained_at, apply status changes
        for (const psiId of selectedItems) {
          const updates: any = {
            times_logged: (skillItems.find((s) => s.id === psiId)?.status || 0),
            last_trained_at: new Date().toISOString(),
          };
          // We need to increment, so let's use RPC or just fetch+update
          const item = skillItems.find((s) => s.id === psiId);
          if (statusUpdates[psiId]) {
            updates.status = statusUpdates[psiId];
          }

          await supabase
            .from('player_skill_items')
            .update({
              last_trained_at: new Date().toISOString(),
              ...(statusUpdates[psiId] ? { status: statusUpdates[psiId] } : {}),
            })
            .eq('id', psiId);
        }
      }

      toast({ title: 'Session logged successfully' });
      onOpenChange(false);
      onComplete();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setSaving(false);
  };

  // Group skill items by category → subcategory
  const categories = Array.from(new Set(skillItems.map((i) => i.category_id)));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Log Session</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Session Date</Label>
            <Input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Duration (minutes)</Label>
            <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="60" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Note</Label>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Session notes..." />
        </div>

        <div className="space-y-2">
          <Label>Skill Items Trained</Label>
          <ScrollArea className="h-[300px] border rounded-lg p-2">
            <Accordion type="multiple">
              {categories.map((catId) => {
                const catItems = skillItems.filter((i) => i.category_id === catId);
                const catName = catItems[0]?.category || '';
                const subcats = Array.from(new Set(catItems.map((i) => i.subcategory_id)));

                return (
                  <AccordionItem key={catId} value={catId} className="border-none">
                    <AccordionTrigger className="text-sm py-2 hover:no-underline">{catName}</AccordionTrigger>
                    <AccordionContent>
                      {subcats.map((subId) => {
                        const subItems = catItems.filter((i) => i.subcategory_id === subId);
                        return (
                          <div key={subId} className="pl-2 mb-2">
                            <p className="text-xs font-medium text-muted-foreground mb-1">{subItems[0]?.subcategory}</p>
                            {subItems.map((item) => (
                              <div key={item.id} className="flex items-center gap-2 py-1">
                                <Checkbox
                                  checked={selectedIds.has(item.id)}
                                  onCheckedChange={() => toggleItem(item.id)}
                                />
                                <span className="text-sm flex-1">{item.name}</span>
                                {selectedIds.has(item.id) && (
                                  <Select
                                    value={String(statusUpdates[item.id] || '')}
                                    onValueChange={(v) => setStatusUpdates({ ...statusUpdates, [item.id]: parseInt(v) })}
                                  >
                                    <SelectTrigger className="w-[130px] h-7 text-xs">
                                      <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="1">Incomplete</SelectItem>
                                      <SelectItem value="2">In Progress</SelectItem>
                                      <SelectItem value="3">Complete</SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </ScrollArea>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Session'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
