import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { useEffect } from 'react';

interface OverviewTabProps {
  player: any;
  onUpdate: () => void;
}

export function OverviewTab({ player, onUpdate }: OverviewTabProps) {
  const [notes, setNotes] = useState(player.notes_summary || '');
  const [saving, setSaving] = useState(false);
  const [focusItems, setFocusItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchFocus = async () => {
      const { data } = await supabase
        .from('player_skill_items')
        .select('id, status, skill_items:skill_item_id(name, skill_subcategories:subcategory_id(name))')
        .eq('player_id', player.id)
        .eq('status', 2)
        .eq('is_active', true)
        .limit(10);
      setFocusItems(data || []);
    };
    fetchFocus();
  }, [player.id]);

  const saveNotes = async () => {
    setSaving(true);
    await supabase.from('players').update({ notes_summary: notes }).eq('id', player.id);
    setSaving(false);
    onUpdate();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
            placeholder="Player notes, observations, goals..."
          />
          <Button size="sm" onClick={saveNotes} disabled={saving}>
            {saving ? 'Saving...' : 'Save Notes'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Current Focus (In Progress)</CardTitle>
        </CardHeader>
        <CardContent>
          {focusItems.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No skills currently in progress</p>
          ) : (
            <div className="space-y-2">
              {focusItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-accent/30">
                  <div>
                    <p className="text-sm font-medium">{(item.skill_items as any)?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(item.skill_items as any)?.skill_subcategories?.name}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
